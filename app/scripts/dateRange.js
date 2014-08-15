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

      var init = function() {
        scope.inputDateFormat = $locale.id === 'en-us' ? 'MM/dd/yyyy' : 'dd/MM/yyyy';
        scope.inputTimeFormat = 'HH:mm';

        scope.status = scope.status ||
          {
            selectedPeriodString: null,
            startStatus: { hasDate: false, hasTime: false },
            endStatus: { hasDate: false, hasTime: false },
            hasPresetedDate: false
          };

        var initialTime = null;
        if((typeof scope.start === 'undefined' || scope.start === null) && (typeof scope.end === 'undefined' || scope.end === null)) {
          scope.setLastWeek();
        }

        if(scope.start) {
          initialTime = $filter('date')(scope.start, scope.inputTimeFormat);
          if(initialTime !== '00:00') { scope.status.startStatus.hasTime = true; }
        }

        if(scope.end) {
          initialTime = $filter('date')(scope.end, scope.inputTimeFormat);
          if(initialTime !== '23:59') { scope.status.endStatus.hasTime = true; }
        }
      };

      attrs.$observe('disabled', function(isDisabled){
          scope.disableDatePickers = !!isDisabled;
        });
      scope.$watch('start.getTime()', function (value) {
        if (value && scope.end && value > scope.end.getTime()) {
          scope.end = new Date(value);
        }
        if (scope.start && !scope.status.startStatus.hasTime) {
          scope.start = new Date(
            scope.start.getFullYear(), scope.start.getMonth(),
            scope.start.getDate(), 0, 0);
        }
        scope.setSelectedPeriodString(scope.start, scope.end, scope.status);
      });
      scope.$watch('end.getTime()', function (value) {
        if (value && scope.start && value < scope.start.getTime()) {
          scope.start = new Date(value);
        }
        if (scope.end && !scope.status.endStatus.hasTime) {
          scope.end = new Date(
            scope.end.getFullYear(), scope.start.getMonth(),
            scope.end.getDate(), 23, 59);
        }
        scope.setSelectedPeriodString(scope.start, scope.end, scope.status);
      });

      scope.setToday = function () {
        var startTempDate = new Date();
        var endTempDate = new Date();
        if(!scope.status.startStatus.hasTime) {
          startTempDate.setHours(0, 0, 0, 0);
          scope.start = startTempDate;
        }
        else {
          startTempDate.setHours(scope.start.getHours(), scope.start.getMinutes(), 0, 0);
          scope.start = startTempDate;
        }
        if(!scope.status.endStatus.hasTime) {
          endTempDate.setHours(23, 59, 0, 0);
          scope.end = endTempDate;
        }
        else {
          endTempDate.setHours(scope.end.getHours(), scope.end.getMinutes(), 0, 0);
          scope.end = endTempDate;
        }

        scope.status.startStatus.hasDate = true;
        scope.status.endStatus.hasDate = true;
      };

      scope.setYesterday = function () {
        var startTempDate = new Date();
        var endTempDate = new Date();
        if(!scope.status.startStatus.hasTime) {
          startTempDate.setHours(0, 0, 0, 0);
          startTempDate.setDate(startTempDate.getDate() - 1);
          scope.start = startTempDate;
        }
        else {
          startTempDate.setHours(scope.start.getHours(), scope.start.getMinutes(), 0, 0);
          startTempDate.setDate(startTempDate.getDate() - 1);
          scope.start = startTempDate;
        }
        if(!scope.status.endStatus.hasTime) {
          endTempDate.setHours(23, 59, 0, 0);
          endTempDate.setDate(endTempDate.getDate() - 1);
          scope.end = endTempDate;
        }
        else {
          endTempDate.setHours(scope.end.getHours(), scope.end.getMinutes(), 0, 0);
          endTempDate.setDate(endTempDate.getDate() - 1);
          scope.end = endTempDate;
        }

        scope.status.startStatus.hasDate = true;
        scope.status.endStatus.hasDate = true;
      };

      scope.setLastWeek = function () {
        var startTempDate = new Date();
        var endTempDate = new Date();
        if(!scope.status.startStatus.hasTime) {
          startTempDate.setHours(0, 0, 0, 0);
          startTempDate.setDate(startTempDate.getDate() - 7);
          scope.start = startTempDate;
        }
        else {
          startTempDate.setHours(scope.start.getHours(), scope.start.getMinutes(), 0, 0);
          startTempDate.setDate(startTempDate.getDate() - 7);
          scope.start = startTempDate;
        }
        if(!scope.status.endStatus.hasTime) {
          endTempDate.setHours(23, 59, 0, 0);
          scope.end = endTempDate;
        }
        else {
          endTempDate.setHours(scope.end.getHours(), scope.end.getMinutes(), 0, 0);
          scope.end = endTempDate;
        }

        scope.status.startStatus.hasDate = true;
        scope.status.endStatus.hasDate = true;
      };

      scope.setLastMonth = function () {
        var startTempDate = new Date();
        var endTempDate = new Date();
        if(!scope.status.startStatus.hasTime) {
          startTempDate.setHours(0, 0, 0, 0);
          startTempDate.setMonth(startTempDate.getMonth() - 1);
          scope.start = startTempDate;
        }
        else {
          startTempDate.setHours(scope.start.getHours(), scope.start.getMinutes(), 0, 0);
          startTempDate.setMonth(startTempDate.getMonth() - 1);
          scope.start = startTempDate;
        }
        if(!scope.status.endStatus.hasTime) {
          endTempDate.setHours(23, 59, 0, 0);
          scope.end = endTempDate;
        }
        else {
          endTempDate.setHours(scope.end.getHours(), scope.end.getMinutes(), 0, 0);
          scope.end = endTempDate;
        }

        scope.status.startStatus.hasDate = true;
        scope.status.endStatus.hasDate = true;
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

          if((startDate === endDate) && (startDate === todayDate)) {
            scope.status.selectedPeriodString = scope.today;
            scope.status.hasPresetedDate = true;
            return;
          }

          if((startDate === endDate) && (startDate === yesterdayDate)) {
            scope.status.selectedPeriodString = scope.yesterday;
            scope.status.hasPresetedDate = true;
            return;
          }

          if((startDate === lastWeekDate) && (endDate === todayDate)) {
            scope.status.selectedPeriodString = scope.lastWeek;
            scope.status.hasPresetedDate = true;
            return;
          }

          if((startDate === lastMonthDate) && (endDate === todayDate)) {
            scope.status.selectedPeriodString = scope.lastMonth;
            scope.status.hasPresetedDate = true;
            return;
          }
        }

        var startString = startDate;
        if(status.startStatus.hasTime) { startString += ' ' + scope.at + ' ' + startTime; }

        var endString = endDate;
        if(status.endStatus.hasTime) { endString += ' ' + scope.at + ' ' + endTime; }

        status.selectedPeriodString = startString + ' ' + scope.to + ' ' + endString;
        scope.status.hasPresetedDate = false;
        return;
      };

      init();

    }
  };
}]);
