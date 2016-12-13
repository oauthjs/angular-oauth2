
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

  this.$get = function($cookies,$localStorage) {
    class OAuthToken {

      /**
       * Set token.
       */

      setToken(data) {
               $cookies.putObject(config.name, data, config.options);
               $localStorage[config.name]=data;
        return $localStorage[config.name];
      }

      /**
       * Get token.
       */

      getToken() {

           return $localStorage[config.name] || $cookies.getObject(config.name);
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
        
              delete $localStorage[config.name];
        return $cookies.remove(config.name, config.options);
      }
    }

    return new OAuthToken();
  };

  this.$get.$inject = ['$cookies','$localStorage'];
}

/**
 * Export `OAuthTokenProvider`.
 */

export default OAuthTokenProvider;
