var postcss = require('gulp-postcss'),
	autoprefixer = require('autoprefixer'),
	mergeRules = require('postcss-merge-rules'),
	mqpacker = require('css-mqpacker'),

	config = require('../config'),
	gulp = require('gulp'),
	sass = require('gulp-sass'),
	handleErrors = require('../util/handleErrors');

module.exports = function(taskName) {

	gulp.task(taskName, function() {

		var processors = [
				autoprefixer({browsers: ['last 2 versions', '> 1%', 'ie >= 10']}),
				mqpacker,
				mergeRules
			];


		return gulp.src(config.styles.src)
			.pipe(sass({
				outputStyle: global.isProd ? 'compressed' : 'compact'
			}))
			.on('error', handleErrors)
			.pipe(postcss(processors))
			.on('error', handleErrors)
			.pipe(gulp.dest(config.styles.dest));
	});
};