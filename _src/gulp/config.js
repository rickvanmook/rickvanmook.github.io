exports.browserify = {
	entries: ['./assets/scripts/main.js'],
	bundleName: 'main.js',
	dest: '../assets/scripts'
};

exports.styles = {
	src: './assets/styles/**/*.scss',
	dest: '../assets/styles'
};

exports.uglify = {
	preserveComments: 'some',
	compress: {
		drop_console: true// eslint-disable-line
	}
};

exports.eslint = ['./gulp/**/*.js', './assets/scripts/**/*.js', '!./assets/scripts/libs/**/*.js'];