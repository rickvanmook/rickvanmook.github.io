var config = require('../config'),
	gulp = require('gulp');

module.exports = function(taskName) {

	gulp.task(taskName, function () {

		// There's no watch task for Browserify. It's handling updates with Watchify
		gulp.watch(config.styles.src, ['styles']);
		gulp.watch(config.eslint, ['eslint']);
	});
};