var myApp = angular.module('myApp',
    ['myApp.config', 'myApp.routes', 'myApp.filters', 'myApp.services', 'myApp.directives',
        'myApp.controllers', 'routeSecurity', 'ui.bootstrap']);

myApp.config(['$provide', function ($provide) {
    $provide.decorator('$rootScope', ['$delegate', function ($delegate) {

        Object.defineProperty($delegate.constructor.prototype, '$onRootScope', {
            value: function (name, listener) {
                var unsubscribe = $delegate.$on(name, listener);
                this.$on('$destroy', unsubscribe);
            },
            enumerable: false
        });

        return $delegate;
    }]);
}]);

myApp.run(['loginService', '$rootScope', 'FBURL', 'bpmWaitForAdmin', function (loginService, $rootScope, FBURL, bpmWaitForAdmin) {
    if (FBURL === 'https://INSTANCE.firebaseio.com') {
        // double-check that the app has been configured
        angular.element(document.body).html('<h1>Please configure app/js/config.js before running!</h1>');
        setTimeout(function () {
            angular.element(document.body).removeClass('hide');
        }, 250);
    }
    else {
        // establish authentication
        $rootScope.auth = loginService.init('/login');

        // Set up admin rights monitoring
        $rootScope.admin = bpmWaitForAdmin.init($rootScope.auth);

        $rootScope.FBURL = FBURL;
    }
}]);