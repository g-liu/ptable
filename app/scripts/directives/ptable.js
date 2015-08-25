'use strict';

/**
 * @ngdoc directive
 * @name ngPeriodicApp.directive:ptable
 * @description
 * # ptable
 * Custom periodic table directive used to render the periodic table layout.
 */
angular.module('ngPeriodicApp')
  .directive('ptable', function () {
    return {
    	templateUrl: 'ptable.html'
    };
  });
