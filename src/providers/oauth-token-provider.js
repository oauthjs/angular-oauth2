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

  this.$get = function($localForage) {
    class OAuthToken {

      /**
       * Set token.
       */

      setToken(data) {
        // return $cookies.putObject(config.name, data, config.options);
        return $localForage.setItem(config.name, data);
      }

      /**
       * Get token.
       */

      getToken() {
        // return $cookies.getObject(config.name);
        return $localForage.getItem(config.name)
          .then((data) => {
            return data;
          });
      }

      /**
       * Get accessToken.
       */

      getAccessToken() {
        return this.getToken()
          .then((token) => {
            return token ? token.access_token : undefined;
          });
      }

      /**
       * Get authorizationHeader.
       */

      getAuthorizationHeader() {
        var token_type, access_token;
        return this.getTokenType()
          .then((tt) => {
            token_type = tt;
            return this.getAccessToken();
          })
          .then((at) => {
            access_token = at;
            if (!(token_type && access_token)) {
              return null;
            } else {
              return `${token_type.charAt(0).toUpperCase() + token_type.substr(1)} ${access_token}`;
            }
          });
        // return `${this.getTokenType().charAt(0).toUpperCase() + this.getTokenType().substr(1)} ${this.getAccessToken()}`;
      }

      /**
       * Get refreshToken.
       */

      getRefreshToken() {
        return this.getToken()
          .then((token) => {
            return token ? token
              .refresh_token : undefined;
          });
      }

      /**
       * Get tokenType.
       */

      getTokenType() {
        return this.getToken()
          .then((token) => {
            return token ? token
              .token_type : undefined;
          });
      }

      /**
       * Remove token.
       */

      removeToken() {
        // return $cookies.remove(config.name, config.options);
        return $localForage.removeItem(config.name);
      }
    }

    return new OAuthToken();
  };

  this.$get.$inject = ['$localForage'];
}

/**
 * Export `OAuthTokenProvider`.
 */

export default OAuthTokenProvider;
