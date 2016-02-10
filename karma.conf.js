
/**
 * Module dependencies.
 */

var argv = require('yargs').argv;

/**
 * Karma.
 */

module.exports = function(config) {
  config.set({
    basePath: './',
    browsers: [argv.browsers || 'Chrome'],
    files: [
      'node_modules/angular/angular.js',
      'node_modules/angular-cookies/angular-cookies.js',
      'node_modules/query-string/query-string.js',
      'node_modules/lodash/lodash.js',
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
      'karma-firefox-launcher',
      'karma-mocha',
      'karma-mocha-reporter',
      'karma-should',
      'karma-sinon'
    ],
    reporters: ['mocha']
  });
};
