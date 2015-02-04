
/**
 * Module dependencies.
 */

import angular from 'angular';

/**
 * Token provider.
 */

function OAuthTokenProvider() {
  var config = {
    name: 'token',
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

  this.$get = function(ipCookie) {
    class OAuthToken {

      /**
       * Set token.
       */

      set token(data) {
        return ipCookie(config.name, data, config.options);
      }

      /**
       * Get token.
       */

      get token() {
        return ipCookie(config.name);
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
        return ipCookie.remove(config.name, config.options);
      }
    }

    return new OAuthToken();
  };
}

/**
 * Export `OAuthTokenProvider`.
 */

export default OAuthTokenProvider;
