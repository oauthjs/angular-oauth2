
/**
 * Module dependencies.
 */

import angular from 'angular';

/**
 * Token provider.
 */

function OAuthTokenProvider($injector) {
  var config = {
    name: 'token',
    storage: 'cookies', //cookies, localStorage, sessionStorage
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

    $injector.invoke(function (OAuthStorageProvider) {
      OAuthStorageProvider.configure(config);
    });

    return config;
  };

  /**
   * OAuthToken service.
   *
   * @ngInject
   */

  this.$get = function(OAuthStorage) {
    class OAuthToken {

      /**
       * Set token.
       */

      setToken(data) {
        return OAuthStorage.setToken(data);
      }

      /**
       * Get token.
       */

      getToken() {
        return OAuthStorage.getToken();
      }

      /**
       * Get accessToken.
       */

      getAccessToken() {
        return this.getToken() ? this.getToken().access_token : undefined;
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
        return this.getToken() ? this.getToken().refresh_token : undefined;
      }

      /**
       * Get tokenType.
       */

      getTokenType() {
        return this.getToken() ? this.getToken().token_type : undefined;
      }

      /**
       * Remove token.
       */

      removeToken() {
        return OAuthStorage.deleteToken();
      }
    }

    return new OAuthToken();
  };
}

/**
 * Export `OAuthTokenProvider`.
 */

export default OAuthTokenProvider;
