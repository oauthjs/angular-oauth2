/**
 * angular-oauth2 - Angular OAuth2
 * @version v4.1.1
 * @link https://github.com/seegno/angular-oauth2
 * @license MIT
 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([ "angular", "angular-cookies", "query-string", "ngstorage" ], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("angular"), require("angular-cookies"), require("query-string"), require("ngstorage"));
    } else {
        root.angularOAuth2 = factory(root.angular, "ngCookies", root.queryString, "ngStorage");
    }
})(this, function(angular, ngCookies, queryString, ngStorage) {
    var ngModule = angular.module("angular-oauth2", [ ngCookies, ngStorage ]).config(oauthConfig).factory("oauthInterceptor", oauthInterceptor).provider("OAuth", OAuthProvider).provider("OAuthToken", OAuthTokenProvider);
    function oauthConfig($httpProvider) {
        $httpProvider.interceptors.push("oauthInterceptor");
    }
    oauthConfig.$inject = [ "$httpProvider" ];
    function oauthInterceptor($q, $rootScope, OAuthToken) {
        return {
            request: function request(config) {
                config.headers = config.headers || {};
                if (!config.headers.hasOwnProperty("Authorization") && OAuthToken.getAuthorizationHeader()) {
                    config.headers.Authorization = OAuthToken.getAuthorizationHeader();
                }
                return config;
            },
            responseError: function responseError(rejection) {
                if (400 === rejection.status && rejection.data && ("invalid_request" === rejection.data.error || "invalid_grant" === rejection.data.error)) {
                    OAuthToken.removeToken();
                    $rootScope.$emit("oauth:error", rejection);
                }
                if (401 === rejection.status && rejection.data && "invalid_token" === rejection.data.error || rejection.headers("www-authenticate") && 0 === rejection.headers("www-authenticate").indexOf("Bearer")) {
                    $rootScope.$emit("oauth:error", rejection);
                }
                return $q.reject(rejection);
            }
        };
    }
    oauthInterceptor.$inject = [ "$q", "$rootScope", "OAuthToken" ];
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }
    var defaults = {
        baseUrl: null,
        clientId: null,
        clientSecret: null,
        grantPath: "/oauth2/token",
        revokePath: "/oauth2/revoke"
    };
    var requiredKeys = [ "baseUrl", "clientId", "grantPath", "revokePath" ];
    function OAuthProvider() {
        var _this = this;
        var sanitizeConfigParams = function sanitizeConfigParams(params) {
            if (!(params instanceof Object)) {
                throw new TypeError("Invalid argument: `config` must be an `Object`.");
            }
            var config = angular.extend({}, defaults, params);
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
        this.configure = function(params) {
            _this.defaultConfig = sanitizeConfigParams(params);
        };
        this.$get = function($http, OAuthToken) {
            var OAuth = function() {
                function OAuth(config) {
                    _classCallCheck(this, OAuth);
                    this.config = config;
                }
                _createClass(OAuth, [ {
                    key: "configure",
                    value: function configure(params) {
                        this.config = sanitizeConfigParams(params);
                    }
                }, {
                    key: "isAuthenticated",
                    value: function isAuthenticated() {
                        return !!OAuthToken.getToken();
                    }
                }, {
                    key: "getAccessToken",
                    value: function getAccessToken(data, options) {
                        data = angular.extend({
                            client_id: this.config.clientId,
                            grant_type: "password"
                        }, data);
                        if (null !== this.config.clientSecret) {
                            data.client_secret = this.config.clientSecret;
                        }
                        data = queryString.stringify(data);
                        options = angular.extend({
                            headers: {
                                Authorization: undefined,
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        }, options);
                        return $http.post("" + this.config.baseUrl + this.config.grantPath, data, options).then(function(response) {
                            OAuthToken.setToken(response.data);
                            return response;
                        });
                    }
                }, {
                    key: "getRefreshToken",
                    value: function getRefreshToken(data, options) {
                        data = angular.extend({
                            client_id: this.config.clientId,
                            grant_type: "refresh_token",
                            refresh_token: OAuthToken.getRefreshToken()
                        }, data);
                        if (null !== this.config.clientSecret) {
                            data.client_secret = this.config.clientSecret;
                        }
                        data = queryString.stringify(data);
                        options = angular.extend({
                            headers: {
                                Authorization: undefined,
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        }, options);
                        return $http.post("" + this.config.baseUrl + this.config.grantPath, data, options).then(function(response) {
                            OAuthToken.setToken(response.data);
                            return response;
                        });
                    }
                }, {
                    key: "revokeToken",
                    value: function revokeToken(data, options) {
                        var refreshToken = OAuthToken.getRefreshToken();
                        data = angular.extend({
                            client_id: this.config.clientId,
                            token: refreshToken ? refreshToken : OAuthToken.getAccessToken(),
                            token_type_hint: refreshToken ? "refresh_token" : "access_token"
                        }, data);
                        if (null !== this.config.clientSecret) {
                            data.client_secret = this.config.clientSecret;
                        }
                        data = queryString.stringify(data);
                        options = angular.extend({
                            headers: {
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        }, options);
                        return $http.post("" + this.config.baseUrl + this.config.revokePath, data, options).then(function(response) {
                            OAuthToken.removeToken();
                            return response;
                        });
                    }
                } ]);
                return OAuth;
            }();
            return new OAuth(this.defaultConfig);
        };
        this.$get.$inject = [ "$http", "OAuthToken" ];
    }
    var _createClass = function() {
        function defineProperties(target, props) {
            for (var i = 0; i < props.length; i++) {
                var descriptor = props[i];
                descriptor.enumerable = descriptor.enumerable || false;
                descriptor.configurable = true;
                if ("value" in descriptor) descriptor.writable = true;
                Object.defineProperty(target, descriptor.key, descriptor);
            }
        }
        return function(Constructor, protoProps, staticProps) {
            if (protoProps) defineProperties(Constructor.prototype, protoProps);
            if (staticProps) defineProperties(Constructor, staticProps);
            return Constructor;
        };
    }();
    function _classCallCheck(instance, Constructor) {
        if (!(instance instanceof Constructor)) {
            throw new TypeError("Cannot call a class as a function");
        }
    }
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
        this.$get = function($cookies, $localStorage) {
            var OAuthToken = function() {
                function OAuthToken() {
                    _classCallCheck(this, OAuthToken);
                }
                _createClass(OAuthToken, [ {
                    key: "setToken",
                    value: function setToken(data) {
                        $cookies.putObject(config.name, data, config.options);
                        $localStorage[config.name] = data;
                        return $localStorage[config.name];
                    }
                }, {
                    key: "getToken",
                    value: function getToken() {
                        return $localStorage[config.name] || $cookies.getObject(config.name);
                    }
                }, {
                    key: "getAccessToken",
                    value: function getAccessToken() {
                        return this.getToken() ? this.getToken().access_token : undefined;
                    }
                }, {
                    key: "getAuthorizationHeader",
                    value: function getAuthorizationHeader() {
                        if (!(this.getTokenType() && this.getAccessToken())) {
                            return;
                        }
                        return this.getTokenType().charAt(0).toUpperCase() + this.getTokenType().substr(1) + " " + this.getAccessToken();
                    }
                }, {
                    key: "getRefreshToken",
                    value: function getRefreshToken() {
                        return this.getToken() ? this.getToken().refresh_token : undefined;
                    }
                }, {
                    key: "getTokenType",
                    value: function getTokenType() {
                        return this.getToken() ? this.getToken().token_type : undefined;
                    }
                }, {
                    key: "removeToken",
                    value: function removeToken() {
                        delete $localStorage[config.name];
                        return $cookies.remove(config.name, config.options);
                    }
                } ]);
                return OAuthToken;
            }();
            return new OAuthToken();
        };
        this.$get.$inject = [ "$cookies", "$localStorage" ];
    }
    return ngModule;
});