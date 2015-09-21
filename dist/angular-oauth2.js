/**
 * angular-oauth2 - Angular OAuth2
 * @version v3.0.1
 * @link https://github.com/seegno/angular-oauth2
 * @license MIT
 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([ "angular", "query-string" ], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("angular"), require("query-string"));
    } else {
        root.angularOAuth2 = factory(root.angular, root.queryString);
    }
})(this, function(angular, queryString) {
    var ngModule = angular.module("angular-oauth2", [ "ngCookies", "ngStorage" ]).config(oauthConfig).factory("oauthInterceptor", oauthInterceptor).provider("OAuth", OAuthProvider).provider("OAuthToken", OAuthTokenProvider).provider("OAuthStorage", OAuthStorageProvider);
    function oauthConfig($httpProvider) {
        $httpProvider.interceptors.push("oauthInterceptor");
    }
    oauthConfig.$inject = [ "$httpProvider" ];
    function oauthInterceptor($q, $rootScope, OAuthToken) {
        return {
            request: function(config) {
                if (OAuthToken.getAuthorizationHeader()) {
                    config.headers = config.headers || {};
                    config.headers.Authorization = OAuthToken.getAuthorizationHeader();
                }
                return config;
            },
            responseError: function(rejection) {
                if (400 === rejection.status && rejection.data && ("invalid_request" === rejection.data.error || "invalid_grant" === rejection.data.error)) {
                    OAuthToken.removeToken();
                    $rootScope.$emit("oauth:error", rejection);
                }
                if (401 === rejection.status && (rejection.data && "invalid_token" === rejection.data.error) || rejection.headers("www-authenticate") && 0 === rejection.headers("www-authenticate").indexOf("Bearer")) {
                    $rootScope.$emit("oauth:error", rejection);
                }
                return $q.reject(rejection);
            }
        };
    }
    oauthInterceptor.$inject = [ "$q", "$rootScope", "OAuthToken" ];
    var _prototypeProperties = function(child, staticProps, instanceProps) {
        if (staticProps) Object.defineProperties(child, staticProps);
        if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
    };
    var defaults = {
        baseUrl: null,
        clientId: null,
        clientSecret: null,
        grantPath: "/oauth2/token",
        revokePath: "/oauth2/revoke"
    };
    var requiredKeys = [ "baseUrl", "clientId", "grantPath", "revokePath" ];
    function OAuthProvider() {
        var config;
        this.configure = function(params) {
            if (config) {
                throw new Error("Already configured.");
            }
            if (!(params instanceof Object)) {
                throw new TypeError("Invalid argument: `config` must be an `Object`.");
            }
            config = angular.extend({}, defaults, params);
            angular.forEach(requiredKeys, function(key) {
                if (!config[key]) {
                    throw new Error("Missing parameter: " + key + ".");
                }
            });
            if ("/" === config.baseUrl.substr(-1)) {
                config.baseUrl = config.baseUrl.slice(0, -1);
            }
            if ("/" !== config.grantPath[0]) {
                config.grantPath = "/" + config.grantPath;
            }
            if ("/" !== config.revokePath[0]) {
                config.revokePath = "/" + config.revokePath;
            }
            return config;
        };
        this.$get = function($http, OAuthToken) {
            var OAuth = function() {
                function OAuth() {
                    if (!config) {
                        throw new Error("`OAuthProvider` must be configured first.");
                    }
                }
                _prototypeProperties(OAuth, null, {
                    isAuthenticated: {
                        value: function isAuthenticated() {
                            return !!OAuthToken.getToken();
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getAccessToken: {
                        value: function getAccessToken(user, options) {
                            if (!user || !user.username || !user.password) {
                                throw new Error("`user` must be an object with `username` and `password` properties.");
                            }
                            var data = {
                                client_id: config.clientId,
                                grant_type: "password",
                                username: user.username,
                                password: user.password
                            };
                            if (null !== config.clientSecret) {
                                data.client_secret = config.clientSecret;
                            }
                            data = queryString.stringify(data);
                            options = angular.extend({
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            }, options);
                            return $http.post("" + config.baseUrl + "" + config.grantPath, data, options).then(function(response) {
                                OAuthToken.setToken(response.data);
                                return response;
                            });
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getRefreshToken: {
                        value: function getRefreshToken() {
                            var data = {
                                client_id: config.clientId,
                                grant_type: "refresh_token",
                                refresh_token: OAuthToken.getRefreshToken()
                            };
                            if (null !== config.clientSecret) {
                                data.client_secret = config.clientSecret;
                            }
                            data = queryString.stringify(data);
                            var options = {
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            };
                            return $http.post("" + config.baseUrl + "" + config.grantPath, data, options).then(function(response) {
                                OAuthToken.setToken(response.data);
                                return response;
                            });
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    revokeToken: {
                        value: function revokeToken() {
                            var data = queryString.stringify({
                                token: OAuthToken.getRefreshToken() ? OAuthToken.getRefreshToken() : OAuthToken.getAccessToken()
                            });
                            var options = {
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            };
                            return $http.post("" + config.baseUrl + "" + config.revokePath, data, options).then(function(response) {
                                OAuthToken.removeToken();
                                return response;
                            });
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    }
                });
                return OAuth;
            }();
            return new OAuth();
        };
        this.$get.$inject = [ "$http", "OAuthToken" ];
    }
    var _prototypeProperties = function(child, staticProps, instanceProps) {
        if (staticProps) Object.defineProperties(child, staticProps);
        if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
    };
    function OAuthTokenProvider($injector) {
        var config = {
            name: "token",
            storage: "cookies",
            options: {
                secure: true
            }
        };
        this.configure = function(params) {
            if (!(params instanceof Object)) {
                throw new TypeError("Invalid argument: `config` must be an `Object`.");
            }
            angular.extend(config, params);
            $injector.invoke(function(OAuthStorageProvider) {
                OAuthStorageProvider.configure(config);
            });
            return config;
        };
        this.$get = function(OAuthStorage) {
            var OAuthToken = function() {
                function OAuthToken() {}
                _prototypeProperties(OAuthToken, null, {
                    setToken: {
                        value: function setToken(data) {
                            return OAuthStorage.setToken(data);
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getToken: {
                        value: function getToken() {
                            return OAuthStorage.getToken();
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getAccessToken: {
                        value: function getAccessToken() {
                            return this.getToken() ? this.getToken().access_token : undefined;
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getAuthorizationHeader: {
                        value: function getAuthorizationHeader() {
                            if (!(this.getTokenType() && this.getAccessToken())) {
                                return;
                            }
                            return "" + (this.getTokenType().charAt(0).toUpperCase() + this.getTokenType().substr(1)) + " " + this.getAccessToken();
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getRefreshToken: {
                        value: function getRefreshToken() {
                            return this.getToken() ? this.getToken().refresh_token : undefined;
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getTokenType: {
                        value: function getTokenType() {
                            return this.getToken() ? this.getToken().token_type : undefined;
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    removeToken: {
                        value: function removeToken() {
                            return OAuthStorage.deleteToken();
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    }
                });
                return OAuthToken;
            }();
            return new OAuthToken();
        };
        this.$get.$inject = [ "OAuthStorage" ];
    }
    var _prototypeProperties = function(child, staticProps, instanceProps) {
        if (staticProps) Object.defineProperties(child, staticProps);
        if (instanceProps) Object.defineProperties(child.prototype, instanceProps);
    };
    function OAuthStorageProvider() {
        var config = {
            name: "token",
            storage: "cookies",
            options: {
                secure: true
            }
        };
        this.configure = function(params) {
            angular.extend(config, params);
            return config;
        };
        this.$get = function($localStorage, $sessionStorage, $cookies, $log) {
            var storage;
            var ngStorage = config.storage.toLowerCase();
            if (ngStorage === "localstorage") {
                storage = $localStorage;
            } else if (ngStorage === "sessionstorage") {
                storage = $sessionStorage;
            } else if (ngStorage === "cookies") {
                storage = $cookies;
            } else {
                storage = $cookies;
                $log.warn("Set storage to cookies, because storage type is unknown");
            }
            var BrowserStorage = function() {
                function BrowserStorage(storage, name) {
                    this.storage = storage;
                    this.name = name;
                }
                _prototypeProperties(BrowserStorage, null, {
                    setToken: {
                        value: function setToken(data) {
                            return this.storage[this.name] = angular.toJson(data);
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getToken: {
                        value: function getToken() {
                            return angular.fromJson(this.storage[this.name]);
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    deleteToken: {
                        value: function deleteToken() {
                            delete this.storage[this.name];
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    }
                });
                return BrowserStorage;
            }();
            var CookieStorage = function() {
                function CookieStorage($cookies, name, options) {
                    this.$cookies = $cookies;
                    this.name = name;
                    this.options = options;
                }
                _prototypeProperties(CookieStorage, null, {
                    setToken: {
                        value: function setToken(value) {
                            return this.$cookies.putObject(this.name, value, this.options);
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getToken: {
                        value: function getToken() {
                            return this.$cookies.getObject(this.name);
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    deleteToken: {
                        value: function deleteToken() {
                            return this.$cookies.remove(this.name, this.options);
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    }
                });
                return CookieStorage;
            }();
            var OAuthStorage = function() {
                function OAuthStorage(storage) {
                    this.storage = storage;
                }
                _prototypeProperties(OAuthStorage, null, {
                    setToken: {
                        value: function setToken(value) {
                            return this.storage.setToken(value);
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getToken: {
                        value: function getToken() {
                            return this.storage.getToken();
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    deleteToken: {
                        value: function deleteToken() {
                            return this.storage.deleteToken();
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    }
                });
                return OAuthStorage;
            }();
            storage = ngStorage === "cookies" ? new CookieStorage(storage, config.name, config.options) : new BrowserStorage(storage, config.name);
            return new OAuthStorage(storage);
        };
        this.$get.$inject = [ "$localStorage", "$sessionStorage", "$cookies", "$log" ];
    }
    return ngModule;
});