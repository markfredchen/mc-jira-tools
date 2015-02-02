'use strict';

angular.module('mcJiraToolsApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('sprint-review', {
                url: '/sprint-review',
                templateUrl: 'app/sprint-review-report/sprint-review.html',
                controller: 'SprintReviewCtrl'
            });
    })
    .controller('SprintReviewCtrl', ['$scope', '$cookieStore', '$http', function ($scope, $cookieStore, $http) {
        $scope.initData = function () {
            $scope.team = $cookieStore.get('team');
            var postData = {
                auth: $cookieStore.get('auth'),
                rapidViewID: $cookieStore.get('rapidViewID')
            };
            $http.post('/api/jiras/sprintReview', postData)
                .success(function (data) {
                    $scope.issues = JSON.parse(data);

                });
        };
        $scope.initData();

        $scope.isDone = function (story) {
            return story.status === 'Done';
        };

        $scope.storyStatuses = ['Done', 'In Progress', 'Active', 'Approved'];

        $scope.plannedSPs = function(){
            var plannedSPs = 0;
            angular.forEach($scope.issues.userStories, function (story) {
                plannedSPs += story.points;
            });

            return plannedSPs;
        };
        $scope.acceptedSPs = function(){
            var acceptedSPs = 0;
            angular.forEach($scope.issues.userStories, function (story) {
                if(story.status === 'Done') {
                    acceptedSPs += story.points;
                }
            });

            return acceptedSPs;
        };
        $scope.countOfAcceptedUS = function(){
            var count = 0;
            angular.forEach($scope.issues.userStories, function (story) {
                if(story.status === 'Done') {
                    count++;
                }
            });

            return count;
        };
        $scope.countOfZeroDefectUS = function(){
            var count = 0;
            angular.forEach($scope.issues.userStories, function (story) {
                if(story.status === 'Done' && story.countOfDefects === 0) {
                    count++;
                }
            });
            return count;
        };

        $scope.countOfInSprintDefects = function(){
            var count = 0;
            angular.forEach($scope.issues.userStories, function (story) {
                if(story.status === 'Done') {
                    count += story.countOfDefects;
                }
            });
            return count;
        };
        $scope.totalHours = function(){
            var totalHours = 0;
            angular.forEach($scope.issues.userStories, function (story) {
                totalHours += story.hoursSpent;
            });
            return totalHours;
        };
        $scope.newDevHours = function(){
            var totalHours = 0;
            angular.forEach($scope.issues.userStories, function (story) {
                if(story.isNewDev) {
                    totalHours += story.hoursSpent;
                }
            });
            return totalHours;
        };
        $scope.nonRoadmapHours = function () {
            var totalHours = 0;
            angular.forEach($scope.issues.userStories, function (story) {
                if(story.isNonRoadMap) {
                    totalHours += story.hoursSpent;
                }
            });
            return totalHours;
        };
    }]);
