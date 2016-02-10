
/**
 * Test `OAuthProvider`.
 */

describe('OAuthProvider', function() {
  var defaults = {
    baseUrl: 'https://api.website.com',
    clientId: 'CLIENT_ID',
    grantPath: '/oauth2/token',
    revokePath: '/oauth2/revoke',
    clientSecret: 'CLIENT_SECRET'
  };

  describe('configure()', function() {
    var provider;

    beforeEach(function() {
      angular.module('angular-oauth2.test', [])
        .config(function(OAuthProvider) {
          provider = OAuthProvider;
        });

      angular.mock.module('angular-oauth2', 'angular-oauth2.test');

      angular.mock.inject(function() {});
    });

    it('should throw an error if configuration is not an object', function() {
      try {
        provider.configure(false);

        should.fail();
      } catch(e) {
        e.should.be.an.instanceOf(TypeError);
        e.message.should.match(/config/);
      }
    });

    it('should throw an error if already configured', function() {
      try {
        provider.configure(defaults);
        provider.configure(defaults);

        should.fail();
      } catch(e) {
        e.should.be.an.instanceOf(Error);
      }
    });

    it('should throw an error if `baseUrl` param is empty', function() {
      try {
        provider.configure(_.omit(defaults, 'baseUrl'));

        should.fail();
      } catch(e) {
        e.should.be.an.instanceOf(Error);
        e.message.should.match(/baseUrl/);
      }
    });

    it('should throw an error if `clientId` param is empty', function() {
      try {
        provider.configure(_.omit(defaults, 'clientId'));

        should.fail();
      } catch(e) {
        e.should.be.an.instanceOf(Error);
        e.message.should.match(/clientId/);
      }
    });

    it('should not throw an error if `clientSecret` param is empty', function() {
      var config = provider.configure(_.omit(defaults, 'clientSecret'));

      (null === config.clientSecret).should.true;
    });

    it('should throw an error if `grantPath` param is empty', function() {
      try {
        provider.configure(_.defaults({ grantPath: null }, defaults));

        should.fail();
      } catch(e) {
        e.should.be.an.instanceOf(Error);
        e.message.should.match(/grantPath/);
      }
    });

    it('should remove trailing slash from `baseUrl`', function() {
      var config = provider.configure(_.defaults({
        baseUrl: 'https://api.website.com/'
      }, defaults));

      config.baseUrl.should.equal('https://api.website.com');
    });

    it('should add facing slash from `grantPath`', function() {
      var config = provider.configure(_.defaults({
        grantPath: 'oauth2/token'
      }, defaults));

      config.grantPath.should.equal('/oauth2/token');
    });

    it('should throw an error if `revokePath` param is empty', function() {
      try {
        provider.configure(_.defaults({ revokePath: null }, defaults));

        should.fail();
      } catch(e) {
        e.should.be.an.instanceOf(Error);
        e.message.should.match(/revokePath/);
      }
    });

    it('should add facing slash from `revokePath`', function() {
      var config = provider.configure(_.defaults({
        revokePath: 'oauth2/revoke'
      }, defaults));

      config.revokePath.should.equal('/oauth2/revoke');
    });
  });

  describe('$get()', function() {
    beforeEach(function() {
      angular.module('angular-oauth2.test', ['angular-cookies.mock'])
        .config(function(OAuthProvider) {
          OAuthProvider.configure(defaults);
        });

      angular.mock.module('angular-oauth2', 'angular-oauth2.test');
    });

    afterEach(inject(function(OAuthToken) {
      OAuthToken.removeToken();
    }));

    describe('isAuthenticated()', function() {
      it('should be true when there is a stored `token` cookie', inject(function(OAuth, OAuthToken) {
        OAuthToken.setToken({ token_type: 'bearer', access_token: 'foo', expires_in: 3600, refresh_token: 'bar' });

        OAuth.isAuthenticated().should.be.true;
      }));

      it('should be false when there is no stored `token` cookie', inject(function(OAuth) {
        OAuth.isAuthenticated().should.be.false;
      }));
    });

    describe('getAccessToken()', function() {
      var data = queryString.stringify({
        client_id: defaults.clientId,
        grant_type: 'password',
        username: 'foo',
        password: 'bar',
        client_secret: defaults.clientSecret
      });

      it('should call `queryString.stringify`', inject(function(OAuth) {
        sinon.spy(queryString, 'stringify');

        OAuth.getAccessToken({
          username: 'foo',
          password: 'bar'
        });

        queryString.stringify.callCount.should.equal(1);
        queryString.stringify.firstCall.args.should.have.lengthOf(1);
        queryString.stringify.firstCall.args[0].should.eql({
          client_id: defaults.clientId,
          grant_type: 'password',
          username: 'foo',
          password: 'bar',
          client_secret: defaults.clientSecret
        });
        queryString.stringify.restore();
      }));

      it('should return an error if user credentials are invalid', inject(function($httpBackend, OAuth) {
        $httpBackend.expectPOST(defaults.baseUrl + defaults.grantPath, data)
          .respond(400, { error: 'invalid_grant' });

        OAuth.getAccessToken({
          username: 'foo',
          password: 'bar'
        }).then(function() {
          should.fail();
        }).catch(function(response) {
          response.status.should.equal(400);
          response.data.error.should.equal('invalid_grant');
        });

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      }));

      it('should retrieve and store `token` if request is successful', inject(function($httpBackend, OAuth, OAuthToken) {
        $httpBackend.expectPOST(defaults.baseUrl + defaults.grantPath, data)
          .respond({ token_type: 'bearer', access_token: 'foo', expires_in: 3600, refresh_token: 'bar' });

        OAuth.getAccessToken({
          username: 'foo',
          password: 'bar'
        }).then(function(response) {
          OAuthToken.getToken().should.eql(response.data);
        }).catch(function() {
          should.fail();
        });

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      }));
    });

    describe('refreshToken()', function() {
      var data = {
        client_id: defaults.clientId,
        grant_type: 'refresh_token',
        refresh_token: 'bar',
        client_secret: defaults.clientSecret
      };

      it('should call `queryString.stringify`', inject(function(OAuth, OAuthToken) {
        sinon.spy(queryString, 'stringify');

        OAuthToken.setToken({ token_type: 'bearer', access_token: 'foo', expires_in: 3600, refresh_token: 'bar' });

        OAuth.getRefreshToken();

        queryString.stringify.callCount.should.equal(1);
        queryString.stringify.firstCall.args.should.have.lengthOf(1);
        queryString.stringify.firstCall.args[0].should.eql({
          client_id: defaults.clientId,
          grant_type: 'refresh_token',
          refresh_token: 'bar',
          client_secret: defaults.clientSecret
        });
        queryString.stringify.restore();
      }));

      it('should return an error if `refresh_token` is missing', inject(function($httpBackend, OAuth) {
        $httpBackend.expectPOST(defaults.baseUrl + defaults.grantPath, queryString.stringify(_.assign({}, data, { 'refresh_token': undefined })))
          .respond(400, { error: 'invalid_request' });

        OAuth.getRefreshToken().then(function() {
          should.fail();
        }).catch(function(response) {
          response.status.should.equal(400);
          response.data.error.should.equal('invalid_request');
        });

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      }));

      it('should return an error if `refresh_token` is invalid', inject(function($httpBackend, OAuth, OAuthToken) {
        OAuthToken.setToken({ token_type: 'bearer', access_token: 'foo', expires_in: 3600, refresh_token: 'bar' });

        $httpBackend.expectPOST(defaults.baseUrl + defaults.grantPath, queryString.stringify(data))
          .respond(400, { error: 'invalid_grant' });

        OAuth.getRefreshToken().then(function() {
          should.fail();
        }).catch(function(response) {
          response.status.should.equal(400);
          response.data.error.should.equal('invalid_grant');
        });

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      }));

      it('should retrieve and store `refresh_token` if request is successful', inject(function($httpBackend, OAuth, OAuthToken) {
        OAuthToken.setToken({ token_type: 'bearer', access_token: 'foo', expires_in: 3600, refresh_token: 'bar' });

        $httpBackend.expectPOST(defaults.baseUrl + defaults.grantPath, queryString.stringify(data))
          .respond({ token_type: 'bearer', access_token: 'qux', expires_in: 3600, refresh_token: 'biz' });

        OAuth.getRefreshToken().then(function(response) {
          response.data.should.eql({
            token_type: 'bearer',
            access_token: 'qux',
            expires_in: 3600,
            refresh_token: 'biz'
          });
        }).catch(function() {
          should.fail();
        });

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      }));
    });

    describe('revokeToken()', function () {
      it('should call `queryString.stringify`', inject(function(OAuth, OAuthToken) {
        sinon.spy(queryString, 'stringify');

        OAuthToken.setToken({ token_type: 'bearer', access_token: 'foo', expires_in: 3600, refresh_token: 'bar' });

        OAuth.revokeToken();

        queryString.stringify.callCount.should.equal(1);
        queryString.stringify.firstCall.args.should.have.lengthOf(1);
        queryString.stringify.firstCall.args[0].should.eql({
          client_id: defaults.clientId,
          token: 'bar',
          token_type_hint: 'refresh_token',
          client_secret: defaults.clientSecret
        });
        queryString.stringify.restore();
      }));

      it('should call `queryString.stringify` with `access_token` if `refresh_token` is not available', inject(function(OAuth, OAuthToken) {
        sinon.spy(queryString, 'stringify');

        OAuthToken.setToken({ token_type: 'bearer', access_token: 'foo', expires_in: 3600 });

        OAuth.revokeToken();

        queryString.stringify.callCount.should.equal(1);
        queryString.stringify.firstCall.args.should.have.lengthOf(1);
        queryString.stringify.firstCall.args[0].should.eql({
          client_id: defaults.clientId,
          token: 'foo',
          token_type_hint: 'access_token',
          client_secret: defaults.clientSecret
        });
        queryString.stringify.restore();
      }));

      it('should return an error if `token` is missing', inject(function($httpBackend, OAuth) {
        var data = queryString.stringify({
          client_id: defaults.clientId,
          token: undefined,
          token_type_hint: 'access_token',
          client_secret: defaults.clientSecret
        });

        $httpBackend.expectPOST(defaults.baseUrl + defaults.revokePath, data)
          .respond(400, { error: 'invalid_request' });

        OAuth.revokeToken().then(function() {
          should.fail();
        }).catch(function(response) {
          response.status.should.equal(400);
        });

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      }));

      it('should revoke and remove `token` if request is successful', inject(function($httpBackend, OAuth, OAuthToken) {
        OAuthToken.setToken({ token_type: 'bearer', access_token: 'foo', expires_in: 3600, refresh_token: 'bar' });

        var data = queryString.stringify({
          client_id: defaults.clientId,
          token: 'bar',
          token_type_hint: 'refresh_token',
          client_secret: defaults.clientSecret
        });

        $httpBackend.expectPOST(defaults.baseUrl + defaults.revokePath, data)
          .respond(200);

        OAuth.revokeToken().then(function() {
          (undefined === OAuthToken.getToken()).should.be.true;
        }).catch(function() {
          should.fail();
        });

        $httpBackend.flush();

        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
      }));
    });
  });
});
