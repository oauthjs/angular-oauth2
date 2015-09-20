/**
 * Module dependencies.
 */

import angular from 'angular';

/**
 * OAuthStorage Service.
 */

function OAuthStorageProvider() {

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
        // Extend default configuration.
        angular.extend(config, params);
        return config;
    };

    /**
     * OAuthStorage Service.
     *
     * @ngInject
     */

    this.$get = function ($localStorage, $sessionStorage, $cookies, $log) {
        var storage;
        var ngStorage = config.storage.toLowerCase();
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
            storage = $cookies;
            $log.warn('Set storage to cookies, because storage type is unknown');
        }

        class BrowserStorage {
            constructor(storage, name) {
                this.storage = storage;
                this.name = name;
            }

            setToken(data) {
                return (this.storage[this.name] = angular.toJson(data));
            }

            getToken() {
                return angular.fromJson(this.storage[this.name]);
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

            setToken(value) {
                return this.$cookies.putObject(this.name, value, this.options);
            }

            getToken() {
                return this.$cookies.getObject(this.name);
            }

            deleteToken() {
                return this.$cookies.remove(this.name, this.options);
            }
        }


        class  OAuthStorage {
            constructor(storage) {
                this.storage = storage;
            }

            /**
             * setToken
             *
             * @param value
             * @returns {*}
             */
            setToken(value) {
                return this.storage.setToken(value);
            }

            /**
             * getToken
             * @returns {*}
             */
            getToken() {
                return this.storage.getToken();
            }

            deleteToken() {
                return this.storage.deleteToken();
            }
        }

        storage = ngStorage === 'cookies' ?
            new CookieStorage(storage, config.name, config.options) :
            new BrowserStorage(storage, config.name);

        return new OAuthStorage(storage);
    };

}

/**
 * Export `OAuthStorageProvider`.
 */

export default OAuthStorageProvider;
