
/**
 * OAuth config.
 */

function oauthConfig($httpProvider) {
  $httpProvider.interceptors.push('oauthInterceptor');
}

oauthConfig.$inject = ['$httpProvider'];

/**
 * Export `oauthConfig`.
 */

export default oauthConfig;
