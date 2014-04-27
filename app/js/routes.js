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

            $routeProvider.when('/bowls', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'BowlsCtrl',
                templateUrl : 'partials/bowls.list.html'
            });

            $routeProvider.when('/invitations', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'InvitationsCtrl',
                templateUrl : 'partials/invitations.list.html'
            });

            $routeProvider.when('/picks', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'PicksCtrl',
                templateUrl : 'partials/picks.html'
            });

            $routeProvider.when('/users', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'UserCtrl',
                templateUrl : 'partials/users.html'
            });

            $routeProvider.when('/users/:id', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'UserCtrl',
                templateUrl : 'partials/users.edit.html'
            });

            $routeProvider.when('/pools', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'PoolCtrl',
                templateUrl : 'partials/pools.list.html'
            });

            $routeProvider.when('/pools/:id', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'PoolDetailCtrl',
                templateUrl : 'partials/pools.view.html'
            });

            $routeProvider.when('/preferences', {
                authRequired: true, // must authenticate before viewing this page
                controller : '/PreferencesCtrl',
                templateUrl: 'partials/preferences.html'
            });

            $routeProvider.when('/profile', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'ProfileCtrl',
                templateUrl : 'partials/profile.html'
            });

            $routeProvider.when('/settings', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'SettingsCtrl',
                templateUrl : 'partials/settings.html'
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

            $routeProvider.when('/teams', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'TeamCtrl',
                templateUrl : 'partials/teams.html'
            });

            $routeProvider.when('/teams/:id', {
                authRequired: true, // must authenticate before viewing this page
                controller : 'TeamCtrl',
                templateUrl : 'partials/teams.view.html'
            });

            $routeProvider.otherwise({
                redirectTo : '/'
            });
        }]);