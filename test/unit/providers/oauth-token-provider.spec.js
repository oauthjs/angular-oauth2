/**
 * Test `OAuthTokenProvider`.
 */

describe('OAuthTokenProvider', function() {
  describe('configure()', function() {
    var provider;

    beforeEach(function() {
      angular.module('angular-oauth2.test', [])
        .config(function(OAuthTokenProvider) {
          provider = OAuthTokenProvider;
        });

      angular.mock.module('angular-oauth2', 'angular-oauth2.test');

      angular.mock.inject(function() {});
    });

    it('should throw an error if configuration is not an object', function() {
      try {
        provider.configure(false);

        should.fail();
      } catch (e) {
        e.should.be.an.instanceOf(TypeError);
        e.message.should.match(/config/);
      }
    });
  });

  describe('$get()', function() {
    beforeEach(function() {
      angular.module('angular-oauth2.test', ['angular-localforage.mock'])
        .config(function(OAuthProvider) {
          OAuthProvider.configure({
            baseUrl: 'https://api.website.com',
            clientId: 'CLIENT_ID'
          });
        });

      angular.mock.module('angular-oauth2', 'angular-oauth2.test');

      angular.mock.inject(function(OAuthToken) {
        OAuthToken.setToken({
          token_type: 'bearer',
          access_token: 'foo',
          expires_in: 3600,
          refresh_token: 'bar'
        });
      });

    });

    afterEach(inject(function(OAuthToken) {
      OAuthToken.removeToken();
    }));

    it('getAuthorizationHeader()', inject(function(OAuthToken) {
      OAuthToken.getAuthorizationHeader()
        .then(function(header) {
          header.should.eql('Bearer foo');
        })
    }));

    it('getAccessToken()', inject(function(OAuthToken) {
      OAuthToken.getAccessToken()
        .then(function(token) {
          token.should.eql('foo');
        });
    }));

    it('getRefreshToken()', inject(function(OAuthToken) {
      OAuthToken.getRefreshToken()
        .then(function(token) {
          token.should.eql('bar');
        });
    }));

    it('setToken()', inject(function(OAuthToken) {
      OAuthToken.setToken({
          token_type: 'bearer',
          access_token: 'qux',
          expires_in: 3600,
          refresh_token: 'biz'
        })
        .then(function() {
          OAuthToken.getToken()
            .then(function(token) {
              token.should.eql({
                token_type: 'bearer',
                access_token: 'qux',
                expires_in: 3600,
                refresh_token: 'biz'
              });
            });
        });

    }));

    it('getToken()', inject(function(OAuthToken) {
      OAuthToken.getToken()
        .then(function(token) {
          token.should.eql({
            token_type: 'bearer',
            access_token: 'foo',
            expires_in: 3600,
            refresh_token: 'bar'
          });
        });
    }));

    it('getTokenType()', inject(function(OAuthToken) {
      OAuthToken.getTokenType()
        .then(function(token) {
          token.should.eql('bearer');
        });
    }));

    it('removeToken()', inject(function(OAuthToken) {
      OAuthToken.removeToken();
      OAuthToken.getToken()
        .then(function(token) {
          (undefined === token)
          .should.true;
        });
    }));
  });
});
