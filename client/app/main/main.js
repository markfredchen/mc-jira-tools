'use strict';

angular.module('mcJiraToolsApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('main', {
                url: '/',
                templateUrl: 'app/main/main.html',
                controller: 'MainCtrl'
            });
    })
    .controller('MainCtrl', ['$scope', '$cookieStore', 'base64', '$location', '$http', function ($scope, $cookieStore, base64, $location, $http) {
        $scope.getTeams = function () {
            $http.get('/api/jiras/teams').success(function(data){
                $scope.teams = data.teams;
            });
        };
        $scope.saveCookie = function () {
            $cookieStore.put('auth', base64.encode($scope.username + ':' + $scope.password));
            $cookieStore.put('username', $scope.username);
            $scope.team = {};
            angular.forEach($scope.teams, function(value){
                var members = value.members;
                //console.log(key);
                console.log(value);
                console.log(members);
                for(var i = 0; i<members.length; i++) {
                    if(members[i] === $scope.username){
                        $scope.team = value;
                    }
                }
            });
            $cookieStore.put('team', $scope.team.name);
            $cookieStore.put('rapidViewID', $scope.team.rapidViewID);
            $location.path('/daily-update');
        };
        $scope.getTeams();
    }]);
