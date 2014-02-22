app.controller('AlertCtrl', function($scope, $rootScope, $alert) {
    $scope.alerts = $alert.$alerts();

    $scope.$watch(
        function () { return $alert.$alerts() },
        function (alerts) {
            $scope.alerts = alerts;
        });

    $scope.closeAlert = function(index) {
        $alert.$close(index);
    };
});

app.controller('HTTPErrorCtrl', function() {

});

app.controller('LoginCtrl', function($rootScope, $scope, $location, $controller, $firebase, $firebaseSimpleLogin, bpmSettings, $alert) {
    $controller('BaseRouteCtrl', {$scope: $scope});

    var bpmRef = new Firebase(bpmSettings.bpmURL);
    $scope.auth = $firebaseSimpleLogin(bpmRef);

    var errorHandler = function(error) {
        console.error(error);

        switch(error.code) {
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

    $scope.resetPassword = function() {
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

    $scope.signIn = function() {
        console.log('attempting to sign in');

        $scope.auth.$login('password', {
            email : $scope.player.email,
            password: $scope.player.password,
            rememberMe: $scope.player.rememberMe
        }).then(function(user) {
                console.log('logged in as ', user.email);

                $rootScope.$emit('BPM.UserSignedIn');

                $alert.$clear();

                $location.path('#/pools');
            },
            function(error) {
                errorHandler(error);
            });

        $scope.isReady = true;
    };

    $scope.signOut = function() {
        $scope.auth.$logout();
        $rootScope.$emit('BPM.UserSignedOut');
        $location.path('#');
    };

    $scope.signUp = function() {
        console.log('attempting to register');

        if ($scope.player.password != $scope.player.confirm_password)
        {
            errorHandler({code: 'PASSWORD_MISMATCH', message: 'Passwords do not match'});
            return;
        }

        $scope.auth.$createUser($scope.player.email, $scope.player.password, false)
            .then(function(user) {
                var playerRef = new Firebase(bpmSettings.bpmURL + '/players/' + user.id);
                var player = $firebase(playerRef);
                delete $scope.player.password; // Don't store the password
                delete $scope.player.confirm_password; // Don't store the password
                player.$set($scope.player); // Store the player
                console.log('created user ' + user.id);

                $scope.signIn();
            },
            function(error) {
                errorHandler(error);
            });
    };
});

app.controller('MainCtrl', function($scope, $location, $firebase, $firebaseSimpleLogin) {
    var bpmRef = new Firebase("https://bowlpoolmanager.firebaseio.com");
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

    $scope.$onRootScope('BPM.UserSignedIn', function() {
        $scope.isReady = false;
        var playersRef = new Firebase(bpmSettings.bpmURL + '/' + 'players');
        // console.log('setting current player in nav');
        //$scope.currentPlayer = BowlPoolManager.currentPlayer;
        $scope.user = $scope.auth.$getCurrentUser();
        $scope.isReady = true;
    });

    $scope.$onRootScope('BPM.UserSignedOut', function() {
        console.log('clearing current player');
        $scope.currentPlayer = null;
        $rootScope.user = null;
    });

    $scope.isReady = true;
});

app.controller('PicksCtrl', function($scope, $controller,$firebase, $modal, bpmSettings) {
    $controller('BaseRouteCtrl', {$scope: $scope});
});

app.controller('PlayerCtrl', function($scope, $controller, $firebase, $modal, bpmSettings) {
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

    $scope.$onRootScope('BPM.UserSignedOut', function() {
        console.log('clearing players');
        $scope.players = null;
    });

    $scope.list();
    $scope.players.$bind($scope, "remotePlayers");
});

app.controller('PoolCtrl', function($scope, $controller, $firebase, $modal, bpmSettings) {
    $controller('BaseRouteCtrl', {$scope: $scope});

    var poolsRef = new Firebase(bpmSettings.bpmURL + '/' + 'pools');

    $scope.add = function ($newPool) {
        console.log('adding a pool');
        $scope.pools.$add($newPool);
        console.log('pool added');
    };

    $scope.list = function () {
        console.log('listing pools');
        $scope.pools = $firebase(poolsRef);
        console.log('pool list received');
    };

    $scope.view = function (pool) {
        var modalInstance = null;

        if (pool) {
            modalInstance = $modal.open({
                templateUrl: 'partial/pool.html',
                controller: ModalDetailCtrl,
                resolve: {
                    items: function () {
                        return pool;
                    }
                }
            });
        }

        else {
            modalInstance = $modal.open({
                templateUrl: 'partial/poolCreate.html',
                controller: ModalEditorCtrl,
                resolve: {
                    items: function () {
                        return pool;
                    }
                }
            });
        }
    };

    $scope.$onRootScope('BPM.UserSignedOut', function() {
        console.log('clearing pools');
        $scope.pools = null;
    });

    $scope.list();
    $scope.pools.$bind($scope, "remotePools");
});

app.controller('ProfileCtrl', function($scope, $controller, $firebase, $firebaseSimpleLogin, $location, $alert, bpmSettings) {
    $controller('BaseRouteCtrl', {$scope: $scope});

    var bpmRef = new Firebase(bpmSettings.bpmURL);
    $scope.auth = $firebaseSimpleLogin(bpmRef);

    if (!$scope.auth) {
        $location.path('#');
        return;
    }

    $scope.user = $scope.auth.$getCurrentUser()
        .then(function(user) {
            var playerRef = new Firebase(bpmSettings.bpmURL + '/' + 'players/' + user.id);

            $scope.player = $firebase(playerRef);
        },
        function(error) {

        });

    $scope.save = function() {
        $scope.player.$save()
            .then(function() {
                $alert.$success("Saved!");
            },
            function(error) {

            });
    };

    $scope.$onRootScope('BPM.UserSignedOut', function() {
        console.log('clearing player');
        $scope.player = null;
    });
});

app.controller('BaseRouteCtrl', function($scope, $alert) {
    $scope.$on("$destroy", function(event, val) {
        $alert.$clear();
    });
});

app.controller('SettingsCtrl', function($scope, $controller, $firebase, bpmSettings) {
    $controller('BaseRouteCtrl', {$scope: $scope});

});

app.controller('SetupCtrl', function($scope, $controller, $firebase, bpmSettings) {
    $controller('BaseRouteCtrl', {$scope: $scope});

    $scope.isReady = false;
    var setup = new Firebase(bpmSettings.bpmURL + '/' + 'setup');

    $scope.clear = function () {
        console.log('Clearing database');
        $scope.statusMessage = 'Clearing database';
        $scope.statusAlertLevel = 'alert-info';
        //$scope.init.$delete();
        $scope.statusMessage = 'Database cleared';
        $scope.statusAlertLevel = 'alert-success';
    };

    $scope.initialize = function () {
        console.log('Initializing database');
        $scope.statusMessage = 'Initializing database';
        $scope.statusAlertLevel = 'alert-info';
        //$scope.init.$save();
        $scope.statusMessage = 'Database initialized';
        $scope.statusAlertLevel = 'alert-success';
    };
});

app.controller('StubCtrl', function($scope, $controller) {
    $controller('BaseRouteCtrl', {$scope: $scope});
});

app.controller('TeamCtrl', function($scope, $controller, $firebase, $modal, bpmSettings) {
    $controller('BaseRouteCtrl', {$scope: $scope});

    var teamsRef = new Firebase(bpmSettings.bpmURL + '/' + 'teams');

    $scope.add = function ($newTeam) {
        console.log('adding a team');
        $scope.pools.$add($newTeam);
        console.log('team added');
    };

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

    $scope.$onRootScope('BPM.UserSignedOut', function() {
        console.log('clearing teams');
        $scope.teams = null;
    });

    $scope.list();
    $scope.teams.$bind($scope, "remoteTeams")
});

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
