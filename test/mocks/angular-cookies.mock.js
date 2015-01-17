
/**
 * Angular cookies mock.
 */

angular.module('angular-cookies.mock', [])
  .factory('ipCookie', function() {
    return (function () {
      var cookie;

      function cookieFun(key, value, options) {
        if (undefined !== value) {
          cookie = value;
        }

        return cookie;
      }

      cookieFun.remove = function(key, options) {
        cookie = undefined;

        return;
      };

      return cookieFun;
    }());
  });
