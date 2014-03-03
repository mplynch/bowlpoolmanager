'use strict';

/* Controllers */

angular.module('myApp.controllers', [])
    .controller('AlertCtrl',  ['$scope', '$alert',
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

    .controller('HomeCtrl',  ['$scope',
        function ($scope) {

        }])

    .controller('LoginCtrl', ['$scope', 'loginService', '$location',
        function($scope, loginService, $location) {
            $scope.email = null;
            $scope.pass = null;
            $scope.confirm = null;
            $scope.createMode = false;

            $scope.login = function(cb) {
                $scope.err = null;
                if( !$scope.email ) {
                    $scope.err = 'Please enter an email address';
                }
                else if( !$scope.pass ) {
                    $scope.err = 'Please enter a password';
                }
                else {
                    loginService.login($scope.email, $scope.pass, function(err, user) {
                        $scope.err = err? err + '' : null;
                        if( !err ) {
                            cb && cb(user);
                        }
                    });
                }
            };

            $scope.createAccount = function() {
                $scope.err = null;
                if( assertValidLoginAttempt() ) {
                    loginService.createAccount($scope.email, $scope.pass, function(err, user) {
                        if( err ) {
                            $scope.err = err? err + '' : null;
                        }
                        else {
                            // must be logged in before I can write to my profile
                            $scope.login(function() {
                                loginService.createProfile(user.uid, user.email);
                                $location.path('/account');
                            });
                        }
                    });
                }
            };

            function assertValidLoginAttempt() {
                if( !$scope.email ) {
                    $scope.err = 'Please enter an email address';
                }
                else if( !$scope.pass ) {
                    $scope.err = 'Please enter a password';
                }
                else if( $scope.pass !== $scope.confirm ) {
                    $scope.err = 'Passwords do not match';
                }
                return !$scope.err;
            }
        }])

    .controller('AccountCtrl', ['$scope', 'loginService', 'syncData', '$location',
        function($scope, loginService, syncData, $location) {
            syncData(['players', $scope.auth.user.uid]).$bind($scope, 'player');

            $scope.logout = function() {
                loginService.logout();
            };

            $scope.oldpass = null;
            $scope.newpass = null;
            $scope.confirm = null;

            $scope.reset = function() {
                $scope.err = null;
                $scope.msg = null;
            };

            $scope.updatePassword = function() {
                $scope.reset();
                loginService.changePassword(buildPwdParms());
            };

            function buildPwdParms() {
                return {
                    email: $scope.auth.user.email,
                    oldpass: $scope.oldpass,
                    newpass: $scope.newpass,
                    confirm: $scope.confirm,
                    callback: function(err) {
                        if( err ) {
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

        }])

    .controller('LoginCtrl2', ['$scope', '$location', 'loginService', 'syncData', '$alert',
        function ($scope, $location, loginService, syncData, $alert) {
            $scope.$on("$destroy", function (event, val) {
                $alert.$clear();
            });

            var bpmRef = new Firebase(bpmSettings.bpmURL);
            $scope.auth = $firebaseSimpleLogin(bpmRef);


            var errorHandler = function (error) {
                console.error(error);

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
            };

            $scope.resetPassword = function () {
                console.log('method disabled: resetPassword');

                /*
                 console.log('attempting to send password reset email');

                 $scope.auth.$sendPasswordResetEmail($scope.player.email)
                 .then(function() {
                 console.log('password reset email sent');
                 $alert.$success('Password reset email sent!');
                 },
                 function(error) {
                 errorHandler(error);
                 });
                 */
            };

            $scope.signIn = function () {
                console.log('attempting to sign in');

                $scope.auth.$login('password', {
                    email: $scope.player.email,
                    password: $scope.player.password,
                    rememberMe: $scope.player.rememberMe
                }).then(function (user) {
                        console.log('logged in as ', user.email);

                        $alert.$clear();

                        $location.path('/pools');
                    },
                    function (error) {
                        errorHandler(error);
                    });
            };

            $scope.signOut = function () {
                $scope.auth.$logout();
                $location.path('/');
            };

            $scope.signUp = function () {
                console.log('attempting to register');

                if ($scope.player.password != $scope.player.confirm_password) {
                    errorHandler({code: 'PASSWORD_MISMATCH', message: 'Passwords do not match'});
                    return;
                }

                $scope.auth.$createUser($scope.player.email, $scope.player.password, false)
                    .then(function (user) {
                        var playerRef = new Firebase(bpmSettings.bpmURL + '/players/' + user.uid);
                        var player = $firebase(playerRef);
                        var password = $scope.player.password;
                        delete $scope.player.password; // Don't store the password
                        delete $scope.player.confirm_password; // Don't store the password
                        player.$set($scope.player); // Store the player
                        console.log('created user ' + user.uid);

                        $scope.auth.$login('password', {
                            email: $scope.player.email,
                            password: password,
                            rememberMe: false
                        }).then(function (user) {
                                console.log('logged in as ', user.email);

                                $alert.$clear();

                                $location.path('/pools');
                            },
                            function (error) {
                                errorHandler(error);
                            });
                    },
                    function (error) {
                        errorHandler(error);
                    });
            };
        }])

    .controller('MainCtrl', ['$scope', '$location',
        function ($scope, $location) {

            $scope.navClass = function (page) {
                var currentRoute = $location.path();
                return page === currentRoute ? 'active' : '';
            };

            $scope.viewTerms = function () {
                var modalInstance = $modal.open({
                    templateUrl: 'partials/terms.html',
                    controller: ModalDetailCtrl,
                    resolve: {
                        items: function () {
                            return null;
                        }
                    }
                });
            };

            $scope.$onRootScope('$firebaseSimpleLogin:login', function () {

            });

            $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
                console.log('clearing current user');
            });
        }])

    .controller('PicksCtrl', ['$scope', 'syncData',
        function ($scope, syncData) {
            $scope.picks = syncData('picks');
        }])

    .controller('PlayerCtrl', ['$scope', 'syncData', '$modal',
        function ($scope, synData, $modal) {


            console.log('listing players');
            $scope.players = syncData('players');
            $scope.players.$bind($scope, "remotePlayers");
            console.log('player list received');

            $scope.view = function (player) {
                var modalInstance = $modal.open({
                    templateUrl: 'partials/player.html',
                    controller: ModalDetailCtrl,
                    resolve: {
                        items: function () {
                            return player;
                        }
                    }
                });
            };

            $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
                console.log('clearing players');
                $scope.players = null;
            });
        }])

    .controller('PoolCtrl',  ['$scope', '$location', 'syncData', 'firebaseRef', '$modal',
        function ($scope, $location, syncData, firebaseRef, $modal) {

            var playerPools = syncData('players/' + $scope.auth.user.uid + '/pools/');
            $scope.pools = syncData('pools');

            $scope.add = function () {
                console.log('adding a pool');

                var newPool = { name: '' };

                var modalInstance = $modal.open({
                    templateUrl: 'partials/pools.create.html',
                    controller: ModalEditorCtrl,
                    resolve: {
                        items: function () {
                            return newPool;
                        }
                    }});

                modalInstance.result.then(function(pool) {
                    pool.managers = { };
                    pool.managers[$scope.auth.user.uid] = "true";
                    $scope.pools.$add(pool).then(function(newPoolRef) {
                        firebaseRef('/players/' + $scope.auth.user.uid + '/pools/' + newPoolRef.name()).set(true);
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

    .controller('PoolDetailCtrl',  ['$scope', '$routeParams', 'syncData',
        function ($scope, $routeParams, syncData) {

            $scope.pool = syncData('/pools/' + $routeParams.id);
        }])

    .controller('ProfileCtrl', ['$scope', '$location', 'syncData', '$alert',
        function ($scope, $location, syncData, $alert) {
            $scope.$on("$destroy", function (event, val) {
                $alert.$clear();
            });

            syncData(['players', $scope.auth.user.uid]).$bind($scope, 'player');

            $scope.save = function () {
                $scope.player.$save()
                    .then(function () {
                        console.log('profile saved');
                        $alert.$success("Saved!");
                    },
                    function (error) {

                    });
            };

            $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
                console.log('clearing player');
                $scope.player = null;
            });
        }])

    .controller('SettingsCtrl',  ['$scope', 'syncData',
        function ($scope, syncData) {

        }])

    .controller('SetupCtrl',  ['$scope', 'syncData',
        function ($scope, syncData) {

        }])

    .controller('TeamCtrl',  ['$scope', 'syncData', '$modal',
        function ($scope, syncData, $modal) {

            console.log('listing teams');
            syncData(['teams']).$bind($scope, 'teams');
            console.log('team list received');

            $scope.view = function (team) {
                var modalInstance = $modal.open({
                    templateUrl: 'partials/team.html',
                    controller: ModalDetailCtrl,
                    resolve: {
                        items: function () {
                            return team;
                        }
                    }
                });

                /*modalInstance.result.then(function (selectedItem) {
                 $scope.selected = selectedItem;
                 }, function () {
                 $log.info('Modal dismissed at: ' + new Date());
                 });*/
            };

            $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
                console.log('clearing teams');
                $scope.teams = null;
            });


        }]);

var ModalDetailCtrl = function ($scope, $modalInstance, items) {
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
