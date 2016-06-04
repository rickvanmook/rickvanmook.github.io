exports.clean = ['../assets/scripts/**', '../../assets/styles/**'];

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
		drop_console: true
	}
};