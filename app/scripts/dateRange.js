'use strict';

var Module = angular.module('datePicker');

Module.directive('dateRange', function () {
  return {
    templateUrl: 'templates/daterange.html',
    scope: {
      to: '=',
      today: '=',
      yesterday: '=',
      lastWeek: '=',
      lastMonth: '=',
      start: '=',
      end: '=',
      status: '='
    },
    link: function (scope, element, attrs) {

      scope.status = scope.status ||
        {
          isToday: false,
          isYesterday: false,
          isLastWeek: false,
          isLastMonth: false,
          startStatus: { hasDate: false, hasTime: false },
          endStatus: { hasDate: false, hasTime: false }
        };

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
        scope.status.isYesterday = scope.status.isLastWeek = scope.status.isLastMonth = false;
        scope.status.isToday = true;
      };

      scope.setYesterday = function () {
        var yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);

        scope.start = yesterday;
        scope.end = yesterday;
        scope.status.isToday = scope.status.isLastWeek = scope.status.isLastMonth = false;
        scope.status.isYesterday = true;
      };

      scope.setLastWeek = function () {
        var lastWeek = new Date();
        lastWeek.setDate(lastWeek.getDate() - 7);

        scope.start = lastWeek;
        scope.end = new Date();
        scope.status.isToday = scope.status.isYesterday = scope.status.isLastMonth = false;
        scope.status.isLastWeek = true;
      };

      scope.setLastMonth = function () {
        var lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        scope.start = lastMonth;
        scope.end = new Date();
        scope.status.isToday = scope.status.isYesterday = scope.status.isLastWeek = false;
        scope.status.isLastMonth = true;
      };
    }
  };
});
