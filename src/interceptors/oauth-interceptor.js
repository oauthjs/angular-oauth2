
/**
 * OAuth interceptor.
 */

function oauthInterceptor($q, $rootScope, OAuthToken) {
  return {
    request: function(config) {
      config.headers = config.headers || {};

      // Inject `Authorization` header.
      if (!config.headers.hasOwnProperty('Authorization') && OAuthToken.getAuthorizationHeader()) {
        config.headers.Authorization = OAuthToken.getAuthorizationHeader();
      }

      return config;
    },
    responseError: function(rejection) {
      if (!rejection) {
        return $q.reject(rejection);
      }

      // Catch `invalid_request` and `invalid_grant` errors and ensure that the `token` is removed.
      if (400 === rejection.status && rejection.data &&
        ('invalid_request' === rejection.data.error || 'invalid_grant' === rejection.data.error)
      ) {
        OAuthToken.removeToken();

        $rootScope.$emit('oauth:error', rejection);
      }

      // Catch `invalid_token` and `unauthorized` errors.
      // The token isn't removed here so it can be refreshed when the `invalid_token` error occurs.
      if (401 === rejection.status &&
        (rejection.data && 'invalid_token' === rejection.data.error) ||
        (rejection.headers && rejection.headers('www-authenticate') && 0 === rejection.headers('www-authenticate').indexOf('Bearer'))
      ) {
        $rootScope.$emit('oauth:error', rejection);
      }

      return $q.reject(rejection);
    }
  };
}

oauthInterceptor.$inject = ['$q', '$rootScope', 'OAuthToken'];

/**
 * Export `oauthInterceptor`.
 */

export default oauthInterceptor;
