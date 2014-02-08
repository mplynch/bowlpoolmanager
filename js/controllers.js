function ErrorCtrl($scope) {

}

function LoginCtrl($scope, $location, $firebase, $firebaseSimpleLogin) {
    var bpmRef = new Firebase("https://bowlpoolmanager.firebaseio.com");
    $scope.auth = $firebaseSimpleLogin(bpmRef);

    $scope.resetPassword = function() {
        console.log('attempting to send password reset email');

        $scope.auth.$sendPasswordResetEmail($scope.player.email)
            .then(function() {
                console.log('password reset email sent');
                // TODO: Notify user
            },
            function() {
                console.log('failed to send password reset email');
                // TODO: Notify user
            });
    };

    $scope.signIn = function() {
        console.log('attempting to sign in');

        $scope.auth.$login('password', {
            email : $scope.player.email,
            password: $scope.player.password,
            rememberMe: $scope.player.rememberMe
        }).then(function(user) {
                console.log('logged in as ', user.email);
                $scope.auth = $scope.auth;
                $location.path('#');
            },
            function(error) {
                console.error('login failed: ', error);
                // TODO: Notify user
            });
    };

    $scope.signUp = function() {
        console.log('attempting to register');

        $scope.auth.$createUser($scope.player.email, $scope.player.password, false)
            .then(function(user) {
                console.log('created user ' + user.id);
                $location.path('#');
            },
            function(error) {
                console.log('failed to create user: ', error);
                // TODO: Notify user
            });
    };
}

function MainCtrl($scope, $routeParams, $location, $firebase, $firebaseSimpleLogin, $modal) {
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

    console.log('setting current player in nav');
    //$scope.currentPlayer = BowlPoolManager.currentPlayer;
}

function PlayerCtrl($scope, $routeParams, $firebase, $modal) {
    var playersRef = new Firebase("https://bowlpoolmanager.firebaseio.com/players");

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

    $scope.list();
    $scope.players.$bind($scope, "remotePlayers");
}

function PoolCtrl($scope, $routeParams, $firebase, $modal) {
    var poolRef = new Firebase("https://bowlpoolmanager.firebaseio.com/pools");

    $scope.add = function ($newPool) {
        console.log('adding a pool');
        $scope.pools.$add($newPool);
        console.log('pool added');
    };

    $scope.list = function () {
        console.log('listing pools');
        $scope.pools = $firebase(poolRef);
        console.log('pool list received');
    };

    $scope.view = function (pool) {
        var modalInstance = $modal.open({
            templateUrl: 'partial/pool.html',
            controller: ModalDetailCtrl,
            resolve: {
                items: function () {
                    return pool;
                }
            }
        });
    };

    $scope.list();
    $scope.pools.$bind($scope, "remotePools");
}

function SettingsCtrl($scope, $firebase) {

}

function SetupCtrl($scope, $firebase) {
    var setupRef = new Firebase("https://bowlpoolmanager.firebaseio.com/setup");

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
}

function TeamCtrl($scope, $routeParams, $firebase, $modal) {
    var teamRef = new Firebase("https://bowlpoolmanager.firebaseio.com/teams");

    $scope.add = function ($newTeam) {
        console.log('adding a team');
        $scope.pools.$add($newTeam);
        console.log('team added');
    };

    $scope.list = function () {
        console.log('listing teams');
        $scope.teams = $firebase(teamRef);
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

    $scope.list();
    $scope.teams.$bind($scope, "remoteTeams")

}

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
        $modalInstance.close($scope.selected.item);
    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};
