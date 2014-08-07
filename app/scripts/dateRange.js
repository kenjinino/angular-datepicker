'use strict';

var Module = angular.module('datePicker');

Module.directive('dateRange', function () {
  return {
    templateUrl: 'templates/daterange.html',
    scope: {
      start: '=',
      end: '='
    },
    link: function (scope, element, attrs) {
      attrs.$observe('disabled', function(isDisabled){
          scope.disableDatePickers = !!isDisabled;
        });
      scope.$watch('start.getTime()', function (value) {
        if (value && scope.end && value > scope.end.getTime()) {
          scope.end = new Date(value);
        }
      });
      scope.$watch('end.getTime()', function (value) {
        if (value && scope.start && value < scope.start.getTime()) {
          scope.start = new Date(value);
        }
      });

      scope.setToday = function () {
        scope.start = new Date();
        scope.end = new Date();
      };

      scope.setYesterday = function () {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        scope.start = yesterday;
        scope.end = yesterday;
      };

      scope.setLastWeek = function () {
        var lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        scope.start = lastWeek;
        scope.end = new Date();
      };

      scope.setLastMonth = function () {
        var lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        scope.start = lastMonth;
        scope.end = new Date();
      };
    }
  };
});
