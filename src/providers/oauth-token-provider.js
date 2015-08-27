
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
    },
    storage: 'cookie'
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

  this.$get = ['$cookies', '$log', '$window', function($cookies, $log, $window) {
    var storage;
    var storageType = (config.storage || '').toLowerCase();
    if ('local' === storageType) {
      storage = $window.localStorage;
    }
    else if ('session' === storageType) {
      storage = $window.sessionStorage;
    }
    else {
      $log.warn(`Defaulting to cookie storage because storage type is unknown: ${storageType}`);
    }

    class BrowserStorage {
      constructor(storage, key) {
        this.storage = storage;
        this.key = key;
      }

      set token(x) {
        this.storage.setItem(this.key, x);
      }

      get token() {
        var value = this.storage.getItem(this.key);
        return value ? angular.fromJson(value) : value;
      }

      deleteToken() {
        this.storage.removeItem(this.key);
      }
    }

    class CookieStorage {
      constructor($cookies, key, opts) {
        this.$cookies = $cookies;
        this.key = key;
        this.opts = opts;
      }

      set token(x) {
        this.$cookies.putObject(this.key, x, this.opts);
      }

      get token() {
        return this.$cookies.getObject(this.key);
      }

      deleteToken() {
        this.$cookies.remove(this.key, this.opts);
      }
    }

    class OAuthToken {
      /**
       * Constructor
       */

      constructor(storage) {
        this.storage = storage;
      }

      /**
       * Set token.
       */

      setToken(data) {
        this.storage.token = data;
      }

      /**
       * Get token.
       */

      getToken() {
        return this.storage.token;
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
        return this.storage.deleteToken();
      }
    }

    storage = storage ?
      new BrowserStorage(storage, config.name) :
      new CookieStorage($cookies, config.name, config.options);

    return new OAuthToken(storage);
  }];
}

/**
 * Export `OAuthTokenProvider`.
 */

export default OAuthTokenProvider;
