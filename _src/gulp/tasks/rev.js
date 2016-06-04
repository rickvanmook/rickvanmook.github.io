var RevAll = require('gulp-rev-all'),
	gulp = require('gulp'),
	revdel = require('gulp-rev-delete-original');

module.exports = function(taskName) {

	gulp.task(taskName, function(){

		var revAll = new RevAll({ dontRenameFile: [/^\/favicon.ico$/g, /^\/index.html/g] });

		gulp.src('dist/**')
			.pipe(revAll.revision())
			.pipe(revdel())
			.pipe(gulp.dest('dist'));
	});
};


