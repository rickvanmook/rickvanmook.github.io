var history = require('../core/history');

exports.selector = 'a';

exports.constructor = function() {

	var _href,
		_el;

	function init(el) {

		_el = el;
		_href = el.getAttribute('href');

		if(!checkIsTargetBlank(el) && !checkIsExternalLink(_href) && !checkIsMailtoLink(_href)) {

			_el.addEventListener('click', onClick);
		}
	}

	function onClick(e) {

		// make sure we can actually open up a new tab
		if(!e.metaKey && !e.ctrlKey) {

			e.preventDefault();

			if(_href !== window.location.pathname) {

				history.pushState(_href);
			}
		}
	}

	function destroy() {

		_el.removeEventListener('click', onClick);

		_href = null;
		_el = null;
	}

	function checkIsMailtoLink(url) {

		return url.indexOf('mailto:') === 0;
	}

	function checkIsTargetBlank(el) {
		
		var target = el.getAttribute('target');
		
		return target === '_blank';
	}
	
	function checkIsExternalLink(url) {

		var PATTERN_FOR_EXTERNAL_URLS = /^(\w+:)?\/\//;

		return url !== undefined && url.search(PATTERN_FOR_EXTERNAL_URLS) !== -1;
	}

	this.init = init;
	this.destroy = destroy;
};