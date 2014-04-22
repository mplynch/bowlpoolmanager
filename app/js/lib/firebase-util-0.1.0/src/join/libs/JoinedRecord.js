(function(exports, fb) {
   "use strict";
   var undefined;
   var util = fb.pkg('util');
   var log  = fb.pkg('log');
   var join = fb.pkg('join');
   var EVENTS = ['child_added', 'child_removed', 'child_changed', 'child_moved', 'value'];

   /**
    * @class JoinedRecord
    * @extends {join.Observer}
    * @param {...object} firebaseRef
    * @constructor
    */
   function JoinedRecord(firebaseRef) {
      this._super(this, EVENTS, util.bindAll(this, {
         onEvent: this._eventTriggered,
         onAdd: this._monitorEvent,
         onRemove: this._stopMonitoringEvent
      }));
      this.joinedParent = null;
      this.paths = [];
      this.sortPath = null;
      this.sortedChildKeys = [];
      this.childRecs = {};
      // values in this hash may be null, use util.has() when
      // checking to see if a record exists!
      this.loadingChildRecs = {};
      this.priorValue = undefined;
      this.currentValue = undefined;
      this.currentPriority = null;
      this.prevChildName  = null;
      this.intersections = [];
      this.refName = null;
      this.rootRef = null;
      this.queue = this._loadPaths(Array.prototype.slice.call(arguments));
   }

   JoinedRecord.prototype = {
      auth: function(authToken, onComplete, onCancel) {
         var args = util.Args('auth', Array.prototype.slice.call(arguments), 1, 3);
         authToken = args.nextReq('string');
         onComplete = args.next('function');
         onCancel = args.next('function');
         this.queue.done(function() {
            this.sortPath.ref().auth(authToken, onComplete, onCancel);
         }, this);
      },

      unauth: function() {
         this.queue.done(function() {
            this.sortPath.ref().unauth();
         }, this);
      },

      on: function(eventType, callback, cancelCallback, context) {
         var args = util.Args('on', Array.prototype.slice.call(arguments), 2, 4);
         eventType = args.nextFromReq(EVENTS);
         callback = args.nextReq('function');
         cancelCallback = args.next('function');
         context = args.next('object');
         this.queue.done(function() {
            var obs = this.observe(eventType, callback, wrapFailCallback(cancelCallback), context);
            this._triggerPreloadedEvents(eventType, obs);
         }, this);
         return callback;
      },

      off: function(eventType, callback, context) {
         var args = util.Args('off', Array.prototype.slice.call(arguments), 0, 3);
         eventType = args.nextFrom(EVENTS);
         callback = args.next('function');
         context = args.next('object');
         this.queue.done(function() {
            this.stopObserving(eventType, callback, context);
         }, this);
         return this;
      },

      once: function(eventType, callback, failureCallback, context) {
         var args = util.Args('once', Array.prototype.slice.call(arguments), 2, 4);
         eventType = args.nextFromReq(EVENTS);
         callback = args.nextReq('function');
         failureCallback = args.next('function');
         context = args.next('object');
         var fn = function(snap, prevChild) {
            if( typeof(callback) === util.Observer )
               callback.notify(snap, prevChild);
            else
               callback.call(context, snap, prevChild);
            this.off(eventType, fn, this);
         };
         this.on(eventType, fn, failureCallback, this);
         return callback;
      },

      child: function(childPath) {
         var args = util.Args('child', Array.prototype.slice.call(arguments), 1, 1);
         childPath = args.nextReq(['string', 'number']);
         var rec;
         var parts = (childPath+'').split('/'), firstPart = parts.shift();
         if( this._isChildLoaded(firstPart) ) {
            // I already have this child record loaded so just return it
            rec = this._getJoinedChild(firstPart);
         }
         else {
            // this is the joined parent, so we fetch a JoinedRecord as the child
            // this constructor syntax is for internal use only and not documented in the API
            rec = new JoinedRecord(firstPart, this);
         }

         // we've only processed the first bit of the child path, so if there are more, fetch them here
         return parts.length? rec.child(parts.join('/')) : rec;
      },

      parent:          function() {
         if( !this.joinedParent ) {
            throw new util.NotSupportedError('Cannot call parent() on a joined record');
         }
         return this.joinedParent;
      },

      name: function() {
         return this.refName;
      },

      set: function(value, onComplete) {
         var args = util.Args('set', Array.prototype.slice.call(arguments), 1, 2).skip();
         onComplete = args.next('function', util.noop);
         this.queue.done(function() {
            if( assertWritable(this.paths, onComplete) && assertValidSet(this.paths, value, onComplete) ) {
               var parsedValue = extractValueForSetOps(value, isSinglePrimitive(this.paths)? this.paths[0] : null);
               var pri = extractPriorityForSetOps(value);
               if( pri !== undefined ) { this.currentPriority = pri; }
               var q = util.createQueue();
               util.each(this.paths, function(path) {
                  q.addCriteria(function(cb) {
                     path.pickAndSet(parsedValue, cb, pri);
                  });
               });
               q.handler(onComplete);
            }
         }, this);
      },

      setWithPriority: function(value, priority, onComplete) {
         if( !util.isObject(value) ) {
            value = {'.value': value};
         }
         else {
            value = util.extend({}, value);
         }
         value['.priority'] = priority;
         return this.set(value, onComplete);
      },

      setPriority:     function(priority, onComplete) {
         var args = util.Args('setPriority', Array.prototype.slice.call(arguments), 1, 2);
         priority = args.nextReq(true);
         onComplete = args.next('function', util.noop);
         this.queue.done(function() {
            if( assertWritable(this.paths, onComplete) ) {
               this.sortPath.ref().setPriority(priority, onComplete);
            }
         }, this);
      },

      update:          function(value, onComplete) {
         onComplete = util.Args('set', Array.prototype.slice.call(arguments), 1, 2).skip().next('function', util.noop);
         this.queue.done(function() {
            if( assertWritable(this.paths, onComplete) && assertValidSet(this.paths, value, onComplete) ) {
               var parsedValue = extractValueForSetOps(value, isSinglePrimitive(this.paths)? this.paths[0] : null);
               var q = util.createQueue();
               util.each(this.paths, function(path) {
                  q.addCriteria(function(cb) {
                     path.pickAndUpdate(parsedValue, cb);
                  });
               });
               q.handler(onComplete);
            }
         }, this);
      },

      remove: function(onComplete) {
         onComplete = util.Args('remove', Array.prototype.slice.call(arguments), 0, 1).next('function', util.noop);
         this.queue.done(function() {
            var q = util.createQueue();
            util.each(this.paths, function(path) {
               q.addCriteria(function(cb) {
                  path.remove(cb);
               })
            });
            q.handler(onComplete);
         }, this);
      },

      push: function(value, onComplete) {
         var args = util.Args('remove', Array.prototype.slice.call(arguments), 0, 2);
         value = args.next();
         onComplete = args.next('function', util.noop);
         var child = this.child(this.rootRef.push().name());
         if( !util.isEmpty(value) ) {
            child.set(value, onComplete);
         }
         return child;
      },

      root:            function() { return this.rootRef; },
      ref:             function() { return this; },

      toString: function() { return '['+util.map(this.paths, function(p) { return p.toString(); }).join('][')+']'; },

      //////// methods that are not allowed
      onDisconnect:    function() { throw new util.NotSupportedError('onDisconnect() not supported on JoinedRecord'); },
      limit:           function() { throw new util.NotSupportedError('limit not supported on JoinedRecord; try calling limit() on ref before passing into join'); },
      endAt:           function() { throw new util.NotSupportedError('endAt not supported on JoinedRecord; try calling endAt() on ref before passing into join'); },
      startAt:         function() { throw new util.NotSupportedError('startAt not supported on JoinedRecord; try calling startAt() on ref before passing into join'); },
      transaction:     function() { throw new util.NotSupportedError('transactions not supported on JoinedRecord'); },

      _monitorEvent: function(eventType) {
         if( this.getObservers(eventType).length === 1 ) {
            this.queue.done(function() {
               paths = this.joinedParent || !this.intersections.length? this.paths : this.intersections;
               if( this.hasObservers(eventType) && !paths[0].hasObservers(eventType) ) {
                  var paths;
                  (this.joinedParent? log.debug : log)('JoinedRecord(%s) Now observing event "%s"', this.name(), eventType);
                  if( this.joinedParent ) {
                     util.call(paths, 'observe', eventType, this._pathNotification, this);
                  }
                  else if( !paths[0].hasObservers() ) {
                     log.info('JoinedRecord(%s) My first observer attached, loading my joined data and Firebase connections', this.name());
                     // this is the first observer, so start up our path listeners
                     util.each(paths, function(path) {
                        util.each(eventsToMonitor(this, path), function(event) {
                           path.observe(event, this._pathNotification, this._pathCancelled, this);
                        }, this)
                     }, this);
                  }
               }
            }, this);
         }
      },

      _stopMonitoringEvent: function(eventType, obsList) {
         var obsCountRemoved = obsList.length;
         this.queue.done(function() {
            if( obsCountRemoved && !this.hasObservers(eventType) ) {
               (this.joinedParent? log.debug : log)('JoinedRecord(%s) Stopped observing %s events', this.name(), eventType? '"'+eventType+'"' : '');
               if( this.joinedParent ) {
                  util.call(this.paths, 'stopObserving', eventType, this._pathNotification, this);
               }
               else if( !this.hasObservers() ) {
                  log.info('JoinedRecord(%s) My last observer detached, releasing my joined data and Firebase connections', this.name());
                  // nobody is monitoring this event anymore, so we'll stop monitoring the path now
                  // and clear all our cached info (reset to nothing)
                  var paths = this.intersections.length? this.intersections : this.paths;
                  util.call(paths, 'stopObserving');
                  var oldRecs = this.childRecs;
                  this.childRecs = {};
                  util.each(oldRecs, this._removeChildRec, this);
                  this.sortedChildKeys = [];
                  this.currentValue = undefined;
                  this.priorValue = undefined;
               }
            }
         }, this);
      },

      /**
       * This is the primary callback used by each Path to notify us that a change has occurred.
       *
       * For a joined child (a record with an id), this monitors all events and triggers them directly
       * from here.
       *
       * But for a joined parent (the master paths where we are fetching joined records from), this method monitors
       * only child_added and child_moved events. Everything else is triggered by watching the child records directly.
       *
       * @param {join.Path} path
       * @param {String} event
       * @param {String} childName
       * @param mappedVals
       * @param {String|null|undefined} prevChild
       * @param {int|null|undefined} priority
       * @private
       */
      _pathNotification: function(path, event, childName, mappedVals, prevChild, priority) {
         var rec;
         log('JoinedRecord(%s) Received "%s" from Path(%s): %s%s %j', this.name(), event, path.name(), event==='value'?'' : childName+': ', prevChild === undefined? '' : '->'+prevChild, mappedVals);

         if( path === this.sortPath && event === 'value' ) {
            this.currentPriority = priority;
         }

         if( this.joinedParent ) {
            // most of the child record events are just pretty much a passthrough
            switch(event) {
               case 'value':
                  this._myValueChanged();
                  break;
               default:
                  this.triggerEvent(event, makeSnap(this.child(childName), mappedVals));
            }
         }
         else {
            rec = this.child(childName);
            switch(event) {
               case 'child_added':
                  if( mappedVals !== null ) {
                     this._pathAddEvent(path, rec, prevChild);
                  }
                  break;
               case 'child_moved':
                  if( this.sortPath === path ) {
                     rec.currentPriority = priority;
                     this._moveChildRec(rec, prevChild);
                  }
                  break;
            }
         }
      },

      _isValueLoaded: function() {
         return this.currentValue !== undefined;
      },

      _isChildLoaded: function(key) {
         if( util.isObject(key) ) { key = key.name(); }
         return this._getJoinedChild(key) !== undefined;
      },

      _pathCancelled: function(err) {
         err && this.abortObservers(err);
      },

      // must be called before any on/off events
      _loadPaths: function(pathArgs) {
         var pathLoader = new join.PathLoader(pathArgs);
         this.joinedParent = pathLoader.joinedParent;
         this.refName = pathLoader.refName;
         this.rootRef = pathLoader.rootRef;
         this.paths = pathLoader.finalPaths;

         return util
            .createQueue()
            .chain(pathLoader.queue)
            .done(this._assertSortPath, this)
            .done(function() {
               this.intersections = pathLoader.intersections;
               this.sortPath = pathLoader.sortPath;
               log.info('JoinedRecord(%s) is ready for use (all paths and dynamic keys loaded)', this.name());
            }, this)
            .fail(function() {
               var name = this.name();
               util.each(Array.prototype.slice.call(arguments), function(err) {
                  log.error('Path(%s): %s', name, err);
               });
               log.error('JoinedRecord(%s) could not be loaded.', name);
            }, this);
      },

      /**
       * Called when a child_added event occurs on a Path I monitor. This does not necessarily result
       * in a child record. But it does result in immediately loading all the joined paths and determining
       * if the record is complete enough to add.
       *
       * @param {join.Path} path
       * @param {JoinedRecord} rec
       * @param {String|null} prevName
       * @returns {*}
       * @private
       */
      _pathAddEvent: function(path, rec, prevName) {
         this._assertIsParent('_pathAddEvent');
         // The child may already exist if another Path has declared it
         // or it may be loading as we speak, so evaluate each case
         var childName = rec.name();
         var isLoading = util.has(this.loadingChildRecs, childName);
         if( !isLoading && !this._isChildLoaded(childName) ) {
            // the record is new: not currently loading and not loaded before
            if( !rec._isValueLoaded() ) {
               log.debug('JoinedRecord(%s) Preloading value for child %s in prep to add it', this.name(), rec.name());
               // the record has no value yet, so we fetch it and then we call _addChildRec again
               this.loadingChildRecs[childName] = prevName;
               rec.once('value', function() {
                  // if the loadingChildRecs entry has been deleted, then the record was immediately removed
                  // after adding it, so don't do anything here, just ignore it
                  if( util.has(this.loadingChildRecs, childName) ) {
                     // the prevName may have been updated while we were fetching the value so we use
                     // the cached one here instead of the prevName argument
                     var prev = this.loadingChildRecs[childName];
                     rec.prevChildName = prev;
                     delete this.loadingChildRecs[childName];
                     this._addChildRec(rec, prev);
                  }
               }, this);
            }
            else {
               this._addChildRec(rec, prevName);
            }
         }
         else if( path === this.sortPath ) {
            // the rec has already been added by at least one other path but this is the sortPath,
            // so it may have been put temporarily into the wrong place based on another path's sort info
            if( isLoading ) {
               // the rec is still loading, so simply change the prev record id
               this.loadingChildRecs[childName] = prevName;
            }
            else {
               // the child has already loaded from another path (this should only happen for unions)
               // so we move it instead
               this._moveChildRec(rec, prevName);
            }
         }
      },

      // only applicable to the parent joined path
      _addChildRec: function(rec, prevName) {
         this._assertIsParent('_addChildRec');
         var childName = rec.name();
         if( rec.currentValue !== null && !this._isChildLoaded(childName) ) {
            log('JoinedRecord(%s) Added child rec %s after %s', this.name(), rec.name(), prevName);
            // the record is new and has already loaded its value and no intersection path returned null,
            // so now we can add it to our child recs
            this._placeRecAfter(rec, prevName);
            this.childRecs[childName] = rec;
            if( this._isValueLoaded() && !util.has(this.currentValue, childName) ) {
               // we only store the currentValue on this record if somebody is monitoring it,
               // otherwise we have to perform a wasteful on('value',...) for all my join paths each
               // time there is a change
               this._setMyValue(join.sortSnapshotData(this, this.currentValue, makeSnap(rec)));
            }
            this.triggerEvent('child_added', makeSnap(rec));
            rec.on('value', this._updateChildRec, this);
         }
         return rec;
      },

      // only applicable to the parent join path
      _removeChildRec: function(rec) {
         this._assertIsParent('_removeChildRec');
         var childName = rec.name();
         rec.off(null, this._updateChildRec, this);
         if( this._isChildLoaded(rec) ) {
            log('JoinedRecord(%s) Removed child rec %s', this.name(), rec);
            var i = util.indexOf(this.sortedChildKeys, childName);
//            rec.off('value', this._updateChildRec, this);
            if( i > -1 ) {
               this.sortedChildKeys.splice(i, 1);
//               if( i < this.sortedChildKeys.length ) {
//                  var nextRec = this.child(this.sortedChildKeys[i]);
//                  nextRec && this.triggerEvent('child_moved', makeSnap(nextRec), i > 0? this.sortedChildKeys[i-1] : null);
//               }
            }
            delete this.childRecs[childName];
            if( this._isValueLoaded() ) {
               var newValue = util.extend({}, this.currentValue);
               delete newValue[childName];
               this._setMyValue(newValue);
            }
            this.triggerEvent('child_removed', makeSnap(rec, rec.priorValue));
         }
         else if( util.has(this.loadingChildRecs, childName) ) {
            // the record is still loading and has already been deleted, so deleting this
            // will call _pathAddEvent to abort when it gets through the load process
            delete this.loadingChildRecs[childName];
         }
         return rec;
      },

      // only applicable to the parent join path
      _updateChildRec: function(snap) {
         this._assertIsParent('_updateChildRec');
         if( this._isChildLoaded(snap.name()) ) {
            // if the child's on('value') listener returns null, then the record has effectively been removed
            if( snap.val() === null ) {
               this._removeChildRec(snap.ref());
            }
            // the first on('value', ...) event will be superfluous, an exact duplicate of the child_added
            // event, so don't retrigger it here, instead, wait for the priorValue to be set so we know
            // it's a legit change event
            else if( snap.ref().priorValue !== undefined ) {
               if( this._isValueLoaded() ) {
                  this._setMyValue(join.sortSnapshotData(this, this.currentValue, snap));
               }
               this.triggerEvent('child_changed', snap);
            }
         }
      },

      // only applicable to parent join path
      _placeRecAfter: function(rec, prevChild) {
         this._assertIsParent('_placeRecAfter');
         var toY, len = this.sortedChildKeys.length, res = null;
         if( !prevChild || len === 0 ) {
            toY = 0;
         }
         else {
            toY = util.indexOf(this.sortedChildKeys, prevChild);
            if( toY === -1 ) {
               toY = len;
            }
            else {
               toY++;
            }
         }
         rec.prevChildName = toY > 0? this.sortedChildKeys[toY-1] : null;
         this.sortedChildKeys.splice(toY, 0, rec.name());
         if( toY < len ) {
            var nextKey = this.sortedChildKeys[toY+1];
            var nextRec = this._getJoinedChild(nextKey);
            nextRec.prevChildName = rec.name();
         }
         return res;
      },

      // only applicable to the parent joined path
      _moveChildRec: function(rec, prevChild) {
         this._assertIsParent('_moveChildRec');
         if( this._isChildLoaded(rec) ) {
            var fromX = util.indexOf(this.sortedChildKeys, rec.name());
            if( fromX > -1 && prevChild !== undefined) {
               var toY = 0;
               if( prevChild !== null ) {
                  toY = util.indexOf(this.sortedChildKeys, prevChild);
                  if( toY === -1 ) { toY = this.sortedChildKeys.length }
               }

               if( fromX > toY ) {
                  toY++;
               }

               if( toY !== fromX ) {
                  this.sortedChildKeys.splice(toY, 0, this.sortedChildKeys.splice(fromX, 1)[0]);
                  rec.prevChildName = toY > 0? this.sortedChildKeys[toY-1] : null;
                  this._isChildLoaded(rec) && this.triggerEvent('child_moved', makeSnap(rec), prevChild);
                  this._setMyValue(join.sortSnapshotData(this, this.currentValue));
               }
            }
         }
      },

      // only applicable to child paths
      _myValueChanged: function() {
         join.buildSnapshot(this).value(function(snap) {
            this._setMyValue(snap.val());
         }, this);
      },

      /**
       * @param newValue
       * @returns {boolean}
       * @private
       */
      _setMyValue: function(newValue) {
         if( !util.isEqual(this.currentValue, newValue, true) ) {
            this.priorValue = this.currentValue;
            this.currentValue = newValue;
            this.joinedParent || this._loadCachedChildren();
            this.triggerEvent('value', makeSnap(this));
            return true;
         }
         return false;
      },

      _notifyExistingRecsAdded: function(obs) {
         this._assertIsParent('_notifyExistingRecsAdded');
         if( this.sortedChildKeys.length ) {
            /** @var {join.SnapshotBuilder} prev */
            var prev = null;
            util.each(this.sortedChildKeys, function(key) {
               if( this._isChildLoaded(key) ) {
                  var rec = this._getJoinedChild(key);
                  obs.notify(makeSnap(rec), prev);
                  prev = rec.name();
               }
            }, this);
         }
      },

      /**
       * Not all triggered events are routed through this method, because sometimes observers
       * are directly notified, instead of calling this.triggerHandler(). Have a look at
       * _triggerPreloadedEvents() for an example (when a new observer is added and we
       * have cached data, we trigger child_added and value for all the local events, but
       * only on that new observer and no existing observers)
       * @private
       */
      _eventTriggered: function(event, obsCount, snap, prevChild) {
         var fn = obsCount? (this.joinedParent? log : log.info) : log.debug;
         fn('JoinedRecord(%s) "%s" (%s%s) sent to %d observers', this.name(), event, snap.name(), prevChild? '->'+prevChild : '', obsCount);
         log.debug(snap.val());
      },

      _getJoinedChild: function(keyName) {
         return this.joinedParent? undefined : this.childRecs[keyName];
      },

      _loadCachedChildren: function() {
         this._assertIsParent('_loadCachedChildren');
         var prev = null;
         util.each(this.currentValue, function(v, k) {
            if( !this._isChildLoaded(k) ) {
               var rec = this.child(k);
               rec.currentValue = v;
               rec.prevChildName = prev;
               this._addChildRec(rec, rec.prevChildName);
            }
            prev = k;
         }, this);
      },

      _assertIsParent: function(fnName) {
         if( this.joinedParent ) { throw new Error(fnName+'() should only be invoked for parent records'); }
      },

      /**
       * Since some records may already be cached locally when value or child_added listeners are attached,
       * we trigger any preloaded data for them immediately to comply with Firebase behavior.
       * @param {String} eventType
       * @param {util.Observer} obs
       * @private
       */
      _triggerPreloadedEvents: function(eventType, obs) {
         if( this._isValueLoaded() ) {
            if( eventType === 'value' ) {
               var snap = makeSnap(this);
               obs.notify(snap);
            }
            else if( eventType === 'child_added' ) {
               if( this.joinedParent ) {
                  var prev = null;
                  fb.util.keys(this.currentValue, function(k) {
                     obs.notify(makeSnap(this.child(k)), prev);
                     prev = k;
                  });
               }
               else {
                  this._notifyExistingRecsAdded(obs);
               }
            }
         }
         else if( eventType === 'value' ) {
            // trigger a 'value' event as soon as my data loads
            this._myValueChanged();
         }
      },

      _isSortPath: function(p) {
         return this.sortPath.equals(p);
      }
   };

   util.inherit(JoinedRecord, util.Observable);

   // only useful for parent joined paths
   function eventsToMonitor(rec, path) {
      var events = [];
      if( path.isIntersection() || !rec.intersections.length ) {
         events.push('child_added');
      }
      if( path === rec.sortPath ) {
         events.push('child_moved');
      }
      return events.length? events : null;
   }

   function makeSnap(rec, val) {
      if( arguments.length === 1 ) { val = rec.currentValue; }
      return new join.JoinedSnapshot(rec, val, rec.currentPriority);
   }

   function wrapFailCallback(fn) {
      return function(err) {
         if( fn && err ) { fn(err); }
      }
   }

   function assertWritable(paths, onComplete) {
      var readOnlyNames = util.map(paths, function(p) { return p.isReadOnly()? p.toString() : undefined });
      if( readOnlyNames.length ) {
         var txt = util.printf('Unable to write to the following paths because they are read-only (no keyMap was not specified and the path contains no data): %s', readOnlyNames);
         log.error(txt);
         onComplete(new util.NotSupportedError(txt));
         return false;
      }
      return true;
   }

   function assertValidSet(paths, value, onComplete) {
      var b = !isPrimitiveValue(value) || isSinglePrimitive(paths);
      if( !b ) {
         log.error('Attempted to call set() using a primitive, but this is a joined record (there is no way to split a primitive between multiple paths)');
         onComplete(new util.NotSupportedError('Attempted to call set() using a primitive, but this is a joined record (there is no way to split a primitive between multiple paths)'));
      }
      return b;
   }

   function extractValueForSetOps(value, primitivePath) {
      var out = value;
      if( util.has(value, '.priority') ) {
         out = util.filter(value, function(v,k) { return k !== '.priority' });
      }
      // we support .value in set() ops like normal Firebase, so extract that here if this is a joined value
      if( util.has(value, '.value') ) {
         out = value['.value'];
      }
      if( primitivePath && isPrimitiveValue(out) ) {
         out = (function(oldVal) {
            var newVal = {};
            newVal[primitivePath.aliasedKey('.value')||'.value'] = oldVal;
            return newVal;
         })(out);
      }
      return out;
   }

   function extractPriorityForSetOps(value) {
      if( util.has(value, '.priority') ) {
         return value['.priority'];
      }
      return undefined;
   }

   function isSinglePrimitive(paths) {
      return paths.length  === 1 && paths[0].isPrimitive();
   }

   function isPrimitiveValue(value) {
      return !util.isObject(value) && value !== null;
   }

   /** add JoinedRecord to package
     ***************************************************/
   join.JoinedRecord = JoinedRecord;

})(exports, fb);
