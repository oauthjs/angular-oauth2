
/**
 * Angular cookies mock.
 */

angular.module('angular-cookies.mock', [])
  .provider('$cookies', function() {
    this.$get = function() {
      var cookieStore = {};

      return {
        getObject: function(key) {
          return cookieStore[key];
        },
        putObject: function(key, value, options) {
          cookieStore[key] = value;
        },
        remove: function(key) {
          delete cookieStore[key];
        }
      }
    }
  }).config(['$qProvider',function($qProvider){
      $qProvider.errorOnUnhandledRejections(false); // done to fix rejection raised errors during tests, since angular 1.5.9 
  }]);
