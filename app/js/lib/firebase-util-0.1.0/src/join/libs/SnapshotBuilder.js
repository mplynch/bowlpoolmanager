(function(exports, fb) {
   var undefined;
   var util = fb.pkg('util');
   var log  = fb.pkg('log');
   var join = fb.pkg('join');

   /**
    * Builds snapshots by calling once('value', ...) against each path. Paths are resolved iteratively so
    * that dynamic paths can be loaded once enough data is present for their needs. All data is applied
    * in the order the paths were declared (not in the order they return from Firebase) ensuring merging
    * looks correct.
    *
    * Use this by calling fb.pkg('join').buildSnapshot(...).
    *
    * @param {JoinedRecord} rec
    * @constructor
    */
   function SnapshotBuilder(rec) {
      this.rec = rec;
      this.observers = [];
      this.valueParts = [];
      this.callbacksExpected = 0;
      this.callbacksReceived = 0;
      this.state = 'unloaded';
      this.snapshot = null;
      this.pendingPaths = groupPaths(rec.paths, rec.sortPath);
   }

   SnapshotBuilder.prototype = {
      /**
       * @param {Function} callback
       * @param [context]
       */
      value: function(callback, context) {
         this.observers.push(util.toArray(arguments));
         //todo use util.createQueue?
         if( this.state === 'loaded' ) {
            this._notify();
         }
         else if( this.state === 'unloaded' ) {
            this._process();
         }
         return this;
      },

      ref: function() {
         return this.rec;
      },

      _process: function() {
         this.state = 'processing';

         // load all intersecting paths and then all unions
         util.each(this.pendingPaths.intersects, this._loadIntersection, this);

         // and then all unions
         util.each(this.pendingPaths.unions, this._loadUnion, this);
      },

      _finalize: function() {
         // should only be called exactly once
         if( this.state !== 'loaded' ) {
            this.state = 'loaded';
            var dat = null;
            if( !this.rec.joinedParent && this.pendingPaths.intersects.length ) {
               dat = mergeIntersections(this.pendingPaths, this.valueParts);
            }
            else {
               dat = mergeValue(this.pendingPaths, this.valueParts);
            }
            this.snapshot = new join.JoinedSnapshot(this.rec, dat);
            log.debug('SnapshotBuilder: Finalized snapshot "%s": %j', this.rec, this.snapshot.val());
            this._notify();
         }
      },

      _notify: function() {
         var snapshot = this.snapshot;
         util.each(this.observers, function(obsArgs) {
            obsArgs[0].apply(obsArgs[1], [snapshot].concat(obsArgs.splice(2)));
         });
         this.observers = [];
      },

      _loadIntersection: function(parts) {
         var path = parts[0];
         var myIndex = parts[1];
         this.callbacksExpected++;
         log.debug('SnapshotBuilder._loadIntersection: initialized "%s"', path.toString());
         path.loadData(function(data) {
            log.debug('SnapshotBuilder._loadIntersection completed "%s" with value "%j"', path.toString(), data);
            if( data === null ) {
               log('SnapshatBuilder: Intersecting Path(%s) was null, so the record %s will be excluded', path.toString(), this.rec.name());
               // all intersected values must be present or the total value is null
               // so we can abort the load here and send out notifications
               this.valueParts = [];
               this._finalize();
            }
            else {
               this.valueParts[myIndex] = data;
               //todo remove this defer when test units are done?
               this._callbackCompleted();
            }
         }, this);
      },

      _loadUnion: function(parts) {
         var path = parts[0];
         var myIndex = parts[1];
         this.callbacksExpected++;
         log.debug('SnapshotBuilder._loadUnion: initialized "%s"', path.toString());
         path.loadData(function(data) {
            log.debug('SnapshotBuilder._loadUnion completed "%s" with value "%j"', path.toString(), data);
            this.valueParts[myIndex] = data;
            this._callbackCompleted();
         }, this);
      },

      _callbackCompleted: function() {
         if( this.callbacksExpected === ++this.callbacksReceived) {
            // so it's time to call this mission completed
            this._finalize();
         }
      }
   };

   function mergeIntersections(paths, valueParts) {
      var ikeys = util.map(paths.intersects, function(parts) { return parts[1]; });
      var out = {};
      util.each(valueParts[paths.sortIndex], function(v, k) {
         if( noEmptyIntersections(ikeys, valueParts, k) ) {
            var parts = util.map(valueParts, function(part) {
               return util.isObject(part)? part[k] : null;
            });
            out[k] = mergeValue(paths, parts);
         }
      });
      return util.isEmpty(out)? null : out;
   }

   function noEmptyIntersections(intersectKeys, valueParts, recordKey) {
      return !util.contains(intersectKeys, function(key) {
         return !util.isObject(valueParts[key]) || util.isEmpty(valueParts[key][recordKey]);
      });
   }

   function mergeValue(paths, valueParts) {
      var out = {};
      util.each(valueParts, function(v, i) {
         if( v !== null ) {
            var myPath = paths.both[i][0];
            if( myPath.isPrimitive() ) {
               util.extend(out, makeObj(myPath.aliasedKey('.value'), v));
            }
            else {
               util.extend(true, out, v);
            }
            if( myPath.isDynamic() ) {
               util.extend(out, makeObj('.id:'+myPath.aliasedKey('.value'), myPath.props.dynamicKey));
            }
         }
      });
      return util.isEmpty(out)? null : out;
   }

   function groupPaths(paths, sortPath) {
      var out = { intersects: [], unions: [], both: [], expect: 0, sortIndex: 0 };
      util.each(paths, function(path) {
         pathParts(out, sortPath, path);
      });
      return out;
   }

   function pathParts(pendingPaths, sortPath, path) {
      if( path === sortPath ) {
         pendingPaths.sortIndex = pendingPaths.expect;
      }

      var parts = [path, pendingPaths.expect];
      if( path.isIntersection() ) { pendingPaths.intersects.push(parts); }
      else { pendingPaths.unions.push(parts); }
      pendingPaths.both.push(parts);

      pendingPaths.expect++;
   }

   function makeObj(key, val) {
      var out = {};
      out[key] = val;
      return out;
   }

   /**
    * Any additional args passed to this method will be returned to the callback, after the snapshot, upon completion
    * @param rec
    * @param [callback]
    * @param [context]
    */
   join.buildSnapshot = function(rec, callback, context) {
      var snap = new SnapshotBuilder(rec);
      if( callback ) {
         snap.value.apply(snap, util.toArray(arguments).slice(1));
      }
      return snap;
   };

   /**
    * @param {JoinedRecord} rec
    * @param data
    * @param {JoinedSnapshot} [childSnap]
    * @returns {*}
    */
   join.sortSnapshotData = function(rec, data, childSnap) {
      var out = data;
      if( !util.isEmpty(data) ) {
         if( rec.joinedParent ) {
            out = {};
            util.each(rec.paths, function(path) {
               path.eachKey(data, function(sourceKey, aliasedKey, value) {
                  if( value === null ) { return; }
                  if( path.hasDynamicChild(sourceKey) ) {
                     out['.id:'+aliasedKey] = value;
                     out[aliasedKey] = data[aliasedKey];
                  }
                  else {
                     out[aliasedKey] = value;
                  }
               });
            });
         }
         else {
            out = {};
            util.each(rec.sortedChildKeys, function(key) {
               if( childSnap && childSnap.name() === key ) {
                  util.isEmpty(childSnap.val()) || (out[key] = childSnap.val());
               }
               else if( !util.isEmpty(data[key]) ) {
                  out[key] = data[key];
               }
            });
         }
      }
      return util.isEmpty(out)? null : out;
   };
})(exports, fb);