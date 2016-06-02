var history = require('../core/history');

exports.selector = '.js-analytics';

exports.constructor = function() {

	var _el,
		_category,
		_label;

	function init(el) {

		_el = el;
		_category = _el.getAttribute('data-category');
		_label = _el.getAttribute('data-label');

		if(ga) {

			_el.addEventListener('click', onClick);
		}
	}

	function onClick() {

		ga('send', 'event', _category, 'click', _label);
	}

	function destroy() {

		_el.removeEventListener('click', onClick);

		_label = null;
		_category = null;
		_el = null;
	}


	this.init = init;
	this.destroy = destroy;
};