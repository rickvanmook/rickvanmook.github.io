var ajaxRequest = require('../utils/ajaxRequest'),
	resizeCanvas = require('../utils/resizeCanvas'),
	signals = require('./signals'),
	moduleFactory = require('./moduleFactory');

var _doc = document,
	_win = window,
	_htmlEl,
	_contentEl,
	_maskEl,
	_pendingClass = false,
	_pendingContent = false,
	_isHiding = false;


function init() {

	_win.addEventListener('popstate', onPopState);

	_maskEl = _doc.querySelector('.mask');
	_htmlEl = _doc.querySelector('html');
	_contentEl = getContentEl(_doc);
	_maskEl.style.opacity = 0;

	_doc.body.classList.add('is-visible');
	_contentEl.classList.add('is-visible');

	moduleFactory.run();
}



function internalLoad(url) {

	signals.HISTORY_CHANGED.dispatch(url);

	if(ga) {
		
		ga('send', {
			hitType: 'pageview',
			page: location.pathname
		});
	}

	hidePage();

	ajaxRequest(url, function(response){

			var parserEl = _doc.createElement('html'),
				contentEl;

			parserEl.innerHTML = response;

			contentEl = getContentEl(parserEl);

			_pendingClass = contentEl.getAttribute('data-class');
			_pendingContent = contentEl.innerHTML;

			showPage();
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

	internalLoad(url);
}

function onPopState() {


	internalLoad(_win.location.pathname);
}

function hidePage() {

	_isHiding = true;

	_maskEl.style.display = 'block';

	tweenMask(1, function() {

			_isHiding = false;
			if(_pendingContent) {

				window.scrollTo(0,0);
				_contentEl.innerHTML = _pendingContent;
				_htmlEl.className = _pendingClass;
				_pendingContent = false;
				//setupPage();


				showPage();
			}
		}
	)
}

function showPage() {

	if(_isHiding) {

		return;
	}

	tweenMask(0, function(){

		_maskEl.style.display = 'none';

		TweenLite.delayedCall(0.15, function(){
			moduleFactory.run(_contentEl);
		})
	});
}

function tweenMask(dest, callback) {

	var ease;

	if(dest > 0) {

		ease = Cubic.easeOut;

	} else {

		ease = Cubic.easeIn;
	}

	TweenLite.to(_maskEl.style, 0.25, {
		opacity: dest,
		ease:ease,
		onComplete: function(){

			callback();
		}
	});
}

exports.init = init;
exports.pushState = pushState;