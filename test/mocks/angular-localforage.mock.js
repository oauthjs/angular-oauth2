/**
 * Angular cookies mock.
 */

angular.module('angular-localforage.mock', [])
  .provider('$localForage', function() {
    this.$get = function($q) {
      var cookieStore = {};
      return {
        getItem: function(key) {
          var q = $q.defer();
          q.resolve(cookieStore[key]);
          return q.promise;
        },
        setItem: function(key, value) {
          var q = $q.defer();
          cookieStore[key] = value;
          q.resolve();
          return q.promise;
        },
        removeItem: function(key) {
          var q = $q.defer();
          delete cookieStore[key];
          q.resolve();
          return q.promise;
        }
      }
    }
  });
