
/**
 * OAuth config.
 *
 * @ngInject
 */

function oauthConfig($httpProvider) {
  $httpProvider.interceptors.push('oauthInterceptor');
}

/**
 * Export `oauthConfig`.
 */

export default oauthConfig;
