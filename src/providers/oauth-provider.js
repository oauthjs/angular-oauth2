
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

  /**
   * @private
   * sanitize configuration parameters
   * @param {object} an `object` of params to sanitize
   * @return {object} an sanitize version of the params
   */
  const sanitizeConfigParams = (params) => {
    if (!(params instanceof Object)) {
      throw new TypeError('Invalid argument: `config` must be an `Object`.');
    }

    // Extend default configuration.
    const config = angular.extend({}, defaults, params);

    // Check if all required keys are set.
    angular.forEach(requiredKeys, (key) => {
      if (!config[key]) {
        throw new Error(`Missing parameter: ${key}.`);
      }
    });

    // Remove `baseUrl` trailing slash.
    if ('/' === config.baseUrl.substr(-1)) {
      config.baseUrl = config.baseUrl.slice(0, -1);
    }

    // Add `grantPath` facing slash.
    if ('/' !== config.grantPath[0]) {
      config.grantPath = `/${config.grantPath}`;
    }

    // Add `revokePath` facing slash.
    if ('/' !== config.revokePath[0]) {
      config.revokePath = `/${config.revokePath}`;
    }

    return config;
  };

  /**
   * @private
   * add credentials in header
   * @param {object} config - Object containing the clientId and the clientSecret
   * @param {object} options - Optional configuration.
   * @return {object} Modified optional configuration.
   */
  const addCredentialsInHeader = (config, options) => {
    // Create the credentials string
    let credentials = config.clientId + ':';
    if (null !== config.clientSecret) {
        credentials += config.clientSecret;
    }
    credentials = 'Basic ' + btoa(credentials);

    // Add the credentials in the header
    options = angular.extend({
        headers: {
            Authorization: credentials,
            'Content-Type': 'application/x-www-form-urlencoded'
        }
    }, options);

    return options;
  };
  
  /**
   * @private
   * add credentials in body
   * @param {object} config - Object containing the clientId and the clientSecret
   * @param {object} data - Request content, e.g., `username` and `password`.
   * @return {object} Modified request content.
   */
  const addCredentialsInBody = (config, data) => {
    data = angular.extend({
        client_id: config.clientId
    }, data);
    if (null !== config.clientSecret) {
        data.client_secret = config.clientSecret;
    }

    return data;
};
  
  /**
   * Configure.
   *
   * @param {object} params - An `object` of params to extend.
   */
  this.configure = (params) => {
    this.defaultConfig = sanitizeConfigParams(params);
  };

  /**
   * OAuth service.
   */

  this.$get = function($http, OAuthToken) {
    class OAuth {

      /**
       * Check if `OAuthProvider` is configured.
       */

      constructor(config) {
        this.config = config;
      }
      
      /**
       * Configure OAuth service during runtime
       *
       * @param {Object} params - An object of params to extend
       */
      configure(params) {
        this.config = sanitizeConfigParams(params);
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
        if ('header' === this.config.clientCredentials) {
            options = addCredentialsInHeader(this.config, options);
        } else {
            data = addCredentialsInBody(this.config, data);
            options = angular.extend({
                headers: {
                    Authorization: undefined,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }, options);
        }

        data = angular.extend({
          grant_type: 'password'
        }, data);

        data = queryString.stringify(data);

        return $http.post(`${this.config.baseUrl}${this.config.grantPath}`, data, options).then((response) => {
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
        if ('header' === this.config.clientCredentials) {
            options = addCredentialsInHeader(this.config, options);
        } else {
            data = addCredentialsInBody(this.config, data);
            options = angular.extend({
                headers: {
                    Authorization: undefined,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }, options);
        }

        data = angular.extend({
          grant_type: 'refresh_token',
          refresh_token: OAuthToken.getRefreshToken(),
        }, data);

        data = queryString.stringify(data);

        return $http.post(`${this.config.baseUrl}${this.config.grantPath}`, data, options).then((response) => {
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
        if ('header' === this.config.clientCredentials) {
            options = addCredentialsInHeader(this.config, options);
        } else {
            data = addCredentialsInBody(this.config, data);
            options = angular.extend({
                headers: {
                    Authorization: undefined,
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }, options);
        }

        var refreshToken = OAuthToken.getRefreshToken();

        data = angular.extend({
          token: refreshToken ? refreshToken : OAuthToken.getAccessToken(),
          token_type_hint: refreshToken ? 'refresh_token' : 'access_token'
        }, data);

        data = queryString.stringify(data);

        return $http.post(`${this.config.baseUrl}${this.config.revokePath}`, data, options).then((response) => {
          OAuthToken.removeToken();

          return response;
        });
      }
    }

    return new OAuth(this.defaultConfig);
  };

  this.$get.$inject = ['$http', 'OAuthToken'];
}

/**
 * Export `OAuthProvider`.
 */

export default OAuthProvider;
