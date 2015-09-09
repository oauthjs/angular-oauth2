
/**
 * Module dependencies.
 */

import angular from 'angular';

/**
 * Token provider.
 */

function OAuthTokenProvider() {
  var storage;
  var config = {
    name: 'token',
    storage: 'cookies', //cookies,localStorage,sessionStorage
    options: {
      secure: true
    }
  };

  /**
   * Configure.
   *
   * @param {object} params - An `object` of params to extend.
   */

  this.configure = function(params) {
    // Check if is an `object`.
    if (!(params instanceof Object)) {
      throw new TypeError('Invalid argument: `config` must be an `Object`.');
    }

    // Extend default configuration.
    angular.extend(config, params);

    return config;
  };

  /**
   * OAuthToken service.
   *
   * @ngInject
   */

  this.$get = function(ipCookie, $window) {
    class OAuthToken {

      /**
       * Set token.
       */

      set token(data) {
        return setToken(data);
      }

      /**
       * Get token.
       */

      get token() {
        return getToken();
      }

      /**
       * Get accessToken.
       */

      getAccessToken() {
        return this.token ? this.token.access_token : undefined;
      }

      /**
       * Get authorizationHeader.
       */

      getAuthorizationHeader() {
        if (!(this.getTokenType() && this.getAccessToken())) {
          return;
        }

        return `${this.getTokenType().charAt(0).toUpperCase() + this.getTokenType().substr(1)} ${this.getAccessToken()}`;
      }

      /**
       * Get refreshToken.
       */

      getRefreshToken() {
        return this.token ? this.token.refresh_token : undefined;
      }

      /**
       * Get tokenType.
       */

      getTokenType() {
        return this.token ? this.token.token_type : undefined;
      }

      /**
       * Remove token.
       */

      removeToken() {
        return removeToken();
      }

    }

    /**
     * setToken
     *
     * @param data
     * @returns {*}
     */

    var setToken = function(data) {
     storage = config.storage.toLowerCase();
      switch (storage) {
       case 'cookies':
        return ipCookie(config.name, data, config.options);
       case 'localstorage':
        return $window.localStorage.setItem(config.name, angular.toJson(data));
       case 'sessionstorage':
        return $window.sessionStorage.setItem(config.name, angular.toJson(data));
       default :
        return ipCookie(config.name, data, config.options);
      }
    };

    /**
     * getToken
     *
     * @returns {*}
     */
    var getToken = function() {
     storage = config.storage.toLowerCase();
      switch (storage) {
       case 'cookies':
        return ipCookie(config.name);
       case 'localstorage':
        return angular.fromJson($window.localStorage.getItem(config.name));
       case 'sessionstorage':
        return angular.fromJson($window.sessionStorage.getItem(config.name));
       default :
        return ipCookie(config.name);
      }
    };

    /**
     * removeToken
     *
     * @returns {*}
     */
    var removeToken = function() {
     storage = config.storage.toLowerCase();
      switch (storage) {
       case 'cookies':
        return ipCookie.remove(config.name, config.options);
       case 'localstorage':
        return $window.localStorage.removeItem(config.name);
       case 'sessionstorage':
        return $window.sessionStorage.removeItem(config.name);
       default :
        return ipCookie.remove(config.name, config.options);
      }
    };

    return new OAuthToken();
  };
}

/**
 * Export `OAuthTokenProvider`.
 */

export default OAuthTokenProvider;
