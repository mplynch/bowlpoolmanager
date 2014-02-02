function MainCtrl($scope, $window, $routeParams, $location, BowlPoolManager) {
	$window.init = function() {
		console.log('called init');
		$scope.$apply(BowlPoolManager.load($scope));
	};

	$scope.auth = function() {
		BowlPoolManager.auth();
	};

	$scope.unauth = function() {
		BowlPoolManager.unauth();
	};

	$scope.navClass = function(page) {
		var currentRoute = $location.path();
		return page === currentRoute ? 'active' : '';
	};

	console.log('setting current player in nav');
	$scope.currentPlayer = BowlPoolManager.currentPlayer;
}

function InitCtrl($scope, Init) {
	$scope.init = Init.get();

	$scope.clear = function() {
		console.log('Clearing database');
		$scope.statusMessage = 'Clearing database';
		$scope.statusAlertLevel = 'alert-info';
		$scope.init.$delete();
		$scope.statusMessage = 'Database cleared';
		$scope.statusAlertLevel = 'alert-success';
	};

	$scope.initialize = function() {
		console.log('Initializing database');
		$scope.statusMessage = 'Initializing database';
		$scope.statusAlertLevel = 'alert-info';
		$scope.init.$save();
		$scope.statusMessage = 'Database initialized';
		$scope.statusAlertLevel = 'alert-success';
	};
}

function PlayerDetailCtrl($scope, $routeParams, BowlPoolManager) {
	console.log('getting a player');
	BowlPoolManager.client.bowlpoolmanager.getPlayer($routeParams).execute(function(resp) {
		console.log(resp);
		$scope.player = resp;
		$scope.$apply();
		console.log('player received');
	});

	$scope.insert = function() {
		console.log('inserting a player');
		BowlPoolManager.client.bowlpoolmanager.insertPlayer($scope.player).execute(function(resp) {
			$scope.players.push(resp);
			$scope.apply();
			console.log('player inserted');
		});
	};

	$scope.remove = function() {
		console.log('removing a player');
		BowlPoolManager.client.bowlpoolmanager.removePlayer($routeParams).execute(function(resp) {
			$scope.players.push(resp);
			$scope.apply();
			console.log('player removed');
		});
	};
}

function PlayerListCtrl($scope, $routeParams, BowlPoolManager) {
	$scope.list = function() {
		console.log('listing players');
		BowlPoolManager.client.bowlpoolmanager.listPlayer().execute(function(resp) {
			console.log(resp);
			$scope.players = resp.items;
			$scope.$apply();
			console.log('player list received');
		});
	};

	$scope.list();
}

function PoolDetailCtrl($scope, $routeParams, Pool, BowlPoolManager) {
	console.log('getting pool');
	BowlPoolManager.client.bowlpoolmanager.getPool($routeParams).execute(function(resp) {
		console.log(resp);
		$scope.pool = resp;
		$scope.$apply();
		console.log('pool received');
	});

	$scope.insert = function() {
		console.log('inserting a pool');
		BowlPoolManager.client.bowlpoolmanager.insertPool($scope.pool).execute(function(resp) {
			$scope.bowls.push(resp);
			$scope.apply();
			console.log('pool inserted');
		});
	};

	$scope.remove = function() {
		console.log('removing a pool');
		BowlPoolManager.client.bowlpoolmanager.removePool($routeParams).execute(function(resp) {
			$scope.bowls.push(resp);
			$scope.apply();
			console.log('pool removed');
		});
	};
}

function PoolListCtrl($scope, BowlPoolManager) {
	$scope.list = function() {
		console.log('listing pools');
		BowlPoolManager.client.bowlpoolmanager.listPool().execute(function(resp) {
			console.log(resp);
			$scope.pools = resp.items;
			$scope.$apply();
			console.log('pool list received');
		});
	};

	$scope.list();
}

function TeamDetailCtrl($scope, $routeParams, $location, BowlPoolManager) {
	console.log('getting a team');
	BowlPoolManager.client.bowlpoolmanager.getTeam($routeParams).execute(function(resp) {
		console.log(resp);
		$scope.team = resp;
		$scope.$apply();
		console.log('team received');
	});
}

function TeamListCtrl($scope, BowlPoolManager) {
	$scope.list = function() {
		console.log('listing teams');
		BowlPoolManager.client.bowlpoolmanager.listTeam().execute(function(resp) {
			console.log(resp);
			$scope.teams = resp.items;
			$scope.$apply();
			console.log('team list received');
		});
	};

	$scope.list();
}

function ErrorCtrl($scope) {

}