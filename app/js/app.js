var app = angular.module('bowlpoolmanager', ['ngRoute', 'ui.bootstrap', 'firebase']);

app.config(function($routeProvider, $locationProvider) {
    $routeProvider.when('/', {
        controller : 'HomeCtrl',
        templateUrl : 'partials/home.html'
    });

    $routeProvider.when('/picks', {
        controller : 'PicksCtrl',
        templateUrl : 'partials/picks.html'
    });

    $routeProvider.when('/players', {
        controller : 'PlayerCtrl',
        templateUrl : 'partials/players.html'
    });

    $routeProvider.when('/players/:id', {
        controller : 'PlayerCtrl',
        templateUrl : 'partials/player.html'
    });

    $routeProvider.when('/pools', {
        controller : 'PoolCtrl',
        templateUrl : 'partials/pools.list.html'
    });

    $routeProvider.when('/pools/:id', {
        controller : 'PoolDetailCtrl',
        templateUrl : 'partials/pools.detail.html'
    });

    $routeProvider.when('/profile', {
        controller : 'ProfileCtrl',
        templateUrl : 'partials/profile.html'
    });

    $routeProvider.when('/resetpassword', {
        controller : 'LoginCtrl',
        templateUrl: 'partials/resetpassword.html'
    });

    $routeProvider.when('/settings', {
        controller : 'SettingsCtrl',
        templateUrl: 'partials/settings.html'
    });
    $routeProvider.when('/setup', {
        controller : 'SetupCtrl',
        templateUrl : 'partials/setup.html'
    });

    $routeProvider.when('/signin', {
        controller : 'LoginCtrl',
        templateUrl: 'partials/signin.html'
    });

    $routeProvider.when('/signup', {
        controller : 'LoginCtrl',
        templateUrl: 'partials/signup.html'
    });

    $routeProvider.when('/teams', {
        controller : 'TeamCtrl',
        templateUrl : 'partials/teams.html'
    });

    $routeProvider.when('/teams/:id', {
        controller : 'TeamCtrl',
        templateUrl : 'partials/team.html'
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