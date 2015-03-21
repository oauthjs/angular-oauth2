
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
  });
