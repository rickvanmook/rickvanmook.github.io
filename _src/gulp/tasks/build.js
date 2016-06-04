var gulp = require('gulp'),
	runSequence = require('run-sequence');

module.exports = function(taskName) {

	gulp.task(taskName, function (cb) {

		cb = cb || function() {};

		var args = ['styles', 'browserify'];

		if (!global.isProd) {

			args.push('watch', 'eslint');
		}

		args.push(cb);

		return runSequence.apply(this, args);
	});
};