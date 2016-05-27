var ajaxRequest = require('../utils/ajaxRequest');

var _doc = document,
	_win = window,
	_contentEl,
	_allLinkEls;

_win.addEventListener('popstate', onPopState);
_contentEl = getContentEl(_doc);
setupPage();

function setupPage() {


	_doc.body.classList.add('is-visible');
	_contentEl.classList.add('is-visible');

	_allLinkEls = _doc.querySelectorAll('a');

	for(var i = 0; i < _allLinkEls.length; i++) {

		_allLinkEls[i].addEventListener('click', onLinkClick);
	}
}

function disposePage() {


	_contentEl.classList.remove('is-visible');

	for(var i = 0; i < _allLinkEls.length; i++) {

		_allLinkEls[i].removeEventListener('click', onLinkClick);
	}

	_allLinkEls = null;
}

function onLinkClick(e) {

	var el = this,
		url = el.getAttribute('href');

	if(!validateExternalUrl(url)) {

		e.preventDefault();

		if(url !== window.location.pathname) {

			pushState(url);
			internalLoad(url);
		}
	}
}

function validateExternalUrl(url) {

	var PATTERN_FOR_EXTERNAL_URLS = /^(\w+:)?\/\//;

	return url !== undefined && url.search(PATTERN_FOR_EXTERNAL_URLS) !== -1;
}

function internalLoad(url) {

	ajaxRequest(url, function(response){

			var parserEl = _doc.createElement('html'),
				parsedContent;

			parserEl.innerHTML = response;

			parsedContent = getContentEl(parserEl).innerHTML;


			disposePage();
			_contentEl.innerHTML = parsedContent;
			setupPage();
		});
}

function getContentEl(parent) {

	return parent.querySelector('.js-content');
}

function pushState(url) {

	_win.history.pushState(
		{ url: url },
		'',
		url
	);
}

function onPopState() {


	internalLoad(_win.location.pathname);
}