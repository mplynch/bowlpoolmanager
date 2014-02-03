function MainCtrl($scope, $routeParams, $location, $firebase) {
    var firebase = new Firebase("https://bowlpoolmanager.firebaseio.com/");

    $scope.currentPlayer = { email: "mplynch@gmail.com", admin: true };

    $scope.auth = function () {

    };

    $scope.unauth = function () {

    };

    $scope.navClass = function (page) {
        var currentRoute = $location.path();
        return page === currentRoute ? 'active' : '';
    };

    console.log('setting current player in nav');
    //$scope.currentPlayer = BowlPoolManager.currentPlayer;
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

function PlayerCtrl($scope, $routeParams, $firebase, $modal) {
    var playerRef = new Firebase("https://bowlpoolmanager.firebaseio.com/players");
    $scope.players = $firebase(playerRef);

    $scope.list = function () {
        console.log('listing players');
        $scope.players = $firebase(playerRef);
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
    $scope.teams.$bind($scope, "remoteTeams");
}

var ModalDetailCtrl = function ($scope, $modalInstance, items) {
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

function ErrorCtrl($scope) {

}