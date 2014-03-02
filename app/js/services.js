app.factory('$alert', function() {

    var alerts = [];

    var clearAlerts = function() {
        alerts = [];
    };

    var closeAlert = function(index, clearOthers) {
        alerts.splice(index, 1);
    };

    var createAlert = function(type, message, clearOthers) {
        if (clearOthers)
            alerts = [];

        alerts.push({type: type, msg: message});
    };

    var alertSuccess = function(message, clearOthers) {
        clearOthers = clearOthers || true;
        createAlert('success', message, clearOthers);
    };

    var alertInfo = function(message, clearOthers) {
        clearOthers = clearOthers || true;
        createAlert('info', message, clearOthers);
    };

    var alertWarning = function(message,clearOthers) {
        clearOthers = clearOthers || true;
        createAlert('warning', message, clearOthers);
    };

    var alertDanger = function(message, clearOthers) {
        clearOthers = clearOthers || true;
        createAlert('danger', message, clearOthers);
    };

    return {
        $alerts: function() { return alerts; },
        $success: function(message, clearOthers) { return alertSuccess(message, clearOthers); },
        $info: function(message, clearOthers) { return alertInfo(message, clearOthers); },
        $warning: function(message, clearOthers) { return alertWarning(message, clearOthers); },
        $danger: function(message, clearOthers) { return alertDanger(message, clearOthers); },
        $clear: function() { return clearAlerts(); },
        $close: function(index) { return closeAlert(index); }
    };
});

app.factory('$bpmFirebase', ['$firebase', '$firebaseSimpleLogin', 'bpmSettings',
    function($firebase, $firebaseSimpleLogin, bpmSettings) {
        return {
            $getAuth: function() {
                var ref = this.$getFirebaseRef();
                return $firebaseSimpleLogin(ref);
            },
            $getFirebase: function(path) {
                var ref = this.$getFirebaseRef(path);
                return $firebase(ref);
            },
            $getFirebaseRef: function(path) {
                path = path || '';
                // TODO: prefix path with a slash automatically
                return new Firebase(bpmSettings.bpmURL + path);
            }
        };
    }]);