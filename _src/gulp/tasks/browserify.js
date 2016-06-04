var config = require('../config'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	source = require('vinyl-source-stream'),
	buffer = require('vinyl-buffer'),
	streamify = require('gulp-streamify'),
	watchify = require('watchify'),
	browserify = require('browserify'),
	uglify = require('gulp-uglify'),
	handleErrors = require('../util/handleErrors');


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

		return stream.on('error', handleErrors)
			.pipe(source(file))
			.pipe(gulpif(global.isProd, streamify(uglify(config.uglify))))
			.pipe(gulp.dest(config.browserify.dest));
	}

	return rebundle();

}

module.exports = function(taskName) {

	gulp.task(taskName, function() {

		return buildScript(config.browserify.bundleName);

	});
}