'use strict';

var Module = angular.module('datePicker');

Module.directive('dateRange', [ '$filter', '$locale', function ($filter, $locale) {
  return {
    templateUrl: 'templates/daterange.html',
    scope: {
      to: '=',
      at: '=',
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
          selectedPeriodString: null,
          startStatus: { hasDate: false, hasTime: false },
          endStatus: { hasDate: false, hasTime: false }
        };

      scope.inputDateFormat = $locale.id === 'en-us' ? 'MM/dd/yyyy' : 'dd/MM/yyyy';
      scope.inputTimeFormat = 'HH:mm';

      attrs.$observe('disabled', function(isDisabled){
          scope.disableDatePickers = !!isDisabled;
        });
      scope.$watch('start.getTime()', function (value) {
        if (value && scope.end && value > scope.end.getTime()) {
          scope.end = new Date(value);
        }

        scope.setSelectedPeriodString(scope.start, scope.end, scope.status);
      });
      scope.$watch('end.getTime()', function (value) {
        if (value && scope.start && value < scope.start.getTime()) {
          scope.start = new Date(value);
        }

        scope.setSelectedPeriodString(scope.start, scope.end, scope.status);
      });

      scope.setToday = function () {
        var startTempDate = new Date();
        var endTempDate = new Date();
        if(!scope.status.startStatus.hasTime) {
          startTempDate.setHours(12, 0, 0, 0);
          scope.start = startTempDate;
        }
        else {
          startTempDate.setHours(scope.start.getHours(), scope.start.getMinutes(), 0, 0);
          scope.start = startTempDate;
        }
        if(!scope.status.endStatus.hasTime) {
          endTempDate.setHours(12, 0, 0, 0);
          scope.end = endTempDate;
        }
        else {
          endTempDate.setHours(scope.end.getHours(), scope.end.getMinutes(), 0, 0);
          scope.end = endTempDate;
        }
      };

      scope.setYesterday = function () {
        if(!scope.status.startStatus.hasTime) {
          var tempDate = new Date();
          tempDate.setHours(12, 0, 0, 0);
          tempDate.setDate(tempDate.getDate() - 1);
          scope.start = tempDate;
        }
        else {
          var tempDate = new Date();
          tempDate.setHours(scope.start.getHours(), scope.start.getMinutes(), 0, 0);
          tempDate.setDate(tempDate.getDate() - 1);
          scope.start = tempDate;
        }
        if(!scope.status.endStatus.hasTime) {
          var tempDate = new Date();
          tempDate.setHours(12, 0, 0, 0);
          tempDate.setDate(tempDate.getDate() - 1);
          scope.end = tempDate;
        }
        else {
          var tempDate = new Date();
          tempDate.setHours(scope.end.getHours(), scope.end.getMinutes(), 0, 0);
          tempDate.setDate(tempDate.getDate() - 1);
          scope.end = tempDate;
        }
      };

      scope.setLastWeek = function () {
        if(!scope.status.startStatus.hasTime) {
          var tempDate = new Date();
          tempDate.setHours(12, 0, 0, 0);
          tempDate.setDate(tempDate.getDate() - 7);
          scope.start = tempDate;
        }
        else {
          var tempDate = new Date();
          tempDate.setHours(scope.start.getHours(), scope.start.getMinutes(), 0, 0);
          tempDate.setDate(tempDate.getDate() - 7);
          scope.start = tempDate;
        }
        if(!scope.status.endStatus.hasTime) {
          var tempDate = new Date();
          tempDate.setHours(12, 0, 0, 0);
          scope.end = tempDate;
        }
        else {
          var tempDate = new Date();
          tempDate.setHours(scope.end.getHours(), scope.end.getMinutes(), 0, 0);
          scope.end = tempDate;
        }
      };

      scope.setLastMonth = function () {
        if(!scope.status.startStatus.hasTime) {
          var tempDate = new Date();
          tempDate.setHours(12, 0, 0, 0);
          tempDate.setMonth(tempDate.getMonth() - 1);
          scope.start = tempDate;
        }
        else {
          var tempDate = new Date();
          tempDate.setHours(scope.start.getHours(), scope.start.getMinutes(), 0, 0);
          tempDate.setMonth(tempDate.getMonth() - 1);
          scope.start = tempDate;
        }
        if(!scope.status.endStatus.hasTime) {
          var tempDate = new Date();
          tempDate.setHours(12, 0, 0, 0);
          scope.end = tempDate;
        }
        else {
          var tempDate = new Date();
          tempDate.setHours(scope.end.getHours(), scope.end.getMinutes(), 0, 0);
          scope.end = tempDate;
        }
      };

      scope.setSelectedPeriodString = function (start, end, status) {
        if(start === undefined && end === undefined) {
          scope.status.setSelectedPeriodString = scope.lastWeek;
          return;
        }

        var startDate = $filter('date')(start, scope.inputDateFormat);
        var startTime = $filter('date')(start, scope.inputTimeFormat);
        var endDate = $filter('date')(end, scope.inputDateFormat);
        var endTime = $filter('date')(end, scope.inputTimeFormat);

        if (!status.startStatus.hasTime && !status.endStatus.hasTime) {
          var today = new Date();
          var todayDate = $filter('date')(today, scope.inputDateFormat);

          var yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          var yesterdayDate = $filter('date')(yesterday, scope.inputDateFormat);

          var lastWeek = new Date();
          lastWeek.setDate(lastWeek.getDate() - 7);
          var lastWeekDate = $filter('date')(lastWeek, scope.inputDateFormat);

          var lastMonth = new Date();
          lastMonth.setMonth(lastMonth.getMonth() - 1);
          var lastMonthDate = $filter('date')(lastMonth, scope.inputDateFormat);

          if((startDate == endDate) && (startDate == todayDate)) {
            scope.status.selectedPeriodString = scope.today;
            return;
          }

          if((startDate == endDate) && (startDate == yesterdayDate)) {
            scope.status.selectedPeriodString = scope.yesterday;
            return;
          }

          if((startDate == lastWeekDate) && (endDate == todayDate)) {
            scope.status.selectedPeriodString = scope.lastWeek;
            return;
          }

          if((startDate == lastMonthDate) && (endDate == todayDate)) {
            scope.status.selectedPeriodString = scope.lastMonth;
            return;
          }
        }

        var startString = startDate;
        if(status.startStatus.hasTime) { startString += " " + scope.at + " " + startTime }

        var endString = endDate;
        if(status.endStatus.hasTime) { endString += " " + scope.at + " " + endTime }

        status.selectedPeriodString = startString + " " + scope.to + " " + endString;
        return;
      };
    }
  };
}]);
