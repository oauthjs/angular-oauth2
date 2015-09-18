/**
 * Module dependencies.
 */

import angular from 'angular';

/**
 * Storage Service.
 */

function OAuthStorageProvider() {

    var config = {};

    this.configure = function (params) {
        angular.extend(config, params);
        return config;
    };

    /**
     * OAuthStorage Service.
     *
     * @ngInject
     */

    this.$get = ['$localStorage', '$sessionStorage', '$cookies', '$log', function ($localStorage, $sessionStorage, $cookies, $log) {
        var storage;
        var ngStorage = (config.storage || 'cookies').toLowerCase();
        if (ngStorage === 'localstorage') {
            storage = $localStorage;
        }
        else if (ngStorage === 'sessionstorage') {
            storage = $sessionStorage;
        }
        else if (ngStorage === 'cookies') {
            storage = $cookies;
        }
        else {
            $log.warn('Set storage to cookies, because storage type is unknown');
        }

        class BrowserStorage {
            constructor(storage, name) {
                this.storage = storage;
                this.name = name;
            }

            set token(data) {
                return this.storage.setItem(this.name, angular.toJson(data));
            }

            get token() {
                return angular.fromJson(this.storage.getItem(this.name));
            }

            deleteToken() {
                this.storage.removeItem(this.name);
            }
        }

        class CookieStorage {
            constructor($cookies, name, options) {
                this.$cookies = $cookies;
                this.name = name;
                this.options = options;
            }

            set token(value) {
                return this.$cookies.putObject(this.name, value, this.options);
            }

            get token() {
                return this.$cookies.getObject(this.name);
            }

            deleteToken() {
                return this.$cookies.remove(this.name, this.options);
            }
        }

        class OAuthStorage {
            constructor() {
                this.storage = ngStorage === 'cookies' ?
                    new CookieStorage(storage, config.name, config.options) :
                    new BrowserStorage(storage, config.name);
                $log.info('Storage Started');
            }

            set token(value) {
                return this.storage.setToken(value);
            }

            get token() {
                return this.storage.getToken();
            }

            deleteToken() {
                return this.storage.deleteToken();
            }
        }

        return new OAuthStorage();
    }];

}

/**
 * Export `OAuthStorageProvider`.
 */

export default OAuthStorageProvider;
