var history = require('../core/history');

exports.selector = 'a';

exports.constructor = function() {

	var _href,
		_el;

	function init(el) {

		_el = el;
		_href = el.getAttribute('href');

		if(!checkIsExternalUrl(_href)) {

			_el.addEventListener('click', onClick);
		}
	}

	function onClick(e) {

		e.preventDefault();

		if(_href !== window.location.pathname) {

			history.pushState(_href);
		}
	}

	function destroy() {

		_el.removeEventListener('click', onClick);

		_href = null;
		_el = null;
	}


	function checkIsExternalUrl(url) {

		var PATTERN_FOR_EXTERNAL_URLS = /^(\w+:)?\/\//;

		return url !== undefined && url.search(PATTERN_FOR_EXTERNAL_URLS) !== -1;
	}

	this.init = init;
	this.destroy = destroy;
};