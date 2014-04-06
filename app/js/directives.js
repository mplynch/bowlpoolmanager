'use strict';

/* Directives */

angular.module('myApp.directives', []).
    directive('appVersion', ['version', function (version) {
        return function (scope, elm, attrs) {
            elm.text(version);
        };

    }])

    .directive('bpmShowAdmin', function ($rootScope, syncData) {
        return {
            restrict: 'A',
            compile: function (el, attr) {
                $rootScope.$on("$firebaseSimpleLogin:login", function () {
                    console.log('checking for admin rights');
                    var admins = syncData('admins');

                    admins.$on("loaded", function() {
                        var isAdmin = $rootScope.auth.user.uid in admins;
                        el.toggleClass('hide', !isAdmin);
                    });
                });

                $rootScope.$on("$firebaseSimpleLogin:logout", function () {
                    el.toggleClass('hide', true);
                });
            }
        }
    });