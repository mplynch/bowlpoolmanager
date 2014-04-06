'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AlertCtrl', ['$scope', '$alert',
        function ($scope, $alert) {
            $scope.alerts = $alert.$alerts();

            $scope.$watch(
                function () {
                    return $alert.$alerts()
                },
                function (alerts) {
                    $scope.alerts = alerts;
                });

            $scope.closeAlert = function (index) {
                $alert.$close(index);
            };
        }])

    .controller('BowlsCtrl', ['$scope', '$location', 'syncData', '$modal', '$alert',
        function ($scope, $location, syncData, $modal, $alert) {
            $scope.currentSeason = null;
            $scope.teams = syncData('teams');

            $scope.openCalendar = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();

                $scope.opened = true;
            };

            $scope.setCurrentSeason = function (season) {
                $scope.bowls = syncData('seasons/' + season.$id + '/bowls/');

                $scope.currentSeason = season;
            };

            $scope.remove = function (bowl) {
                bowl.$remove();
            };

            $scope.edit = function (bowl) {
                $scope.selectedBowl = syncData('seasons/' + $scope.currentSeason.$id + '/bowls/' + bowl.$id);

                var modalInstance = $modal.open({
                    templateUrl: 'partials/bowls.edit.html',
                    controller: 'ModalEditorCtrl',
                    resolve: {
                        items: function () {
                            return $scope.selectedBowl;
                        }
                    }});

                modalInstance.result.then(function (result) {
                    $scope.selectedBowl.$save().then(function () {
                            $alert.$success('Saved bowl!')
                        },
                        function () {
                            $alert.$danger('Failed to save bowl!');
                        })
                });
            };

            $scope.seasons = syncData('seasons');
        }])

    .controller('HomeCtrl', ['$scope',
        function ($scope) {

        }])

    .controller('LoginCtrl', ['$scope', 'loginService', '$location', '$alert',
        function ($scope, loginService, $location, $alert) {
            $scope.name = null;
            $scope.email = null;
            $scope.pass = null;
            $scope.confirm = null;
            $scope.createMode = false;

            $scope.login = function (cb) {
                if (!$scope.email) {
                    $alert.$danger('Please enter an email address');
                }
                else if (!$scope.pass) {
                    $alert.$danger('Please enter a password');
                }
                else {
                    loginService.login($scope.email, $scope.pass, function (err, user) {
                        if (err)
                            errorHandler(err);

                        else
                            cb && cb(user);
                    });
                }
            };

            $scope.createAccount = function () {
                if (assertValidLoginAttempt()) {
                    loginService.createAccount($scope.email, $scope.pass, function (err, user) {
                        if (err) {
                            errorHandler(err);
                        }

                        else {
                            // must be logged in before I can write to my profile
                            $scope.login(function () {
                                loginService.createProfile(user.uid, user.email, $scope.name);
                                $location.path('/pools');
                            });
                        }
                    });
                }
            };

            function assertValidLoginAttempt() {
                if (!$scope.email) {
                    $alert.$danger('Please enter an email address');
                }
                else if (!$scope.pass) {
                    $alert.$danger('Please enter a password');
                }
                else if ($scope.pass !== $scope.confirm) {
                    $alert.$danger('Passwords do not match');
                }
                else if (!$scope.name) {
                    $alert.$danger('Please enter your name');
                }
                return !$scope.err;
            }

            function errorHandler(error) {
                switch (error.code) {
                    case 'EMAIL_TAKEN':
                        $alert.$danger('Specified email address is already in use');
                        break;
                    case 'INVALID_USER':
                    case 'INVALID_PASSWORD':
                        $alert.$danger('Wrong email and password combination');
                        break;
                    case 'INVALID_EMAIL':
                        $alert.$danger('Invalid email address');
                        break;
                    case 'PASSWORD_MISMATCH':
                        $alert.$danger('Passwords do not match');
                        break;
                    default:
                }
            }
        }])

    .controller('MainCtrl', ['$scope', '$location', 'loginService',
        function ($scope, $location, loginService) {

            $scope.navClass = function (page) {
                var currentRoute = $location.path();
                return page === currentRoute ? 'active' : '';
            };

            $scope.logout = function () {
                loginService.logout();
            };

            $scope.viewTerms = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'partials/terms.html',
                    controller: ModalViewCtrl,
                    resolve: {
                        items: function () {
                            return null;
                        }
                    }
                });
            };
        }])

    .controller('PicksCtrl', ['$scope', 'syncData',
        function ($scope, syncData) {
            $scope.picks = syncData('picks');
        }])

    .controller('PoolCtrl', ['$scope', '$location', 'syncData', 'firebaseRef', '$modal',
        function ($scope, $location, syncData, firebaseRef, $modal) {

            var userPools = syncData('users/' + $scope.auth.user.uid + '/pools/');
            $scope.pools = syncData('pools');

            $scope.add = function () {
                console.log('adding a pool');

                var newPool = { name: '' };

                var modalInstance = $modal.open({
                    templateUrl: 'partials/pools.create.html',
                    controller: ModalCreateCtrl,
                    resolve: {
                        items: function () {
                            return newPool;
                        }
                    }});

                modalInstance.result.then(function (pool) {
                    pool.managers = { };
                    pool.managers[$scope.auth.user.uid] = "true";
                    $scope.pools.$add(pool).then(function (newPoolRef) {
                        firebaseRef('/users/' + $scope.auth.user.uid + '/pools/' + newPoolRef.name()).set(true);
                        console.log('pool added');
                        $location.path('/pools/' + newPoolRef.name());
                    });
                });
            };

            $scope.view = function (pool) {
                $location.path('/pools/' + pool.$id);
            };

            $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
                console.log('clearing pools');
                $scope.pools = null;
                $scope.auth = null;
            });
        }])

    .controller('PoolDetailCtrl', ['$scope', '$routeParams', 'syncData', 'firebaseRef',
        function ($scope, $routeParams, syncData, firebaseRef) {

            $scope.pool = syncData('/pools/' + $routeParams.id);

            $scope.pool.$on("loaded", function () {
                if ($scope.pool.managers[$scope.auth.user.uid])
                    $scope.isManager = true;
            });

            $scope.save = function () {
                // TODO: Validate pool

                $scope.pool.$save();
            };
        }])

    .controller('ProfileCtrl', ['$scope', '$location', 'syncData', '$alert',
        function ($scope, $location, syncData, $alert) {
            $scope.$on("$destroy", function (event, val) {
                $alert.$clear();
            });

            $scope.oldpass = null;
            $scope.newpass = null;
            $scope.confirm = null;

            syncData(['users', $scope.auth.user.uid]).$bind($scope, 'user');

            $scope.save = function () {
                $scope.user.$save()
                    .then(function () {
                        console.log('profile saved');
                        $alert.$success('Saved!');
                    },
                    function (error) {
                        $alert.$danger('Failed to save profile: ' + error.message);
                    });
            };

            $scope.reset = function () {
                $scope.err = null;
                $scope.msg = null;
            };

            $scope.updatePassword = function () {
                $scope.reset();
                loginService.changePassword(buildPwdParms());
            };

            function buildPwdParms() {
                return {
                    email: $scope.auth.user.email,
                    oldpass: $scope.oldpass,
                    newpass: $scope.newpass,
                    confirm: $scope.confirm,
                    callback: function (err) {
                        if (err) {
                            $scope.err = err;
                        }
                        else {
                            $scope.oldpass = null;
                            $scope.newpass = null;
                            $scope.confirm = null;
                            $scope.msg = 'Password updated!';
                        }
                    }
                }
            }

            $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
                console.log('clearing user');
                $scope.user = null;
            });
        }])

    .controller('SettingsCtrl', ['$scope', 'syncData',
        function ($scope, syncData) {

        }])

    .controller('SetupCtrl', ['$scope', 'syncData',
        function ($scope, syncData) {

        }])

    .controller('TeamCtrl', ['$scope', 'syncData', '$modal',
        function ($scope, syncData, $modal) {

            console.log('listing teams');
            $scope.teams = syncData(['teams']);
            console.log('team list received');

            $scope.view = function (team) {
                var modalInstance = $modal.open({
                    templateUrl: 'partials/teams.view.html',
                    controller: ModalViewCtrl,
                    resolve: {
                        items: function () {
                            return team;
                        }
                    }
                });
            };

            $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
                console.log('clearing teams');
                $scope.teams = null;
            });


        }])

    .controller('UserCtrl', ['$scope', 'syncData', '$modal',
        function ($scope, syncData, $modal) {
            console.log('listing users');
            $scope.users = syncData('users');
            console.log('user list received');

            $scope.view = function (user) {
                var modalInstance = $modal.open({
                    templateUrl: 'partials/users.edit.html',
                    controller: ModalViewCtrl,
                    resolve: {
                        items: function () {
                            return user;
                        }
                    }
                });
            };

            $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
                console.log('clearing users');
                $scope.users = null;
            });
        }]);

var ModalCreateCtrl = function ($scope, $modalInstance, items, $alert) {
    $scope.item = items;

    $scope.ok = function () {
        $modalInstance.close($scope.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};

var ModalViewCtrl = function ($scope, $modalInstance, items) {
    if (items)
        $scope.item = items;

    $scope.ok = function () {
        $modalInstance.dismiss('ok');
    };
};

var ModalEditorCtrl = function ($scope, $modalInstance, items) {
    $scope.item = items;

    $scope.ok = function () {
        $modalInstance.close($scope.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
