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
    .controller('DailyUpdateCtrl', ['$scope', '$cookieStore', '$http', '$location', '$modal', function ($scope, $cookieStore, $http, $location, $modal) {
        $scope.today = new Date().getTime();
        $scope.issues = {};
        $scope.taskTypes = ['Design Discussion', 'Coding', 'Code Review', 'Checklist', 'Test Case', 'Testing', 'Automation', 'Other'];

        $scope.isDoneTask = function (task) {
            return task.taskState == "Done";
        };
        $scope.toggleStory = function (story) {
            if (!story.isHide) {
                story.isHide = true;
            } else {
                story.isHide = !story.isHide;
            }

        };
        $scope.initData = function () {
            $scope.team = $cookieStore.get('team');
            var postData = {
                auth: $cookieStore.get('auth'),
                rapidViewID: $cookieStore.get('rapidViewID')
            }
            $http.post('/api/jiras/issues', postData)
                .success(function (data, status, headers, config) {

                    $scope.issues = JSON.parse(data);
                    angular.forEach($scope.issues.userStories, function (story) {
                        angular.forEach(story.tasks, function (task) {
                            if (task.summary.toLowerCase().indexOf('coding') != -1) {
                                task.type = 'Coding';
                            } else if (task.summary.toLowerCase().indexOf('code review') != -1) {
                                task.type = 'Code Review';
                            } else if (task.summary.toLowerCase().indexOf('design') != -1 || task.summary.toLowerCase().indexOf('discussion') != -1) {
                                task.type = 'Design Discussion';
                            } else if (task.summary.toLowerCase().indexOf('checklist') != -1) {
                                task.type = 'Checklist';
                            } else if (task.summary.toLowerCase().indexOf('test case') != -1) {
                                task.type = 'Test Case';
                            } else if (task.summary.toLowerCase().indexOf('testing') != -1) {
                                task.type = 'Testing';
                            } else if (task.summary.toLowerCase().indexOf('automation') != -1) {
                                task.type = 'Automation';
                            } else {
                                task.type = 'Other';
                            }
                        });
                    });
                }).error(function (data, status, headers, config) {
                    console.log(data.error);
                    $location.path("/");
                });

        }
        $scope.openReport = function () {

            $modal.open({
                templateUrl: 'report.html',
                controller: 'ReportController',
                size: 'lg',
                resolve: {
                    data: function () {
                        return {
                            "userStories": $scope.issues.userStories,
                            "team": $scope.team,
                            "today": $scope.today
                        }
                    }
                }
            });
        }

        $scope.initData();

    }])
    .controller('ReportController', function ($scope, $modalInstance, data) {
        $scope.userStories = data.userStories;
        $scope.team = data.team;
        $scope.today = data.today;
        $scope.todoUserStories = [];
        $scope.hasDoneTask = function (story) {
            var hasDoneTask = false;
            angular.forEach(story.tasks, function (task) {
                if (task.isDone) {
                    hasDoneTask = true;
                }
            });
            return hasDoneTask;
        };
        $scope.getDoneTasks = function (story) {
            var doneTasks = [];
            angular.forEach(story.tasks, function (task) {
                if (task.isDone) {
                    doneTasks.push(task);
                }
            });
            return getIssueTypes(doneTasks).join();
        };
        $scope.hasTodoTask = function (story) {
            var hasTodoTask = false;
            angular.forEach(story.tasks, function (task) {
                if (task.isTodo) {
                    hasTodoTask = true;
                }
            });
            return hasTodoTask;
        };
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
            if($scope.todoUserStories.length > 0){
                return;
            }
            for( var i = 0; i < $scope.userStories.length; i++) {
                var story = $scope.userStories[i];
                var todoUserStory = {
                    key: story.userStoryID,
                    summary: story.summary,
                    tasks: []
                }
                for (var j = 0; j < story.tasks.length; j++) {
                    var task = story.tasks[j];
                    if (task.isTodo) {
                        todoUserStory.tasks.push(task);
                    }
                }
                if(todoUserStory.tasks.length > 0) {
                    $scope.todoUserStories.push(todoUserStory);
                }
            }
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

        $scope.getAllTodoTasks();
    });
