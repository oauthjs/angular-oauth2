
/**
 * Test `oauthConfig`.
 */

describe('oauthConfig', function() {
  it('should push `oauthInterceptor` into `$httpProvider`', function() {
    var httpProvider;

    angular.module('angular-oauth2.test', [])
      .config(function($httpProvider) {
        httpProvider = $httpProvider;
      });

    angular.mock.module('angular-oauth2', 'angular-oauth2.test');

    angular.mock.inject(function() {
      httpProvider.interceptors.should.containEql('oauthInterceptor');
    });
  });
});
