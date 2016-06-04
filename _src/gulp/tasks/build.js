var gulp = require('gulp'),
	runSequence = require('run-sequence');

module.exports = function(taskName) {

	gulp.task(taskName, function (cb) {

		cb = cb || function (e) {
		};

		var args = ['styles', 'browserify'];

		if (!global.isProd) {

			args.push('watch');
		}

		args.push(cb);

		return runSequence.apply(this, args);
	});
};