'use strict';

angular.module('mcJiraToolsApp')
  .controller('NavbarCtrl', function ($scope, $location) {
    $scope.menu = [{
      'title': 'Set up Jira Account',
      'link': '/'
    }, {
        'title': 'Daily Update',
        'link': '/daily-update'
    }, {
        'title': 'Sprint Review',
        'link': '/sprint-review'
    }];

    $scope.isCollapsed = true;

    $scope.isActive = function(route) {
      return route === $location.path();
    };
  });
