
/**
 * Karma.
 */

module.exports = function(config) {
  config.set({
    basePath: './',
    browsers: ['Chrome'],
    files: [
      'bower_components/angular/angular.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/query-string/query-string.js',
      'node_modules/lodash/dist/lodash.js',
      'node_modules/angular-mocks/angular-mocks.js',
      'dist/angular-oauth2.js',
      'test/mocks/**/*.mock.js',
      'test/unit/**/*.spec.js'
    ],
    frameworks: [
      'browserify',
      'mocha',
      'should',
      'sinon'
    ],
    plugins: [
      'karma-browserify',
      'karma-chrome-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-should',
      'karma-sinon'
    ],
    reporters: ['mocha']
  });
};
