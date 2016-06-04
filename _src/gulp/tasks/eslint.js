// NPM depenedencies
var gulp = require('gulp'),

	// Project dependencies
	eslint = require('gulp-eslint'),
	config = require('../config');


module.exports = function(taskName) {

	gulp.task(taskName, function() {

		return gulp.src(config.eslint)
			.pipe(eslint())
			.pipe(eslint.format());
	});
};

