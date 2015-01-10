'use strict';

angular.module('mcJiraToolsApp', [
    'ngCookies',
    'ngResource',
    'ngSanitize',
    'ui.router',
    'ui.bootstrap',
    'ab-base64'
])
    .config(function ($stateProvider, $urlRouterProvider, $locationProvider) {
        $urlRouterProvider
            .otherwise('/');

        $locationProvider.html5Mode(true);
    })
    .run(function($rootScope, $cookieStore, $location){
        $rootScope.$on("$stateChangeStart", function(event, next, current){
            if(!$cookieStore.get('auth') && next.templateUrl != 'app/main/main.html'){
                $location.path("/");
            }
        });
    });

