
/**
 * Module dependencies.
 */

import angular from 'angular';
import queryString from 'query-string';

var defaults = {
  baseUrl: null,
  clientId: null,
  clientSecret: null,
  grantPath: '/oauth2/token',
  revokePath: '/oauth2/revoke'
};

var requiredKeys = [
  'baseUrl',
  'clientId',
  'grantPath',
  'revokePath'
];

/**
 * OAuth provider.
 */

function OAuthProvider() {
  var config;

  /**
   * Configure.
   *
   * @param {object} params - An `object` of params to extend.
   */

  this.configure = function(params) {
    // Can only be configured once.
    if (config) {
      throw new Error('Already configured.');
    }

    // Check if is an `object`.
    if (!(params instanceof Object)) {
      throw new TypeError('Invalid argument: `config` must be an `Object`.');
    }

    // Extend default configuration.
    config = angular.extend({}, defaults, params);

    // Check if all required keys are set.
    angular.forEach(requiredKeys, (key) => {
      if (!config[key]) {
        throw new Error(`Missing parameter: ${key}.`);
      }
    });

    // Remove `baseUrl` trailing slash.
    if('/' === config.baseUrl.substr(-1)) {
      config.baseUrl = config.baseUrl.slice(0, -1);
    }

    // Add `grantPath` facing slash.
    if('/' !== config.grantPath[0]) {
      config.grantPath = `/${config.grantPath}`;
    }

    // Add `revokePath` facing slash.
    if('/' !== config.revokePath[0]) {
      config.revokePath = `/${config.revokePath}`;
    }

    return config;
  };

  /**
   * OAuth service.
   */

  this.$get = function($http, OAuthToken) {
    class OAuth {

      /**
       * Check if `OAuthProvider` is configured.
       */

      constructor() {
        if (!config) {
          throw new Error('`OAuthProvider` must be configured first.');
        }
      }

      /**
       * Verifies if the `user` is authenticated or not based on the `token`
       * cookie.
       *
       * @return {boolean}
       */

      isAuthenticated() {
        return !!OAuthToken.getToken();
      }

      /**
       * Retrieves the `access_token` and stores the `response.data` on cookies
       * using the `OAuthToken`.
       *
       * @param {object} data - Request content, e.g., `username` and `password`.
       * @param {object} options - Optional configuration.
       * @return {promise} A response promise.
       */

      getAccessToken(data, options) {
        data = angular.extend({
          client_id: config.clientId,
          grant_type: 'password'
        }, data);

        if (null !== config.clientSecret) {
          data.client_secret = config.clientSecret;
        }

        data = queryString.stringify(data);

        options = angular.extend({
          headers: {
            'Authorization': undefined,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }, options);

        return $http.post(`${config.baseUrl}${config.grantPath}`, data, options).then((response) => {
          OAuthToken.setToken(response.data);

          return response;
        });
      }

      /**
       * Retrieves the `refresh_token` and stores the `response.data` on cookies
       * using the `OAuthToken`.
       *
       * @param {object} data - Request content.
       * @param {object} options - Optional configuration.
       * @return {promise} A response promise.
       */

      getRefreshToken(data, options) {
        data = angular.extend({
          client_id: config.clientId,
          grant_type: 'refresh_token',
          refresh_token: OAuthToken.getRefreshToken(),
        }, data);

        if (null !== config.clientSecret) {
          data.client_secret = config.clientSecret;
        }

        data = queryString.stringify(data);

        options = angular.extend({
          headers: {
            'Authorization': undefined,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }, options);

        return $http.post(`${config.baseUrl}${config.grantPath}`, data, options).then((response) => {
          OAuthToken.setToken(response.data);

          return response;
        });
      }

      /**
       * Revokes the `token` and removes the stored `token` from cookies
       * using the `OAuthToken`.
       *
       * @param {object} data - Request content.
       * @param {object} options - Optional configuration.
       * @return {promise} A response promise.
       */

      revokeToken(data, options) {
        var refreshToken = OAuthToken.getRefreshToken();

        data = angular.extend({
          client_id: config.clientId,
          token: refreshToken ? refreshToken : OAuthToken.getAccessToken(),
          token_type_hint: refreshToken ? 'refresh_token' : 'access_token'
        }, data);

        if (null !== config.clientSecret) {
          data.client_secret = config.clientSecret;
        }

        data = queryString.stringify(data);

        options = angular.extend({
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }, options);

        return $http.post(`${config.baseUrl}${config.revokePath}`, data, options).then((response) => {
          OAuthToken.removeToken();

          return response;
        });
      }
    }

    return new OAuth();
  };

  this.$get.$inject = ['$http', 'OAuthToken'];
}

/**
 * Export `OAuthProvider`.
 */

export default OAuthProvider;
