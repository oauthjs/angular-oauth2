/**
 * angular-oauth2 - Angular OAuth2
 * @version v1.0.2
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
    var ngModule = angular.module("angular-oauth2", [ "ipCookie" ]).config(oauthConfig).factory("oauthInterceptor", oauthInterceptor).provider("OAuth", OAuthProvider).provider("OAuthToken", OAuthTokenProvider);
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
                if (401 === rejection.status && rejection.data && "invalid_token" === rejection.data.error) {
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
            angular.forEach(config, function(value, key) {
                if (!value) {
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
                            return !!OAuthToken.token;
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
                            var data = queryString.stringify({
                                client_id: config.clientId,
                                client_secret: config.clientSecret,
                                grant_type: "password",
                                username: user.username,
                                password: user.password
                            });
                            options = angular.extend({
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            }, options);
                            return $http.post("" + config.baseUrl + "" + config.grantPath, data, options).then(function(response) {
                                OAuthToken.token = response.data;
                                return response;
                            });
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getRefreshToken: {
                        value: function getRefreshToken() {
                            var data = queryString.stringify({
                                client_id: config.clientId,
                                client_secret: config.clientSecret,
                                grant_type: "refresh_token",
                                refresh_token: OAuthToken.getRefreshToken()
                            });
                            var options = {
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            };
                            return $http.post("" + config.baseUrl + "" + config.grantPath, data, options).then(function(response) {
                                OAuthToken.token = response.data;
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
    function OAuthTokenProvider() {
        var config = {
            name: "token",
            options: {
                secure: true
            }
        };
        this.configure = function(params) {
            if (!(params instanceof Object)) {
                throw new TypeError("Invalid argument: `config` must be an `Object`.");
            }
            angular.extend(config, params);
            return config;
        };
        this.$get = function(ipCookie) {
            var OAuthToken = function() {
                function OAuthToken() {}
                _prototypeProperties(OAuthToken, null, {
                    token: {
                        set: function(data) {
                            return ipCookie(config.name, data, config.options);
                        },
                        get: function() {
                            return ipCookie(config.name);
                        },
                        enumerable: true,
                        configurable: true
                    },
                    getAccessToken: {
                        value: function getAccessToken() {
                            return this.token ? this.token.access_token : undefined;
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
                            return this.token ? this.token.refresh_token : undefined;
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    getTokenType: {
                        value: function getTokenType() {
                            return this.token ? this.token.token_type : undefined;
                        },
                        writable: true,
                        enumerable: true,
                        configurable: true
                    },
                    removeToken: {
                        value: function removeToken() {
                            return ipCookie.remove(config.name, config.options);
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
        this.$get.$inject = [ "ipCookie" ];
    }
    return ngModule;
});