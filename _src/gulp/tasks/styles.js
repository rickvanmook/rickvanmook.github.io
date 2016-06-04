var postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	mergeRules = require('postcss-merge-rules'),
	mqpacker = require('css-mqpacker'),

	config = require('../config'),
	gulp = require('gulp'),
	gulpif = require('gulp-if'),
	sourcemaps = require('gulp-sourcemaps'),
	sass = require('gulp-sass'),
	handleErrors = require('../util/handleErrors'),
	browserSync = require('../util/browserSync');

module.exports = function(taskName) {

	gulp.task(taskName, function() {

		var processors = [
				autoprefixer({browsers: ['last 2 versions', '> 1%', 'ie >= 10']}),
				mqpacker,
				mergeRules
			];


		return gulp.src(config.styles.src)
			.pipe(sourcemaps.init())
			.pipe(sass({
				sourceComments: !global.isProd,
				sourceMap: 'sass',
				outputStyle: global.isProd ? 'compressed' : 'compact'
			}))
			.on('error', handleErrors)
			.pipe(postcss(processors))
			.on('error', handleErrors)
			.pipe(sourcemaps.write('./'))
			.pipe(gulp.dest(config.styles.dest))
			.pipe(gulpif(!global.isProd, browserSync.stream()))
	});
};