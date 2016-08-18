
/**
 * Module dependencies.
 */

import angular from 'angular';
import OAuthProvider from './providers/oauth-provider';
import OAuthTokenProvider from './providers/oauth-token-provider';
import oauthConfig from './config/oauth-config';
import oauthInterceptor from './interceptors/oauth-interceptor';
import LocalForageModule from 'angular-localForage';

var ngModule = angular.module('angular-oauth2', [
    LocalForageModule
  ])
  .config(oauthConfig)
  .factory('oauthInterceptor', oauthInterceptor)
  .provider('OAuth', OAuthProvider)
  .provider('OAuthToken', OAuthTokenProvider)
;

/**
 * Export `angular-oauth2`.
 */

export default ngModule;
