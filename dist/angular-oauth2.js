/**
 * ng-oauth-localforage - Angular OAuth using LocalForage
 * @version v4.1.0
 * @link https://github.com/DotHide/angular-oauth2
 * @license MIT
 */
(function(root, factory) {
    if (typeof define === "function" && define.amd) {
        define([ "angular", "angular-localforage", "query-string" ], factory);
    } else if (typeof exports === "object") {
        module.exports = factory(require("angular"), require("angular-localforage"));
    } else {
        root.angularOAuth2 = factory(root.angular, "LocalForageModule");
    }
})(this, function(angular, LocalForageModule) {
    var ngModule = angular.module("angular-oauth2", [ LocalForageModule ]).config(oauthConfig).factory("oauthInterceptor", oauthInterceptor).provider("OAuth", OAuthProvider).provider("OAuthToken", OAuthTokenProvider);
    function oauthConfig($httpProvider) {
        $httpProvider.interceptors.push("oauthInterceptor");
    }
    oauthConfig.$inject = [ "$httpProvider" ];
    function oauthInterceptor($q, $rootScope, OAuthToken) {
        return {
            request: function request(config) {
                config.headers = config.headers || {};
                return OAuthToken.getAuthorizationHeader().then(function(header) {
                    if (!config.headers.hasOwnProperty("Authorization") && !!header) {
                        config.headers.Authorization = header;
                    }
                    return config;
                });
            },
            responseError: function responseError(rejection) {
                if (400 === rejection.status && rejection.data && ("invalid_request" === rejection.data.error || "invalid_grant" === rejection.data.error)) {
                    OAuthToken.removeToken().then(function() {
                        $rootScope.$emit("oauth:error", rejection);
                    });
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
                    _classCallCheck(this, OAuth);
                    if (!config) {
                        throw new Error("`OAuthProvider` must be configured first.");
                    }
                }
                _createClass(OAuth, [ {
                    key: "isAuthenticated",
                    value: function isAuthenticated() {
                        return OAuthToken.getToken().then(function(token) {
                            return !!token;
                        });
                    }
                }, {
                    key: "getAccessToken",
                    value: function getAccessToken(data, options) {
                        var response;
                        data = angular.extend({
                            client_id: config.clientId,
                            grant_type: "password"
                        }, data);
                        if (null !== config.clientSecret) {
                            data.client_secret = config.clientSecret;
                        }
                        data = queryString.stringify(data);
                        options = angular.extend({
                            headers: {
                                Authorization: undefined,
                                "Content-Type": "application/x-www-form-urlencoded"
                            }
                        }, options);
                        return $http.post("" + config.baseUrl + config.grantPath, data, options).then(function(res) {
                            response = res;
                            return OAuthToken.setToken(response.data);
                        }).then(function() {
                            return response;
                        });
                    }
                }, {
                    key: "getRefreshToken",
                    value: function getRefreshToken(data, options) {
                        var response;
                        return OAuthToken.getRefreshToken().then(function(refresh_token) {
                            data = angular.extend({
                                client_id: config.clientId,
                                grant_type: "refresh_token",
                                refresh_token: refresh_token
                            }, data);
                            if (null !== config.clientSecret) {
                                data.client_secret = config.clientSecret;
                            }
                            data = queryString.stringify(data);
                            options = angular.extend({
                                headers: {
                                    Authorization: undefined,
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            }, options);
                            return $http.post("" + config.baseUrl + config.grantPath, data, options);
                        }).then(function(res) {
                            response = res;
                            return OAuthToken.setToken(response.data);
                        }).then(function() {
                            return response;
                        });
                    }
                }, {
                    key: "revokeToken",
                    value: function revokeToken(data, options) {
                        var refreshToken, accessToken, response;
                        return OAuthToken.getAccessToken().then(function(at) {
                            accessToken = at;
                            return OAuthToken.getRefreshToken();
                        }).then(function(rt) {
                            refreshToken = rt;
                            data = angular.extend({
                                client_id: config.clientId,
                                token: refreshToken ? refreshToken : accessToken,
                                token_type_hint: refreshToken ? "refresh_token" : "access_token"
                            }, data);
                            if (null !== config.clientSecret) {
                                data.client_secret = config.clientSecret;
                            }
                            data = queryString.stringify(data);
                            options = angular.extend({
                                headers: {
                                    "Content-Type": "application/x-www-form-urlencoded"
                                }
                            }, options);
                            return $http.post("" + config.baseUrl + config.revokePath, data, options);
                        }).then(function(res) {
                            response = res;
                            return OAuthToken.removeToken();
                        }).then(function() {
                            return response;
                        });
                    }
                } ]);
                return OAuth;
            }();
            return new OAuth();
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
        this.$get = function($localForage) {
            var OAuthToken = function() {
                function OAuthToken() {
                    _classCallCheck(this, OAuthToken);
                }
                _createClass(OAuthToken, [ {
                    key: "setToken",
                    value: function setToken(data) {
                        return $localForage.setItem(config.name, data);
                    }
                }, {
                    key: "getToken",
                    value: function getToken() {
                        return $localForage.getItem(config.name).then(function(data) {
                            return data;
                        });
                    }
                }, {
                    key: "getAccessToken",
                    value: function getAccessToken() {
                        return this.getToken().then(function(token) {
                            return token ? token.access_token : undefined;
                        });
                    }
                }, {
                    key: "getAuthorizationHeader",
                    value: function getAuthorizationHeader() {
                        var _this = this;
                        var token_type, access_token;
                        return this.getTokenType().then(function(tt) {
                            token_type = tt;
                            return _this.getAccessToken();
                        }).then(function(at) {
                            access_token = at;
                            if (!(token_type && access_token)) {
                                return null;
                            } else {
                                return token_type.charAt(0).toUpperCase() + token_type.substr(1) + " " + access_token;
                            }
                        });
                    }
                }, {
                    key: "getRefreshToken",
                    value: function getRefreshToken() {
                        return this.getToken().then(function(token) {
                            return token ? token.refresh_token : undefined;
                        });
                    }
                }, {
                    key: "getTokenType",
                    value: function getTokenType() {
                        return this.getToken().then(function(token) {
                            return token ? token.token_type : undefined;
                        });
                    }
                }, {
                    key: "removeToken",
                    value: function removeToken() {
                        return $localForage.removeItem(config.name);
                    }
                } ]);
                return OAuthToken;
            }();
            return new OAuthToken();
        };
        this.$get.$inject = [ "$localForage" ];
    }
    return ngModule;
});