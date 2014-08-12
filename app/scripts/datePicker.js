'use strict';

var Module = angular.module('datePicker', ['ui.mask']);

Module.constant('datePickerConfig', {
  template: 'templates/datepicker.html',
  view: 'month',
  views: ['year', 'month', 'date', 'hours', 'minutes'],
  step: 5
});

Module.filter('time',function () {
  function format(date){
    return ('0' + date.getHours()).slice(-2) + ':' + ('0' + date.getMinutes()).slice(-2);
  }

  return function (date) {
    if (!(date instanceof Date)) {
      date = new Date(date);
      if (isNaN(date.getTime())) {
        return undefined;
      }
    }
    return format(date);
  };
});

function getVisibleMinutes(date, step) {
  date = new Date(date || new Date());
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate(), date.getHours());
  var minutes = [];
  var stop = date.getTime() + 60 * 60 * 1000;
  while (date.getTime() < stop) {
    minutes.push(date);
    date = new Date(date.getTime() + step * 60 * 1000);
  }
  return minutes;
}

function getVisibleDays(date) {
  date = new Date(date || new Date());
  date.setDate(1);
  date.setHours(12);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);

  if (date.getDay() !== 0) {
    date.setDate(date.getDate() - (date.getDay()));
  }

  var days = [];
  while (days.length < 42) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function getVisibleYears(date) {
  var years = [];
  date = new Date(date || new Date());
  date.setFullYear(date.getFullYear() - (date.getFullYear() % 10));
  for (var i = 0; i < 12; i++) {
    years.push(new Date(date.getFullYear() + (i - 1), 0, 1));
  }
  return years;
}

function getDaysOfWeek(date) {
  date = new Date(date || new Date());
  date = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  date.setDate(date.getDate() - (date.getDay()));
  var days = [];
  for (var i = 0; i < 7; i++) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
}

function getVisibleMonths(date) {
  date = new Date(date || new Date());
  var year = date.getFullYear();
  var months = [];
  for (var month = 0; month < 12; month++) {
    months.push(new Date(year, month, 1));
  }
  return months;
}

function getVisibleHours(date) {
  date = new Date(date || new Date());
  date.setHours(0);
  date.setMinutes(0);
  date.setSeconds(0);
  date.setMilliseconds(0);
  var hours = [];
  for (var i = 0; i < 24; i++) {
    hours.push(date);
    date = new Date(date.getTime() + 60 * 60 * 1000);
  }
  return hours;
}


function isAfter(model, date) {
  return model && model.getTime() <= date.getTime();
}

function isBefore(model, date) {
  return model.getTime() >= date.getTime();
}

function isSameYear(model, date) {
  return model && model.getFullYear() === date.getFullYear();
}

function isSameMonth(model, date) {
  return isSameYear(model, date) && model.getMonth() === date.getMonth();
}

function isSameDay(model, date) {
  return isSameMonth(model, date) && model.getDate() === date.getDate();
}

function isSameHour(model, date) {
  return isSameDay(model, date) && model.getHours() === date.getHours();
}

function isSameMinutes(model, date) {
  return isSameHour(model, date) && model.getMinutes() === date.getMinutes();
}


Module.directive('datePicker', ['datePickerConfig', '$filter', '$locale', function datePickerDirective(datePickerConfig, $filter, $locale) {

  //noinspection JSUnusedLocalSymbols
  return {
    // this is a bug ?
    template: '<div ng-include="template"></div>',
    scope: {
      model: '=datePicker',
      after: '=?',
      before: '=?',
      status: '=?'
    },
    link: function (scope, element, attrs) {

      scope.date = new Date(scope.model || new Date());
      scope.views = datePickerConfig.views.concat();
      scope.view = attrs.view || datePickerConfig.view;
      scope.now = new Date();
      scope.template = attrs.template || datePickerConfig.template;

      var step = parseInt(attrs.step || datePickerConfig.step, 10);
      var partial = !!attrs.partial;

      scope.inputDateTime = {
        date: $filter('date')(scope.model, scope.inputDateFormat),
        time: $filter('date')(scope.model, scope.inputTimeFormat)
      };

      /** @namespace attrs.minView, attrs.maxView */
      scope.views =scope.views.slice(
        scope.views.indexOf(attrs.maxView || 'year'),
        scope.views.indexOf(attrs.minView || 'minutes')+1
      );

      if (scope.views.length === 1 || scope.views.indexOf(scope.view)===-1) {
        scope.view = scope.views[0];
      }

      scope.setView = function (nextView) {
        if (scope.views.indexOf(nextView) !== -1) {
          scope.view = nextView;
        }
      };

      scope.setDate = function (date) {
        if(attrs.disabled) {
          return;
        }
        scope.date = date;
        // change next view
        var nextView = scope.views[scope.views.indexOf(scope.view) + 1];
        if ((!nextView || partial) || scope.model) {

          scope.model = new Date(scope.model || date);
          var view = partial ? 'minutes' : scope.view;
          //noinspection FallThroughInSwitchStatementJS
          switch (view) {
          case 'minutes':
            scope.model.setMinutes(date.getMinutes());
          /*falls through*/
          case 'hours':
            scope.model.setHours(date.getHours());
          /*falls through*/
          case 'date':
            scope.model.setDate(date.getDate());
          /*falls through*/
          case 'month':
            scope.model.setMonth(date.getMonth());
          /*falls through*/
          case 'year':
            scope.model.setFullYear(date.getFullYear());
          }
          scope.$emit('setDate', scope.model, scope.view);
        }

        if (nextView) {
          scope.setView(nextView);
        }
      };

      function update() {
        var view = scope.view;
        var date = scope.date;
        switch (view) {
        case 'year':
          scope.years = getVisibleYears(date);
          break;
        case 'month':
          scope.months = getVisibleMonths(date);
          break;
        case 'date':
          scope.weekdays = scope.weekdays || getDaysOfWeek();
          scope.days = getVisibleDays(date);
          break;
        case 'hours':
          scope.hours = getVisibleHours(date);
          break;
        case 'minutes':
          scope.minutes = getVisibleMinutes(date, step);
          break;
        }
      }

      function watch() {
        if (scope.view !== 'date') {
          return scope.view;
        }
        return scope.model ? scope.model.getTime() : null;
      }

      /* Changes on Calendar */
      function updateDate() {
        if(scope.model) {
          scope.date.setTime(scope.model.getTime());
          scope.inputDateTime.date = $filter('date')(scope.model, scope.inputDateFormat);
          update();
        }
      }

      scope.$watch(watch, update);
      scope.$watch(watch, updateDate);
      scope.$watch('status', function() {
        scope.status = scope.status || { hasDate: false, hasTime: false };

        if(scope.status.hasTime) { scope.isTimeActive = true; }
      });

      scope.next = function (delta) {
        var date = scope.date;
        delta = delta || 1;
        switch (scope.view) {
        case 'year':
        /*falls through*/
        case 'month':
          date.setFullYear(date.getFullYear() + delta);
          break;
        case 'date':
          date.setMonth(date.getMonth() + delta);
          break;
        case 'hours':
        /*falls through*/
        case 'minutes':
          date.setHours(date.getHours() + delta);
          break;
        }
        update();
      };

      scope.prev = function (delta) {
        return scope.next(-delta || -1);
      };

      scope.isAfter = function (date) {
        return scope.after && isAfter(date, scope.after);
      };

      scope.isBefore = function (date) {
        return scope.before && isBefore(date, scope.before);
      };

      scope.isSameMonth = function (date) {
        return isSameMonth(scope.model, date);
      };

      scope.isSameYear = function (date) {
        return isSameYear(scope.model, date);
      };

      scope.isSameDay = function (date) {
        return isSameDay(scope.model, date);
      };

      scope.isSameHour = function (date) {
        return isSameHour(scope.model, date);
      };

      scope.isSameMinutes = function (date) {
        return isSameMinutes(scope.model, date);
      };

      scope.isNow = function (date) {
        var is = true;
        var now = scope.now;
        //noinspection FallThroughInSwitchStatementJS
        switch (scope.view) {
        case 'minutes':
          is &= ~~(date.getMinutes()/step) === ~~(now.getMinutes()/step);
        /*falls through*/
        case 'hours':
          is &= date.getHours() === now.getHours();
        /*falls through*/
        case 'date':
          is &= date.getDate() === now.getDate();
        /*falls through*/
        case 'month':
          is &= date.getMonth() === now.getMonth();
        /*falls through*/
        case 'year':
          is &= date.getFullYear() === now.getFullYear();
        }
        return is;
      };

      /* Watchers - Input and Calendar Sync */

      scope.inputDateFormat = $locale.id === 'en-us' ? 'MMddyyyy' : 'ddMMyyyy';
      scope.inputTimeFormat = 'HH:mm';

      /* Changes on Date Input */
      scope.$watch('inputDateTime.date', function (newValue) {
        if (!newValue || newValue.length < 8) {
          scope.status.hasDate = false;
          return;
        }
        newValue = newValue.toString();
        var date = scope.formatDate(newValue, $locale.id);
        if (scope.isValidDate(date)) {
          scope.status.hasDate = true;
          scope.setDate(date);
        }
      });

      /* Changes on Time Input */
      scope.$watch('inputDateTime.time', function (newValue) {
        if (!newValue || newValue.length < 4) { return; }
        newValue = newValue.toString();
        var hours = scope.formatHours(newValue);
        var minutes = scope.formatMinutes(newValue);
        if (scope.isValidTime(hours, minutes)) {
          scope.model.setHours(hours, minutes);
          scope.setDate(scope.model);
          scope.status.hasTime = true;
        }
        else {
          scope.status.hasTime = false;
        }
      });

      /* Date Format based on Locale */
      scope.formatDate = function (date, locale) {
        var year, month, day;
        if (locale === 'en-us') {
          month = parseInt(date.slice(0, 2), 10);
          day = parseInt(date.slice(2, 4), 10);
          year = parseInt(date.slice(4, 8), 10);
        }
        else {
          day = parseInt(date.slice(0, 2), 10);
          month = parseInt(date.slice(2, 4), 10);
          year = parseInt(date.slice(4, 8), 10);
        }
        return new Date([year, month, day].join('/'));
      };

      scope.formatHours = function (time) {
        return parseInt(time.slice(0,2), 10);
      };

      scope.formatMinutes = function (time) {
        return parseInt(time.slice(2,4), 10);
      };

      scope.isValidDate = function (date) {
        return date.toJSON() !== null;
      };

      scope.isValidTime = function (hours, minutes) {
        return (hours <= 23 && hours >= 0) && (minutes <= 59 && minutes >= 0);
      };

      /* Time Input */

      scope.toggleTimeInput = function () {
        scope.isTimeActive = !scope.isTimeActive;
        if (!scope.isTimeActive) {
          scope.inputDateTime.time = '';
          scope.status.hasTime = false;
        }
      };

      scope.toggleTimeInputFocused = function () {
        scope.isTimeInputFocused = !scope.isTimeInputFocused;
      };

      scope.toggleDateInputFocused = function () {
        scope.isDateInputFocused = !scope.isDateInputFocused;
      };

    }
  };
}]);
