var config = require('../config'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	source = require('vinyl-source-stream'),
	sourcemaps = require('gulp-sourcemaps'),
	buffer = require('vinyl-buffer'),
	streamify = require('gulp-streamify'),
	watchify = require('watchify'),
	browserify = require('browserify'),
	uglify = require('gulp-uglify'),
	browserSync = require('../util/browserSync'),
	handleErrors = require('../util/handleErrors');

/*


 npm i -D brfs
 npm i -D browser-sync
 npm i -D browserify
 npm i -D del
 npm i -D gulp
 npm i -D gulp-autoprefixer
 npm i -D gulp-if
 npm i -D gulp-notify
 npm i -D gulp-rev-all
 npm i -D gulp-rev-delete-original
 npm i -D gulp-sass
 npm i -D gulp-sourcemaps
 npm i -D gulp-streamify
 npm i -D gulp-uglify
 npm i -D run-sequence
 npm i -D vinyl-buffer
 npm i -D vinyl-source-stream
 npm i -D watchify
 npm i -D yargs

 */


function buildScript(file) {

	var bundler = browserify({
		entries: config.browserify.entries,
		debug: true,
		cache: {},
		packageCache: {},
		fullPaths: false
	}, watchify.args);

	if ( !global.isProd ) {
		bundler = watchify(bundler);
		bundler.on('update', function() {
			rebundle();
		});
	}

	var transforms = [
		'brfs'
	];

	transforms.forEach(function(transform) {
		bundler.transform(transform);
	});

	function rebundle() {
		var stream = bundler.bundle();
		var createSourcemap = !global.isProd && config.browserify.sourcemap;

		return stream.on('error', handleErrors)
			.pipe(source(file))
			.pipe(gulpif(createSourcemap, buffer()))
			.pipe(gulpif(createSourcemap, sourcemaps.init()))
			.pipe(gulpif(global.isProd, streamify(uglify(config.uglify))))
			.pipe(gulpif(createSourcemap, sourcemaps.write('./')))
			.pipe(gulp.dest(config.browserify.dest))
			.pipe(gulpif(!global.isProd, browserSync.stream()))
	}

	return rebundle();

}

module.exports = function(taskName) {

	gulp.task(taskName, function() {

		return buildScript(config.browserify.bundleName);

	});
}