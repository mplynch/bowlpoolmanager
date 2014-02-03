var app = angular.module('bowlpoolmanager', ['ui.bootstrap', 'firebase', 'ngRoute']);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/setup', {
		controller : SetupCtrl,
		templateUrl : 'partial/setup.html'
	}).when('/pools', {
		controller : PoolCtrl,
		templateUrl : 'partial/pools.html'
	}).when('/pools/:id', {
		controller : PoolCtrl,
		templateUrl : 'partial/pool.html'
	}).when('/teams', {
		controller : TeamCtrl,
		templateUrl : 'partial/teams.html'
	}).when('/teams/:id', {
		controller : TeamCtrl,
		templateUrl : 'partial/team.html'
	}).when('/players/:id', {
		controller : PlayerCtrl,
		templateUrl : 'partial/player.html'
	}).when('/players', {
		controller : PlayerCtrl,
		templateUrl : 'partial/players.html'
	}).when('/404', {
		controller : ErrorCtrl,
		templateUrl : 'partial/404.html'
	}).when('/', {
		controller : MainCtrl,
		templateUrl : 'partial/home.html'
	}).otherwise({
		redirectTo : '/'
	});
});