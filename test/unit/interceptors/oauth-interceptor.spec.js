
/**
 * Test `oauthInterceptor`.
 */

describe('oauthInterceptor', function() {
  beforeEach(function() {
    angular.mock.module('angular-oauth2', 'angular-cookies.mock');
  });

  afterEach(inject(function(OAuthToken) {
    OAuthToken.removeToken();
  }));

  it('should not inject `Authorization` header if `token` is empty', inject(function($http, $httpBackend) {
    $httpBackend.expectGET('https://website.com', function(headers) {
      headers.should.not.have.property('Authorization');

      return headers;
    }).respond(200);

    $http.get('https://website.com');
    $httpBackend.flush();
  }));

  it('should inject `Authorization` header if `token` exists', inject(function($http, $httpBackend, OAuthToken) {
    OAuthToken.setToken({ token_type: 'bearer', access_token: 'foo', expires_in: 3600, refresh_token: 'bar' });

    $httpBackend.expectGET('https://website.com', function(headers) {
      headers.should.have.property('Authorization');
      headers.Authorization.should.match(/Bearer/)

      return headers;
    }).respond(200);

    $http.get('https://website.com');
    $httpBackend.flush();
  }));

  it('should not inject `Authorization` header if it already exists', inject(function($http, $httpBackend, OAuthToken) {
    OAuthToken.setToken({ token_type: 'bearer', access_token: 'foo', expires_in: 3600, refresh_token: 'bar' });

    $httpBackend.expectGET('https://website.com', function(headers) {
      headers.Authorization = undefined;

      return headers;
    }).respond(200);

    $http.get('https://website.com').then(function(response) {
      response.config.headers.should.have.property('Authorization');
      (undefined === response.config.headers.Authorization).should.be.true;
    }).catch(function() {
      should.fail();
    });

    $httpBackend.flush();

    $httpBackend.verifyNoOutstandingExpectation();
    $httpBackend.verifyNoOutstandingRequest();
  }));

  it('should remove `token` if an `invalid_request` error occurs', inject(function($http, $httpBackend, OAuthToken) {
    sinon.spy(OAuthToken, 'removeToken');

    $httpBackend.expectGET('https://website.com').respond(400, { error: 'invalid_request' });

    $http.get('https://website.com');

    $httpBackend.flush();

    OAuthToken.removeToken.callCount.should.equal(1);
    OAuthToken.removeToken.restore();
  }));

  it('should emit `oauth:error` event if an `invalid_request` error occurs', inject(function($http, $httpBackend, $rootScope) {
    sinon.spy($rootScope, '$emit');

    $httpBackend.expectGET('https://website.com').respond(400, { error: 'invalid_request' });

    $http.get('https://website.com');

    $httpBackend.flush();

    $rootScope.$emit.callCount.should.equal(1);
    $rootScope.$emit.firstCall.args[0].should.eql('oauth:error');
    $rootScope.$emit.firstCall.args[1].should.have.property('status', 400);
    $rootScope.$emit.firstCall.args[1].should.have.property('data', { error: 'invalid_request' });
    $rootScope.$emit.restore();
  }));

  it('should remove `token` if an `invalid_grant` error occurs', inject(function($http, $httpBackend, OAuthToken) {
    sinon.spy(OAuthToken, 'removeToken');

    $httpBackend.expectGET('https://website.com').respond(400, { error: 'invalid_grant' });

    $http.get('https://website.com');

    $httpBackend.flush();

    OAuthToken.removeToken.callCount.should.equal(1);
    OAuthToken.removeToken.restore();
  }));

  it('should emit `oauth:error` event if an `invalid_grant` error occurs', inject(function($http, $httpBackend, $rootScope) {
    sinon.spy($rootScope, '$emit');

    $httpBackend.expectGET('https://website.com').respond(400, { error: 'invalid_grant' });

    $http.get('https://website.com');

    $httpBackend.flush();

    $rootScope.$emit.callCount.should.equal(1);
    $rootScope.$emit.firstCall.args[0].should.eql('oauth:error');
    $rootScope.$emit.firstCall.args[1].should.have.property('status', 400);
    $rootScope.$emit.firstCall.args[1].should.have.property('data', { error: 'invalid_grant' });
    $rootScope.$emit.restore();
  }));

  it('should emit `oauth:error` event if an `invalid_token` error occurs', inject(function($http, $httpBackend, $rootScope) {
    sinon.spy($rootScope, '$emit');

    $httpBackend.expectGET('https://website.com').respond(401, { error: 'invalid_token' });

    $http.get('https://website.com');

    $httpBackend.flush();

    $rootScope.$emit.callCount.should.equal(1);
    $rootScope.$emit.firstCall.args[0].should.eql('oauth:error');
    $rootScope.$emit.firstCall.args[1].should.have.property('status', 401);
    $rootScope.$emit.firstCall.args[1].should.have.property('data', { error: 'invalid_token' });
    $rootScope.$emit.restore();
  }));

  it('should emit `oauth:error` event if an `unauthorized` error occurs', inject(function($http, $httpBackend, $rootScope) {
    sinon.spy($rootScope, '$emit');

    $httpBackend.expectGET('https://website.com').respond(401, null, { 'www-authenticate': 'Bearer realm="example"' });

    $http.get('https://website.com');

    $httpBackend.flush();

    $rootScope.$emit.callCount.should.equal(1);
    $rootScope.$emit.firstCall.args[0].should.eql('oauth:error');
    $rootScope.$emit.firstCall.args[1].should.have.property('status', 401);
    $rootScope.$emit.firstCall.args[1].should.have.property('headers');
    $rootScope.$emit.firstCall.args[1].headers('www-authenticate').should.equal('Bearer realm="example"');
    $rootScope.$emit.restore();
  }));
});
