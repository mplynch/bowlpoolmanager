var app = angular.module('bowlpoolmanager', ['ngRoute', 'ui.bootstrap', 'firebase']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        controller : 'HomeCtrl',
        templateUrl : 'partial/home.html'
    });

    $routeProvider.when('/picks', {
        controller : 'PicksCtrl',
        templateUrl : 'partial/picks.html'
    });

    $routeProvider.when('/players', {
        controller : 'PlayerCtrl',
        templateUrl : 'partial/players.html'
    });

    $routeProvider.when('/players/:id', {
        controller : 'PlayerCtrl',
        templateUrl : 'partial/player.html'
    });

    $routeProvider.when('/pools', {
        controller : 'PoolCtrl',
        templateUrl : 'partial/pools.list.html'
    });

    $routeProvider.when('/pools/:id', {
        controller : 'PoolDetailCtrl',
        templateUrl : 'partial/pools.detail.html'
    });

    $routeProvider.when('/profile', {
        controller : 'ProfileCtrl',
        templateUrl : 'partial/profile.html'
    });

    $routeProvider.when('/resetpassword', {
        controller : 'LoginCtrl',
        templateUrl: 'partial/resetpassword.html'
    });

    $routeProvider.when('/settings', {
        controller : 'SettingsCtrl',
        templateUrl: 'partial/settings.html'
    });
    $routeProvider.when('/setup', {
        controller : 'SetupCtrl',
        templateUrl : 'partial/setup.html'
    });

    $routeProvider.when('/signin', {
        controller : 'LoginCtrl',
        templateUrl: 'partial/signin.html'
    });

    $routeProvider.when('/signup', {
        controller : 'LoginCtrl',
        templateUrl: 'partial/signup.html'
    });

    $routeProvider.when('/teams', {
        controller : 'TeamCtrl',
        templateUrl : 'partial/teams.html'
    });

    $routeProvider.when('/teams/:id', {
        controller : 'TeamCtrl',
        templateUrl : 'partial/team.html'
    });

    $routeProvider.otherwise({
        redirectTo : '/'
    });
});

app.config(['$provide', function($provide){
    $provide.decorator('$rootScope', ['$delegate', function($delegate){

        Object.defineProperty($delegate.constructor.prototype, '$onRootScope', {
            value: function(name, listener){
                var unsubscribe = $delegate.$on(name, listener);
                this.$on('$destroy', unsubscribe);
            },
            enumerable: false
        });

        return $delegate;
    }]);
}]);