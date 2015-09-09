# angular-oauth2

AngularJS OAuth2 authentication module written in ES6.

---

## Installation

Choose your preferred method:

* Bower: `bower install angular-oauth2`
* NPM: `npm install --save angular-oauth2`
* Download: [angular-oauth2](https://raw.github.com/seegno/angular-oauth2/master/dist/angular-oauth2.min.js)

## Usage

###### 1. Download `angular-oauth2` dependencies.

* [angular](https://github.com/angular/angular.js)
* [angular-cookie](https://github.com/ivpusic/angular-cookie)
* [query-string](https://github.com/sindresorhus/query-string)

If you're using `bower` they will be automatically downloaded upon installing this library.

###### 2. Include `angular-oauth2` and dependencies.

```html
<script src="<VENDOR_FOLDER>/angular/angular.min.js"></script>
<script src="<VENDOR_FOLDER>/angular-cookie/dist/angular-cookie.min.js"></script>
<script src="<VENDOR_FOLDER>/query-string/query-string.min.js"></script>
<script src="<VENDOR_FOLDER>/angular-oauth2/dist/angular-oauth2.min.js"></script>
```

###### 3. Configure `OAuth` (required) and `OAuthToken` (optional):

```js
angular.module('myApp', ['angular-oauth2'])
  .config(['OAuthProvider', function(OAuthProvider) {
    OAuthProvider.configure({
      baseUrl: 'https://api.website.com',
      clientId: 'CLIENT_ID',
      clientSecret: 'CLIENT_SECRET' // optional
    });
  }]);
```

###### 4. Catch `OAuth` errors and do something with them (optional):

```js
angular.module('myApp', ['angular-oauth2'])
  .run(['$rootScope', '$window', function($rootScope, $window, OAuth) {
    $rootScope.$on('oauth:error', function(event, rejection) {
      // Ignore `invalid_grant` error - should be catched on `LoginController`.
      if ('invalid_grant' === rejection.data.error) {
        return;
      }

      // Refresh token when a `invalid_token` error occurs.
      if ('invalid_token' === rejection.data.error) {
        return OAuth.getRefreshToken();
      }

      // Redirect to `/login` with the `error_reason`.
      return $window.location.href = '/login?error_reason=' + rejection.data.error;
    });
  }]);
```

## API

#### OAuthProvider

Configuration defaults:

```js
OAuthProvider.configure({
  baseUrl: null,
  clientId: null,
  clientSecret: null,
  grantPath: '/oauth2/token',
  revokePath: '/oauth2/revoke'
});
```

#### OAuth

Check authentication status:

```js
/**
 * Verifies if the `user` is authenticated or not based on the `token`
 * cookie.
 *
 * @return {boolean}
 */

OAuth.isAuthenticated();
```

Get an access token:

```js
/**
 * Retrieves the `access_token` and stores the `response.data` on cookies
 * using the `OAuthToken`.
 *
 * @param {object} user - Object with `username` and `password` properties.
 * @param {object} config - Optional configuration object sent to `POST`.
 * @return {promise} A response promise.
 */

OAuth.getAccessToken(user, options);
```

Refresh access token:

```js
/**
 * Retrieves the `refresh_token` and stores the `response.data` on cookies
 * using the `OAuthToken`.
 *
 * @return {promise} A response promise.
 */

OAuth.getRefreshToken()
```

Revoke access token:

```js
/**
 * Revokes the `token` and removes the stored `token` from cookies
 * using the `OAuthToken`.
 *
 * @return {promise} A response promise.
 */

OAuth.revokeToken()
```

**NOTE**: An *event* `oauth:error` will be sent everytime a `responseError` is emitted:

* `{ status: 400, data: { error: 'invalid_request' }`
* `{ status: 400, data: { error: 'invalid_grant' }`
* `{ status: 401, data: { error: 'invalid_token' }`

#### OAuthTokenProvider

`OAuthTokenProvider` uses [angular-cookie](https://github.com/ivpusic/angular-cookie) to store the cookies. Check the [available options](https://github.com/ivpusic/angular-cookie#options).

Configuration defaults:

```js
OAuthTokenProvider.configure({
  name: 'token',
  storage:'cookies' // options: 'cookies', 'localstorage', 'sessionstorage'
  options: {
    secure: true
  }
});
```

## Contributing & Development

#### Contribute

Found a bug or want to suggest something? Take a look first on the current and closed [issues](https://github.com/seegno/angular-oauth2/issues). If it is something new, please [submit an issue](https://github.com/seegno/angular-oauth2/issues/new).

#### Develop

It will be awesome if you can help us evolve `angular-oauth2`. Want to help?

1. [Fork it](https://github.com/seegno/angular-oauth2).
2. `npm install`.
3. `bower install`
4. Do your magic.
5. Run the tests: `gulp test`.
6. Build: `gulp build`
7. Create a [Pull Request](https://github.com/seegno/angular-oauth2/compare).

*The source files are written in ES6.*

## Reference

* http://tools.ietf.org/html/rfc2617
* http://tools.ietf.org/html/rfc6749
* http://tools.ietf.org/html/rfc6750
* https://tools.ietf.org/html/rfc7009
