(function() {
    'use strict';

    /* Services */

    angular.module('myApp.services', ['myApp.service.login', 'myApp.service.firebase'])

        // put your services here!
        // .service('serviceName', ['dependency', function(dependency) {}]);

        .service('$alert', [function() {

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
        }]);
})();