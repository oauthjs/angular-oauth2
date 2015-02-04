
/**
 * OAuth interceptor.
 *
 * @ngInject
 */

function oauthInterceptor($q, $rootScope, OAuthToken) {
  return {
    request: function(config) {
      // Inject `Authorization` header.
      if (OAuthToken.getAuthorizationHeader()) {
        config.headers = config.headers || {};
        config.headers.Authorization = OAuthToken.getAuthorizationHeader();
      }

      return config;
    },
    responseError: function(rejection) {
      // Catch `invalid_request` and `invalid_grant` errors and ensure that the `token` is removed.
      if (400 === rejection.status && rejection.data &&
        ('invalid_request' === rejection.data.error || 'invalid_grant' === rejection.data.error)
      ) {
        OAuthToken.removeToken();

        $rootScope.$emit('oauth:error', rejection);
      }

      // Catch `invalid_token` error. Token isn't removed here so it can be refreshed.
      if (401 === rejection.status && rejection.data && 'invalid_token' === rejection.data.error) {
        $rootScope.$emit('oauth:error', rejection);
      }

      return $q.reject(rejection);
    }
  };
}

/**
 * Export `oauthInterceptor`.
 */

export default oauthInterceptor;
