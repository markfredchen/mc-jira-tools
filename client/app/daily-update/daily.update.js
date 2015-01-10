'use strict';

angular.module('mcJiraToolsApp')
    .config(function ($stateProvider) {
        $stateProvider
            .state('daily-update', {
                url: '/daily-update',
                templateUrl: 'app/daily-update/daily.update.html',
                controller: 'DailyUpdateCtrl'
            });
    })
    .controller('DailyUpdateCtrl', ['$scope', '$cookieStore', '$http', '$location', function ($scope, $cookieStore, $http, $location) {
        $scope.issues = {};
        $scope.taskTypes = ['Design Discussion', 'Coding', 'Code Review', 'Checklist', 'Test Case', 'Testing', 'Other'];

        $scope.doneTasks = [];
        $scope.todoTasks = [];
        $scope.blockedTasks = [];

        $scope.hasDoneTask = function (story) {
            var hasDoneTask = false;
            angular.forEach(story.tasks, function (task) {
                if (task.isDone) {
                    hasDoneTask = true;
                }
            });
            return hasDoneTask;
        }

        $scope.hasTodoTask = function (story) {
            var hasTodoTask = false;
            angular.forEach(story.tasks, function (task) {
                if (task.isTodo) {
                    hasTodoTask = true;
                }
            });
            return hasTodoTask;
        };

        $scope.isDoneTask = function(task) {
            return task.taskState == "Done";
        };

        $scope.getDoneTasks = function (story) {
            var doneTasks = [];
            angular.forEach(story.tasks, function (task) {
                if (task.isDone) {
                    doneTasks.push(task);
                }
            });
            return getIssueTypes(doneTasks).join();
        }

        $scope.getTodoTasks = function (story) {
            var todoTasks = [];
            angular.forEach(story.tasks, function (task) {
                if (task.isTodo) {
                    todoTasks.push(task);
                }
            });
            return getIssueTypes(todoTasks).join();
        };

        $scope.getAllTodoTasks = function () {
            var todoTasks = [];
            angular.forEach($scope.issues.userStories, function (story) {
                angular.forEach(story.tasks, function (task) {
                    if (task.isTodo) {
                        todoTasks.push(task);
                    }
                });
            });
            return todoTasks;
        }

        var getIssueTypes = function (tasks) {
            var types = [];

            angular.forEach(tasks, function (task) {
                if (types.indexOf(task.type) == -1 && task.type != '') {
                    types.push(task.type);
                }
            });
            return types;
        }


        $scope.initData = function () {
            $scope.team = $cookieStore.get('team');
            var postData = {
                auth: $cookieStore.get('auth'),
                rapidViewID: $cookieStore.get('rapidViewID')
            }
            $http.post('/api/jiras/issues', postData)
                .success(function (data, status, headers, config) {
                    console.log(status);
                    $scope.issues = JSON.parse(data);
                }).error(function (data, status, headers, config) {
                    console.log(data.error);
                    $location.path("/");
                });

        }

        $scope.initData();

    }]);
