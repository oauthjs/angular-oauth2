
/**
 * Module dependencies.
 */

var concat = require('gulp-concat');
var gulp = require('gulp');
var header = require('gulp-header');
var jshint = require('gulp-jshint');
var karma = require('karma').server;
var ngAnnotate = require('gulp-ng-annotate');
var pkg = require('./package.json');
var rename = require('gulp-rename');
var to5 = require('gulp-6to5');
var uglify = require('gulp-uglify');
var wrapUmd = require('gulp-wrap-umd');

/**
 * Configuration
 */

var config = {
  name: 'angular-oauth2.js',
  entry: './src/angular-oauth2.js',
  src: ['./src/*.js', './src/**/*.js'],
  dest: './dist',
  umd: {
    namespace: 'angularOAuth2',
    exports: 'ngModule',
    deps: [
      'angular',
      { name: 'query-string', globalName: 'queryString', paramName: 'queryString' }
    ]
  },
  banner: ['/**',
    ' * <%= pkg.name %> - <%= pkg.description %>',
    ' * @version v<%= pkg.version %>',
    ' * @link <%= pkg.homepage %>',
    ' * @license <%= pkg.license %>',
    ' */',
    ''].join('\n')
};

/**
 * Scripts task.
 */

gulp.task('scripts', ['scripts-lint'], function() {
  return gulp.src(config.src)
    .pipe(to5({ modules: 'ignore', blacklist: ['useStrict'] }))
    .pipe(ngAnnotate({ single_quotes: true, add: true }))
    .pipe(concat(config.name))
    .pipe(wrapUmd(config.umd))
    .pipe(uglify({
      mangle: false,
      output: { beautify: true },
      compress: false
    }))
    .pipe(header(config.banner, { pkg: pkg }))
    .pipe(gulp.dest(config.dest));
});

gulp.task('scripts-minify', ['scripts'], function() {
  return gulp.src(config.dest + '/' + config.name)
    .pipe(uglify())
    .pipe(rename(function(path) {
      path.extname = '.min.js';
    }))
    .pipe(gulp.dest(config.dest));
});

gulp.task('scripts-lint', function() {
  return gulp.src(config.src)
    .pipe(jshint())
    .pipe(jshint.reporter('jshint-stylish'))
    .pipe(jshint.reporter('fail'));
});

/**
 * Test task.
 */

gulp.task('test', ['scripts'], function() {
  return karma.start({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function(code) {
    console.log('Karma has exited with code', code);
  });
});

/**
 * Main tasks.
 */

gulp.task('build', ['scripts-minify']);
gulp.task('default', ['test']);
