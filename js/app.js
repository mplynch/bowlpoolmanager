var app = angular.module('bowlpoolmanager', ['BowlPoolManager', 'ui.bootstrap']);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/init', {
		controller : InitCtrl,
		templateUrl : '/partial/init.html'
	}).when('/pools', {
		controller : PoolListCtrl,
		templateUrl : '/partial/pools.html'
	}).when('/pools/:id', {
		controller : PoolDetailCtrl,
		templateUrl : '/partial/pool.html'
	}).when('/teams', {
		controller : TeamListCtrl,
		templateUrl : '/partial/teams.html'
	}).when('/teams/:id', {
		controller : TeamDetailCtrl,
		templateUrl : '/partial/team.html'
	}).when('/players/:id', {
		controller : PlayerDetailCtrl,
		templateUrl : '/partial/player.html'
	}).when('/players', {
		controller : PlayerListCtrl,
		templateUrl : '/partial/players.html'
	}).when('/404', {
		controller : ErrorCtrl,
		templateUrl : '/partial/404.html'
	}).when('/', {
		controller : MainCtrl,
		templateUrl : '/partial/home.html'
	}).otherwise({
		redirectTo : '/'
	});
});

function init() {
	angular.element(document).ready(function() {
		window.init();
	});
}