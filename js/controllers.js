app.controller('AlertCtrl',  ['$scope', '$alert',
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
    }]);

app.controller('BaseRouteCtrl', ['$scope', '$location', '$firebaseSimpleLogin', '$alert', 'bpmSettings',
    function ($scope, $location, $firebaseSimpleLogin, $alert, bpmSettings) {
        var bpmRef = new Firebase(bpmSettings.bpmURL);
        $scope.auth = $firebaseSimpleLogin(bpmRef);
    }]);

app.controller('HomeCtrl',  ['$scope', '$location',
    function ($scope, $location) {
        $scope.showPools = function () {
            $location.path('/pools');
        };
    }]);

app.controller('LoginCtrl', ['$rootScope', '$scope', '$location', '$controller', '$firebase', '$firebaseSimpleLogin', 'bpmSettings', '$alert',
    function ($rootScope, $scope, $location, $controller, $firebase, $firebaseSimpleLogin, bpmSettings, $alert) {
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

        $scope.signIn = function ($rootScope) {
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

        $scope.signOut = function ($rootScope) {
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
    }]);

app.controller('MainCtrl', ['$scope', '$rootScope', '$location', '$firebase', '$firebaseSimpleLogin', 'bpmSettings',
    function ($scope, $rootScope, $location, $firebase, $firebaseSimpleLogin, bpmSettings) {
        $scope.isReady = false;
        var bpmRef = new Firebase(bpmSettings.bpmURL);
        $scope.auth = $firebaseSimpleLogin(bpmRef);

        $scope.navClass = function (page) {
            var currentRoute = $location.path();
            return page === currentRoute ? 'active' : '';
        };

        $scope.viewTerms = function () {
            var modalInstance = $modal.open({
                templateUrl: 'partial/terms.html',
                controller: ModalDetailCtrl,
                resolve: {
                    items: function () {
                        return null;
                    }
                }
            });
        };

        $scope.$onRootScope('$firebaseSimpleLogin:login', function () {
            //$scope.isReady = false;
            //$scope.isReady = true;
        });

        $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
            console.log('clearing current user');
            $rootScope.user = null;
        });

        $scope.isReady = true;
    }]);

app.controller('PicksCtrl', ['$scope', '$controller', '$firebase', '$modal', 'bpmSettings',
    function ($scope, $controller, $firebase, $modal, bpmSettings) {
        $controller('BaseRouteCtrl', {$scope: $scope});
    }]);

app.controller('PlayerCtrl', ['$scope', '$controller', '$firebase', '$modal', 'bpmSettings',
    function ($scope, $controller, $firebase, $modal, bpmSettings) {
        $controller('BaseRouteCtrl', {$scope: $scope});

        var playersRef = new Firebase(bpmSettings.bpmURL + '/' + 'players');

        $scope.list = function () {
            console.log('listing players');
            $scope.players = $firebase(playersRef);
            console.log('player list received');
        };

        $scope.view = function (player) {
            var modalInstance = $modal.open({
                templateUrl: 'partial/player.html',
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

        $scope.list();
        $scope.players.$bind($scope, "remotePlayers");
    }]);

app.controller('PoolCtrl',  ['$scope', '$controller', '$location', '$firebase', '$firebaseSimpleLogin', '$modal', 'bpmSettings',
    function ($scope, $controller, $location, $firebase, $firebaseSimpleLogin, $modal, bpmSettings) {
        $controller('BaseRouteCtrl', {$scope: $scope});

        var bpmRef = new Firebase(bpmSettings.bpmURL);
        $scope.auth = $firebaseSimpleLogin(bpmRef);

        var poolsRef = new Firebase(bpmSettings.bpmURL + '/' + 'pools');
        $scope.pools = $firebase(poolsRef);

        $scope.add = function () {
            console.log('adding a pool');

            var newPool = { name: '' };

            modalInstance = $modal.open({
                templateUrl: 'partial/pools.create.html',
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
                    bpmRef.child('/players/' + $scope.auth.user.uid + '/pools/' + newPoolRef.name()).set(true);
                    console.log('pool added');
                    $location.path('/pools/' + newPoolRef.name());
                });
            });
        };

        $scope.view = function (pool) {
            $scope.pool = pool;
            $location.path('/pools/' + $scope.pool.$id);
        };

        $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
            console.log('clearing pools');
            $scope.pools = null;
            $scope.auth = null;
        });
    }]);

app.controller('ProfileCtrl', ['$scope', '$controller', '$firebase', '$firebaseSimpleLogin', '$location', '$alert', 'bpmSettings',
    function ($scope, $controller, $firebase, $firebaseSimpleLogin, $location, $alert, bpmSettings) {
        $controller('BaseRouteCtrl', {$scope: $scope});

        $scope.$on("$destroy", function (event, val) {
            $alert.$clear();
        });

        if (!$scope.auth) {
            $location.path('/');
            return;
        }

        $scope.user = $scope.auth.$getCurrentUser()
            .then(function (user) {
                var playerRef = new Firebase(bpmSettings.bpmURL + '/' + 'players/' + user.uid);

                $scope.player = $firebase(playerRef);
            },
            function (error) {

            });

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
    }]);

app.controller('SettingsCtrl',  ['$scope', '$controller', '$firebase', 'bpmSettings',
    function ($scope, $controller, $firebase, bpmSettings) {
        $controller('BaseRouteCtrl', {$scope: $scope});
    }]);

app.controller('SetupCtrl',  ['$scope', '$controller', '$firebase', 'bpmSettings',
    function ($scope, $controller, $firebase, bpmSettings) {
        $controller('BaseRouteCtrl', {$scope: $scope});

        var setup = new Firebase(bpmSettings.bpmURL + '/' + 'setup');
    }]);

app.controller('TeamCtrl',  ['$scope', '$controller', '$firebase', '$modal', 'bpmSettings',
    function ($scope, $controller, $firebase, $modal, bpmSettings) {
        $controller('BaseRouteCtrl', {$scope: $scope});

        var teamsRef = new Firebase(bpmSettings.bpmURL + '/' + 'teams');

        $scope.list = function () {
            console.log('listing teams');
            $scope.teams = $firebase(teamsRef);
            console.log('team list received');
        };

        $scope.view = function (team) {
            var modalInstance = $modal.open({
                templateUrl: 'partial/team.html',
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

        $scope.list();
        $scope.teams.$bind($scope, "remoteTeams")
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
