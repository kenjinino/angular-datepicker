'use strict';
(function(angular){
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

      scope.inputDateFormat = $locale.id === 'en-us' ? 'MMddyyyy' : 'ddMMyyyy';
      scope.inputTimeFormat = 'HHmm';

      if(scope.model === '') { scope.model = null; }

      scope.date = new Date(scope.model || new Date());
      scope.views = datePickerConfig.views.concat();
      scope.view = attrs.view || datePickerConfig.view;
      scope.now = new Date();
      scope.template = attrs.template || datePickerConfig.template;

      var step = parseInt(attrs.step || datePickerConfig.step, 10);
      var partial = !!attrs.partial;

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
          if(scope.inputDateTime && scope.status.hasDate) { scope.inputDateTime.date = $filter('date')(scope.model, scope.inputDateFormat); }
          if(scope.inputDateTime && scope.status.hasTime) { scope.inputDateTime.time = $filter('date')(scope.model, scope.inputTimeFormat); }
          update();
        }
      }

      scope.$watch(watch, update);
      scope.$watch(watch, updateDate);
      scope.$watch('status', function() {
        scope.status = scope.status || { hasDate: false, hasTime: false };


        scope.inputDateTime = {};
        scope.inputDateTime.date = $filter('date')(scope.model, scope.inputDateFormat);
        if(scope.status.hasTime) {
          scope.inputDateTime.time = $filter('date')(scope.model, scope.inputTimeFormat);
          scope.isTimeActive = true;
        }
        else {
          scope.inputDateTime.time = null;
        }
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
          scope.model.setHours(12, 0, 0, 0);
          scope.status.hasTime = false;
        }
      };

      scope.toggleTimeInputFocused = function () {
        scope.isTimeInputFocused = !scope.isTimeInputFocused;
        scope.toggleDateInputFocused();
      };

      scope.toggleDateInputFocused = function () {
        scope.isDateInputFocused = !scope.isDateInputFocused;
      };

    }
  };
}]);

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

'use strict';

var PRISTINE_CLASS = 'ng-pristine',
    DIRTY_CLASS = 'ng-dirty';

var Module = angular.module('datePicker');

Module.constant('dateTimeConfig', {
  template: function (attrs) {
    return '' +
        '<div ' +
        'date-picker="' + attrs.ngModel + '" ' +
        (attrs.view ? 'view="' + attrs.view + '" ' : '') +
        (attrs.maxView ? 'max-view="' + attrs.maxView + '" ' : '') +
        (attrs.template ? 'template="' + attrs.template + '" ' : '') +
        (attrs.minView ? 'min-view="' + attrs.minView + '" ' : '') +
        (attrs.partial ? 'partial="' + attrs.partial + '" ' : '') +
        'class="dropdown-menu"></div>';
  },
  format: 'yyyy-MM-dd HH:mm',
  views: ['date', 'year', 'month', 'hours', 'minutes'],
  dismiss: false,
  position: 'relative'
});

Module.directive('dateTimeAppend', function () {
  return {
    link: function (scope, element) {
      element.bind('click', function () {
        element.find('input')[0].focus();
      });
    }
  };
});

Module.directive('dateTime', ['$compile', '$document', '$filter', 'dateTimeConfig', '$parse', function ($compile, $document, $filter, dateTimeConfig, $parse) {
  var body = $document.find('body');
  var dateFilter = $filter('date');

  return {
    require: 'ngModel',
    scope:true,
    link: function (scope, element, attrs, ngModel) {
      var format = attrs.format || dateTimeConfig.format;
      var parentForm = element.inheritedData('$formController');
      var views = $parse(attrs.views)(scope) || dateTimeConfig.views.concat();
      var view = attrs.view || views[0];
      var index = views.indexOf(view);
      var dismiss = attrs.dismiss ? $parse(attrs.dismiss)(scope) : dateTimeConfig.dismiss;
      var picker = null;
      var position = attrs.position || dateTimeConfig.position;
      var container = null;

      if (index === -1) {
        views.splice(index, 1);
      }

      views.unshift(view);


      function formatter(value) {
        return dateFilter(value, format);
      }

      function parser() {
        return ngModel.$modelValue;
      }

      ngModel.$formatters.push(formatter);
      ngModel.$parsers.unshift(parser);


      var template = dateTimeConfig.template(attrs);

      function updateInput(event) {
        event.stopPropagation();
        if (ngModel.$pristine) {
          ngModel.$dirty = true;
          ngModel.$pristine = false;
          element.removeClass(PRISTINE_CLASS).addClass(DIRTY_CLASS);
          if (parentForm) {
            parentForm.$setDirty();
          }
          ngModel.$render();
        }
      }

      function clear() {
        if (picker) {
          picker.remove();
          picker = null;
        }
        if (container) {
          container.remove();
          container = null;
        }
      }

      function showPicker() {
        if (picker) {
          return;
        }
        // create picker element
        picker = $compile(template)(scope);
        scope.$digest();

        scope.$on('setDate', function (event, date, view) {
          updateInput(event);
          if (dismiss && views[views.length - 1] === view) {
            clear();
          }
        });

        scope.$on('$destroy', clear);

        // move picker below input element

        if (position === 'absolute') {
          var pos = angular.extend(element.offset(), { height: element[0].offsetHeight });
          picker.css({ top: pos.top + pos.height, left: pos.left, display: 'block', position: position});
          body.append(picker);
        } else {
          // relative
          container = angular.element('<div date-picker-wrapper></div>');
          element[0].parentElement.insertBefore(container[0], element[0]);
          container.append(picker);
//          this approach doesn't work
//          element.before(picker);
          picker.css({top: element[0].offsetHeight + 'px', display: 'block'});
        }

        picker.bind('mousedown', function (evt) {
          evt.preventDefault();
        });
      }

      element.bind('focus', showPicker);
      element.bind('blur', clear);
    }
  };
}]);

angular.module("datePicker").run(["$templateCache", function($templateCache) {

  $templateCache.put("templates/datepicker.html",
    "<div class=\"datepicker\">\n" +
    "\n" +
    "  <div class=\"datepicker-input\" ng-class=\"{ 'is-focused': isDateInputFocused }\">\n" +
    "    <input class=\"datepicker-input-date\" type=\"text\" maxlength=\"10\" ng-model=\"inputDateTime.date\" ui-mask=\"99/99/9999\" ng-focus=\"toggleDateInputFocused()\"\n" +
    "      ng-blur=\"toggleDateInputFocused()\"></input>\n" +
    "    <svg class=\"datepicker-input-icon\" ng-click=\"toggleTimeInput()\" ng-class=\"{ 'is-active': isTimeActive, 'is-focused': isTimeInputFocused }\"\n" +
    "      version=\"1.1\" id=\"icons\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "      viewBox=\"0 0 20 20\" style=\"enable-background:new 0 0 20 20;\" xml:space=\"preserve\">\n" +
    "    <g id=\"time\">\n" +
    "      <path d=\"M12.5,10H10V6.5C10,6.22,9.78,6,9.5,6C9.22,6,9,6.22,9,6.5V11h3.5c0.28,0,0.5-0.22,0.5-0.5C13,10.22,12.78,10,12.5,10z\"/>\n" +
    "      <path d=\"M10,3c-3.87,0-7,3.13-7,7s3.13,7,7,7s7-3.13,7-7S13.87,3,10,3z M10,16c-3.31,0-6-2.69-6-6s2.69-6,6-6s6,2.69,6,6\n" +
    "        S13.31,16,10,16z\"/>\n" +
    "    </g>\n" +
    "    </svg>\n" +
    "    <input\n" +
    "      class=\"datepicker-input-time\"\n" +
    "      type=\"text\"\n" +
    "      maxlength=\"5\"\n" +
    "      ng-model=\"inputDateTime.time\"\n" +
    "      ui-mask=\"99:99\"\n" +
    "      ng-if=\"isTimeActive\"\n" +
    "      ng-focus=\"toggleTimeInputFocused()\"\n" +
    "      ng-blur=\"toggleTimeInputFocused()\">\n" +
    "    </input>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"datepicker-actions\">\n" +
    "    <span class=\"datepicker-actions-arrow\" ng-click=\"prev()\">\n" +
    "      <svg class=\"datepicker-actions-arrow-icon is-previous\" version=\"1.1\" id=\"icons\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "         viewBox=\"0 0 9 16\" enable-background=\"new 0 0 9 16\" xml:space=\"preserve\">\n" +
    "      <polygon id=\"arrow\" points=\"9,8 1.03448,0 0,1.06667 6.93103,8 0,14.93333 1.03448,16 \"/>\n" +
    "      </svg>\n" +
    "    </span>\n" +
    "    <span class=\"datepicker-actions-switch\">{{date|date:\"yyyy MMMM\"}}</span>\n" +
    "    <span class=\"datepicker-actions-arrow\" ng-click=\"next()\">\n" +
    "      <svg class=\"datepicker-actions-arrow-icon is-next\" version=\"1.1\" id=\"icons\" xmlns=\"http://www.w3.org/2000/svg\" xmlns:xlink=\"http://www.w3.org/1999/xlink\" x=\"0px\" y=\"0px\"\n" +
    "         viewBox=\"0 0 9 16\" enable-background=\"new 0 0 9 16\" xml:space=\"preserve\">\n" +
    "      <polygon id=\"arrow\" points=\"9,8 1.03448,0 0,1.06667 6.93103,8 0,14.93333 1.03448,16 \"/>\n" +
    "      </svg>\n" +
    "    </span>\n" +
    "  </div>\n" +
    "\n" +
    "  <div class=\"datepicker-calendar\">\n" +
    "    <span\n" +
    "      class=\"datepicker-calendar-weekday\"\n" +
    "      ng-repeat=\"day in weekdays\"\n" +
    "      style=\"overflow: hidden\">\n" +
    "      {{ day|date:\"EEE\"|limitTo:1 }}\n" +
    "    </span>\n" +
    "    <span\n" +
    "      class=\"datepicker-calendar-day\"\n" +
    "      ng-repeat=\"day in days\"\n" +
    "      ng-class=\"{'is-now':isNow(day),'is-active':isSameDay(day),'is-disabled':(day.getMonth()!=date.getMonth()),'is-after':isAfter(day),'is-before':isBefore(day)}\"\n" +
    "      ng-click=\"setDate(day)\"\n" +
    "      ng-bind=\"day.getDate()\">\n" +
    "    </span>\n" +
    "    <div class=\"clearfix\"></div>\n" +
    "  </div>\n" +
    "</div>\n"
  );

  $templateCache.put("templates/daterange.html",
    "<div class=\"date-range-container\">\n" +
    "    <div class=\"date-range-actions\">\n" +
    "        <button class=\"date-range-action\" ng-click=\"setToday()\">{{today}}</button>\n" +
    "        <button class=\"date-range-action\" ng-click=\"setYesterday()\">{{yesterday}}</button>\n" +
    "        <button class=\"date-range-action\" ng-click=\"setLastWeek()\">{{lastWeek}}</button>\n" +
    "        <button class=\"date-range-action\" ng-click=\"setLastMonth()\">{{lastMonth}}</button>\n" +
    "    </div>\n" +
    "    <div class=\"date-range\">\n" +
    "        <div date-picker=\"start\" status=\"status.startStatus\" ng-disabled=\"disableDatePickers\"  class=\"date-picker\" date after=\"start\" before=\"end\" min-view=\"date\" max-view=\"date\"></div>\n" +
    "        <div class=\"date-range-separator\">{{to}}</div>\n" +
    "        <div date-picker=\"end\" status=\"status.endStatus\" ng-disabled=\"disableDatePickers\"  class=\"date-picker\" date after=\"start\" before=\"end\"  min-view=\"date\" max-view=\"date\"></div>\n" +
    "    </div>\n" +
    "</div>\n"
  );

}]);
})(angular);