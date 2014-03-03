"use strict";

angular.module('myApp.routes', ['ngRoute'])

    // configure views; the authRequired parameter is used for specifying pages
    // which should only be available while logged in
    .config(['$routeProvider', '$locationProvider',
        function($routeProvider, $locationProvider) {
        $routeProvider.when('/', {
            controller : 'HomeCtrl',
            templateUrl : 'partials/home.html'
        });

        $routeProvider.when('/picks', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'PicksCtrl',
            templateUrl : 'partials/picks.html'
        });

        $routeProvider.when('/players', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'PlayerCtrl',
            templateUrl : 'partials/players.html'
        });

        $routeProvider.when('/players/:id', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'PlayerCtrl',
            templateUrl : 'partials/player.html'
        });

        $routeProvider.when('/pools', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'PoolCtrl',
            templateUrl : 'partials/pools.list.html'
        });

        $routeProvider.when('/pools/:id', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'PoolDetailCtrl',
            templateUrl : 'partials/pools.detail.html'
        });

        $routeProvider.when('/profile', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'ProfileCtrl',
            templateUrl : 'partials/profile.html'
        });

        $routeProvider.when('/resetpassword', {
            controller : 'LoginCtrl',
            templateUrl: 'partials/resetpassword.html'
        });

        $routeProvider.when('/settings', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'SettingsCtrl',
            templateUrl: 'partials/settings.html'
        });
        $routeProvider.when('/setup', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'SetupCtrl',
            templateUrl : 'partials/setup.html'
        });

        $routeProvider.when('/login', {
            controller : 'LoginCtrl',
            templateUrl: 'partials/login.html'
        });

        $routeProvider.when('/signup', {
            controller : 'LoginCtrl',
            templateUrl: 'partials/signup.html'
        });

        $routeProvider.when('/teams', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'TeamCtrl',
            templateUrl : 'partials/teams.html'
        });

        $routeProvider.when('/teams/:id', {
            authRequired: true, // must authenticate before viewing this page
            controller : 'TeamCtrl',
            templateUrl : 'partials/team.html'
        });

        $routeProvider.otherwise({
            redirectTo : '/'
        });
    }]);