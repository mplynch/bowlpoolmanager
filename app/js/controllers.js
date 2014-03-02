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

app.controller('HomeCtrl',  ['$scope', '$location',
    function ($scope, $location) {
        $scope.showPools = function () {
            $location.path('/pools');
        };
    }]);

app.controller('LoginCtrl', ['$rootScope', '$scope', '$location', '$firebase', '$firebaseSimpleLogin', 'bpmSettings', '$alert',
    function ($rootScope, $scope, $location, $firebase, $firebaseSimpleLogin, bpmSettings, $alert) {
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

app.controller('MainCtrl', ['$scope', '$rootScope', '$location', '$bpmFirebase',
    function ($scope, $rootScope, $location, $bpmFirebase) {
        $scope.isReady = false;
        var bpmRef = $bpmFirebase.$getFirebaseRef();
        $scope.auth = $bpmFirebase.$getAuth();

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
            //$scope.isReady = false;
            //$scope.isReady = true;
        });

        $scope.$onRootScope('$firebaseSimpleLogin:logout', function () {
            console.log('clearing current user');
            $rootScope.user = null;
        });

        $scope.isReady = true;
    }]);

app.controller('PicksCtrl', ['$scope', '$bpmFirebase',
    function ($scope, $bpmFirebase) {

    }]);

app.controller('PlayerCtrl', ['$scope', '$bpmFirebase', '$modal',
    function ($scope, $bpmFirebase, $modal) {

        var playersRef = $bpmFirebase.getFirebaseRef('players');

        $scope.list = function () {
            console.log('listing players');
            $scope.players = $firebase(playersRef);
            console.log('player list received');
        };

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

        $scope.list();
        $scope.players.$bind($scope, "remotePlayers");
    }]);

app.controller('PoolCtrl',  ['$scope', '$location', '$bpmFirebase', '$modal',
    function ($scope, $location, $bpmFirebase, $modal) {

        /*$scope.pools = $bpmFirebase.$getFirebase('/players');*/
        $scope.auth = $bpmFirebase.$getAuth();

        if (!$scope.auth.user) {
            $location.path('/');
            return;
        }

        $scope.pools = $bpmFirebase.$getFirebaseRef('/players/' + $scope.auth.user.uid + '/pools/');

        $scope.add = function () {
            console.log('adding a pool');

            var newPool = { name: '' };

            modalInstance = $modal.open({
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
                    $bpmFirebase.$getFirebaseRef('/players/' + $scope.auth.user.uid + '/pools/' + newPoolRef.name()).set(true);
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
    }]);

app.controller('PoolDetailCtrl',  ['$scope', '$routeParams', '$bpmFirebase',
    function ($scope, $routeParams, $bpmFirebase) {

        $scope.auth = $bpmFirebase.$getAuth();
        $scope.pool = $bpmFirebase.$getFirebase('/pools/' + $routeParams.id);
    }]);

app.controller('ProfileCtrl', ['$scope', '$location', '$bpmFirebase', '$alert',
    function ($scope, $location, $bpmFirebase, $alert) {
        $scope.$on("$destroy", function (event, val) {
            $alert.$clear();
        });

        if (!$scope.auth) {
            $location.path('/');
            return;
        }

        $scope.user = $scope.auth.$getCurrentUser()
            .then(function (user) {
                $scope.player =  $bpmFirebase.$getFirebase('/players/' + user.uid);
            },
            function (error) {
                console.log('failed to retrieve player: ' + user.uid);
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

app.controller('SettingsCtrl',  ['$scope', '$bpmFirebase',
    function ($scope, $bpmFirebase) {

    }]);

app.controller('SetupCtrl',  ['$scope', '$bpmFirebase',
    function ($scope, $bpmFirebase) {

    }]);

app.controller('TeamCtrl',  ['$scope', '$bpmFirebase', '$modal',
    function ($scope, $firebase, $modal) {

        var teamsRef = $bpmFirebase.$getFirebaseRef('/teams');

        $scope.list = function () {
            console.log('listing teams');
            $scope.teams = $firebase(teamsRef);
            console.log('team list received');
        };

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
