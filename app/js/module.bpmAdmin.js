'use strict';

angular.module('bpmAdmin', [])

    .service('bpmAdmin', function ($rootScope, syncData, waitForAuth) {
        return {
            init: function (auth) {
                $rootScope.$on('$firebaseSimpleLogin:login', function (e, user) {
                    var admins = syncData('admins');

                    admins.$on("loaded", function () {
                        if (user.uid in admins) {
                            $rootScope.$broadcast('bpmWaitForAdmin:true');
                        }

                        else {
                            $rootScope.$broadcast('bpmWaitForAdmin:false');
                        }
                    });
                });

                $rootScope.$on('$firebaseSimpleLogin:logout', function () {
                    $rootScope.$broadcast('bpmWaitForAdmin:false');
                });
            }
        };
    })

    .directive('bpmShowAdmin', function ($rootScope, $timeout) {
        return {
            restrict: 'A',
            compile: function (element, attributes) {
                element.addClass('hide');

                $rootScope.$on("bpmWaitForAdmin:true", function () {
                    $timeout(function () {
                        element.removeClass('hide');
                    });
                });

                $rootScope.$on("bpmWaitForAdmin:false", function () {
                    $timeout(function () {
                        element.addClass('hide');
                    });
                });
            }
        }
    });