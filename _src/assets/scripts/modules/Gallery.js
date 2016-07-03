var history = require('../core/history');

exports.selector = '.js-gallery';

exports.constructor = function() {

	var _href,
		_el;

	function init(el) {

		_el = el;
		_href = el.getAttribute('href');

		_el.addEventListener('click', onClick);
	}

	function onClick() {

		
	}

	function destroy() {

		_el.removeEventListener('click', onClick);

		_href = null;
		_el = null;
	}

	this.init = init;
	this.destroy = destroy;
};