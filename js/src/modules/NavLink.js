var signals = require('../core/signals'),

	MOUSE_ENTER_EVENT = 'mouseenter',
	MOUSE_LEAVE_EVENT = 'mouseleave';


exports.selector = '.js-navLink';

exports.constructor = function() {

	var _el,
		_path;

	function init(el) {

		_el = el;

		_el.addEventListener(MOUSE_ENTER_EVENT, addHover);
		_path = stripSlashes(_el.getAttribute('href'));

		signals.HISTORY_CHANGED.add(onHistoryChanged);
	}

	function onHistoryChanged() {

		var pathname = stripSlashes(window.location.pathname);

		if(pathname === _path) {

			_el.classList.add('is-active');

		} else {

			_el.classList.remove('is-active');
		}
	}

	function addHover() {

		var currentHoverEl;

		_el.removeEventListener(MOUSE_ENTER_EVENT, addHover);

		currentHoverEl = document.createElement('div');
		currentHoverEl.className = 'nav__link__hover';
		currentHoverEl.tween = {x: -100};

		_el.appendChild(currentHoverEl);
		tweenTo(0);

		_el.addEventListener(MOUSE_LEAVE_EVENT, onMouseOut);

		function onMouseOut(e) {

			tweenTo(100, true);

			_el.addEventListener(MOUSE_ENTER_EVENT, addHover);
			_el.removeEventListener(MOUSE_LEAVE_EVENT, onMouseOut);
		}

		function tweenTo(newX, remove) {

			var distance = (newX - currentHoverEl.tween.x) / 100;

			TweenLite.to(currentHoverEl.tween, 0.35 * distance, {
				x: newX,
				ease: Cubic.easeInOut,
				onUpdate: function() {

					currentHoverEl.style.transform = 'translateX(' + currentHoverEl.tween.x + '%)';
				},
				onComplete: function() {

					if (remove) {

						_el.removeChild(currentHoverEl);
						currentHoverEl = null;
					}
				}
			})
		}
	}

	function stripSlashes(string) {

		return string.replace(/\//g, '');
	}

	this.init = init;
};