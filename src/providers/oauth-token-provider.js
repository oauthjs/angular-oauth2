
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
   */

  this.$get = function($cookies) {
    class OAuthToken {

      /**
       * Set token.
       */

      setToken(data) {
        return $cookies.putObject(config.name, data, config.options);
      }

      /**
       * Get token.
       */

      getToken() {
        return $cookies.getObject(config.name);
      }

      /**
       * Get accessToken.
       */

      getAccessToken() {
        const { access_token } = this.getToken() || {};

        return access_token;
      }

      /**
       * Get authorizationHeader.
       */

      getAuthorizationHeader() {
        const tokenType = this.getTokenType();
        const accessToken = this.getAccessToken();

        if (!tokenType || !accessToken) {
          return;
        }

        return `${tokenType.charAt(0).toUpperCase() + tokenType.substr(1)} ${accessToken}`;
      }

      /**
       * Get refreshToken.
       */

      getRefreshToken() {
        const { refresh_token } = this.getToken() || {};

        return refresh_token;
      }

      /**
       * Get tokenType.
       */

      getTokenType() {
        const { token_type } = this.getToken() || {};

        return token_type;
      }

      /**
       * Remove token.
       */

      removeToken() {
        return $cookies.remove(config.name, config.options);
      }
    }

    return new OAuthToken();
  };

  this.$get.$inject = ['$cookies'];
}

/**
 * Export `OAuthTokenProvider`.
 */

export default OAuthTokenProvider;
