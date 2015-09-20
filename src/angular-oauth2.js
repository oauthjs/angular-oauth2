
/**
 * Module dependencies.
 */

import angular from 'angular';
import OAuthProvider from './providers/oauth-provider';
import OAuthTokenProvider from './providers/oauth-token-provider';
import oauthConfig from './config/oauth-config';
import oauthInterceptor from './interceptors/oauth-interceptor';
import OAuthStorageProvider from './services/oauth-storage-provider';
import 'angular-cookies';
import 'ngstorage';

var ngModule = angular.module('angular-oauth2', [
    'ngCookies',
    'ngStorage'
  ])
  .config(oauthConfig)
  .factory('oauthInterceptor', oauthInterceptor)
  .provider('OAuth', OAuthProvider)
  .provider('OAuthToken', OAuthTokenProvider)
  .provider('OAuthStorage', OAuthStorageProvider)
;

/**
 * Export `angular-oauth2`.
 */

export default ngModule;
