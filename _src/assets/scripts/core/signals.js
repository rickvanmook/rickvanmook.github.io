var Signal = require('../libs/signals'),
	resized = new Signal(),
	scrolled = new Signal();

window.addEventListener('resize', resized.dispatch);
document.addEventListener('scroll', scrolled.dispatch);

exports.HISTORY_CHANGED = new Signal();
exports.RESIZED = resized;
exports.SCROLLED = scrolled;