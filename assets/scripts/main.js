(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var ajaxRequest = require('../utils/ajaxRequest'),
	signals = require('./signals'),
	moduleFactory = require('./moduleFactory');

var ANIMATION_TIME = 0.25,

	_doc = document,
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

	if(!_isHiding) {

		hidePage();
	}

	ajaxRequest(url, function(response){

			var parserEl = _doc.createElement('html'),
				contentEl;

			parserEl.innerHTML = response;

			contentEl = getContentEl(parserEl);

			_pendingClass = contentEl.getAttribute('data-class');
			_pendingContent = contentEl.innerHTML;

			if(!_isHiding) {

				setupPage();
			}
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

				setupPage();
			}
		}
	)
}

function setupPage() {

	if(_pendingContent) {

		window.scrollTo(0,0);
		_contentEl.innerHTML = _pendingContent;
		_htmlEl.className = _pendingClass;
		_pendingContent = false;

		showPage();
	}
}

function showPage() {

	if(_isHiding) {

		return;
	}

	tweenMask(0, function(){

		var MODULE_FACTORY_DELAY = 0.15;

		_maskEl.style.display = 'none';

		TweenLite.delayedCall(MODULE_FACTORY_DELAY, function(){

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

	TweenLite.to(_maskEl.style, ANIMATION_TIME, {
		opacity: dest,
		ease:ease,
		onComplete: function(){

			callback();
		}
	});
}

exports.init = init;
exports.pushState = pushState;
},{"../utils/ajaxRequest":10,"./moduleFactory":2,"./signals":3}],2:[function(require,module,exports){
var _moduleConfigs = [
		require('../modules/Analytics'),
		require('../modules/AnyLink'),
		require('../modules/NavLink'),
		require('../modules/Card')
	],
	_currentModules = [];

function run(parentEl) {

	if(!parentEl) {

		parentEl = document;
	}

	destroyModules();

	_currentModules = [];

	createModules(parentEl);
}

function destroyModules() {

	var i;

	for(i = 0; i < _currentModules.length; i++) {

		_currentModules[i].destroy();
	}
}

function createModules(parentEl) {

	_moduleConfigs.forEach(function(config){


		var els = parentEl.querySelectorAll(config.selector),
			module,
			moduleEl,
			i;

		for(i = 0; i < els.length; i++) {

			moduleEl = els[i];

			module = new config.constructor();

			module.init(moduleEl);

			if(!moduleEl.classList.contains('js-moduleIgnore')) {

				_currentModules.push(module);
			}
		}
	});
}

exports.run = run;
},{"../modules/Analytics":6,"../modules/AnyLink":7,"../modules/Card":8,"../modules/NavLink":9}],3:[function(require,module,exports){
var Signal = require('../libs/signals'),
	resized = new Signal(),
	scrolled = new Signal();

window.addEventListener('resize', resized.dispatch);
document.addEventListener('scroll', scrolled.dispatch);

exports.HISTORY_CHANGED = new Signal();
exports.RESIZED = resized;
exports.SCROLLED = scrolled;
},{"../libs/signals":4}],4:[function(require,module,exports){
/*jslint onevar:true, undef:true, newcap:true, regexp:true, bitwise:true, maxerr:50, indent:4, white:false, nomen:false, plusplus:false */
/*global define:false, require:false, exports:false, module:false, signals:false */

/** @license
 * JS Signals <http://millermedeiros.github.com/js-signals/>
 * Released under the MIT license
 * Author: Miller Medeiros
 * Version: 1.0.0 - Build: 268 (2012/11/29 05:48 PM)
 */

(function(global){

    // SignalBinding -------------------------------------------------
    //================================================================

    /**
     * Object that represents a binding between a Signal and a listener function.
     * <br />- <strong>This is an internal constructor and shouldn't be called by regular users.</strong>
     * <br />- inspired by Joa Ebert AS3 SignalBinding and Robert Penner's Slot classes.
     * @author Miller Medeiros
     * @constructor
     * @internal
     * @name SignalBinding
     * @param {Signal} signal Reference to Signal object that listener is currently bound to.
     * @param {Function} listener Handler function bound to the signal.
     * @param {boolean} isOnce If binding should be executed just once.
     * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
     * @param {Number} [priority] The priority level of the event listener. (default = 0).
     */
    function SignalBinding(signal, listener, isOnce, listenerContext, priority) {

        /**
         * Handler function bound to the signal.
         * @type Function
         * @private
         */
        this._listener = listener;

        /**
         * If binding should be executed just once.
         * @type boolean
         * @private
         */
        this._isOnce = isOnce;

        /**
         * Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @memberOf SignalBinding.prototype
         * @name context
         * @type Object|undefined|null
         */
        this.context = listenerContext;

        /**
         * Reference to Signal object that listener is currently bound to.
         * @type Signal
         * @private
         */
        this._signal = signal;

        /**
         * Listener priority
         * @type Number
         * @private
         */
        this._priority = priority || 0;
    }

    SignalBinding.prototype = {

        /**
         * If binding is active and should be executed.
         * @type boolean
         */
        active : true,

        /**
         * Default parameters passed to listener during `Signal.dispatch` and `SignalBinding.execute`. (curried parameters)
         * @type Array|null
         */
        params : null,

        /**
         * Call listener passing arbitrary parameters.
         * <p>If binding was added using `Signal.addOnce()` it will be automatically removed from signal dispatch queue, this method is used internally for the signal dispatch.</p>
         * @param {Array} [paramsArr] Array of parameters that should be passed to the listener
         * @return {*} Value returned by the listener.
         */
        execute : function (paramsArr) {
            var handlerReturn, params;
            if (this.active && !!this._listener) {
                params = this.params? this.params.concat(paramsArr) : paramsArr;
                handlerReturn = this._listener.apply(this.context, params);
                if (this._isOnce) {
                    this.detach();
                }
            }
            return handlerReturn;
        },

        /**
         * Detach binding from signal.
         * - alias to: mySignal.remove(myBinding.getListener());
         * @return {Function|null} Handler function bound to the signal or `null` if binding was previously detached.
         */
        detach : function () {
            return this.isBound()? this._signal.remove(this._listener, this.context) : null;
        },

        /**
         * @return {Boolean} `true` if binding is still bound to the signal and have a listener.
         */
        isBound : function () {
            return (!!this._signal && !!this._listener);
        },

        /**
         * @return {boolean} If SignalBinding will only be executed once.
         */
        isOnce : function () {
            return this._isOnce;
        },

        /**
         * @return {Function} Handler function bound to the signal.
         */
        getListener : function () {
            return this._listener;
        },

        /**
         * @return {Signal} Signal that listener is currently bound to.
         */
        getSignal : function () {
            return this._signal;
        },

        /**
         * Delete instance properties
         * @private
         */
        _destroy : function () {
            delete this._signal;
            delete this._listener;
            delete this.context;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[SignalBinding isOnce:' + this._isOnce +', isBound:'+ this.isBound() +', active:' + this.active + ']';
        }

    };


/*global SignalBinding:false*/

    // Signal --------------------------------------------------------
    //================================================================

    function validateListener(listener, fnName) {
        if (typeof listener !== 'function') {
            throw new Error( 'listener is a required param of {fn}() and should be a Function.'.replace('{fn}', fnName) );
        }
    }

    /**
     * Custom event broadcaster
     * <br />- inspired by Robert Penner's AS3 Signals.
     * @name Signal
     * @author Miller Medeiros
     * @constructor
     */
    function Signal() {
        /**
         * @type Array.<SignalBinding>
         * @private
         */
        this._bindings = [];
        this._prevParams = null;

        // enforce dispatch to aways work on same context (#47)
        var self = this;
        this.dispatch = function(){
            Signal.prototype.dispatch.apply(self, arguments);
        };
    }

    Signal.prototype = {

        /**
         * Signals Version Number
         * @type String
         * @const
         */
        VERSION : '1.0.0',

        /**
         * If Signal should keep record of previously dispatched parameters and
         * automatically execute listener during `add()`/`addOnce()` if Signal was
         * already dispatched before.
         * @type boolean
         */
        memorize : false,

        /**
         * @type boolean
         * @private
         */
        _shouldPropagate : true,

        /**
         * If Signal is active and should broadcast events.
         * <p><strong>IMPORTANT:</strong> Setting this property during a dispatch will only affect the next dispatch, if you want to stop the propagation of a signal use `halt()` instead.</p>
         * @type boolean
         */
        active : true,

        /**
         * @param {Function} listener
         * @param {boolean} isOnce
         * @param {Object} [listenerContext]
         * @param {Number} [priority]
         * @return {SignalBinding}
         * @private
         */
        _registerListener : function (listener, isOnce, listenerContext, priority) {

            var prevIndex = this._indexOfListener(listener, listenerContext),
                binding;

            if (prevIndex !== -1) {
                binding = this._bindings[prevIndex];
                if (binding.isOnce() !== isOnce) {
                    throw new Error('You cannot add'+ (isOnce? '' : 'Once') +'() then add'+ (!isOnce? '' : 'Once') +'() the same listener without removing the relationship first.');
                }
            } else {
                binding = new SignalBinding(this, listener, isOnce, listenerContext, priority);
                this._addBinding(binding);
            }

            if(this.memorize && this._prevParams){
                binding.execute(this._prevParams);
            }

            return binding;
        },

        /**
         * @param {SignalBinding} binding
         * @private
         */
        _addBinding : function (binding) {
            //simplified insertion sort
            var n = this._bindings.length;
            do { --n; } while (this._bindings[n] && binding._priority <= this._bindings[n]._priority);
            this._bindings.splice(n + 1, 0, binding);
        },

        /**
         * @param {Function} listener
         * @return {number}
         * @private
         */
        _indexOfListener : function (listener, context) {
            var n = this._bindings.length,
                cur;
            while (n--) {
                cur = this._bindings[n];
                if (cur._listener === listener && cur.context === context) {
                    return n;
                }
            }
            return -1;
        },

        /**
         * Check if listener was attached to Signal.
         * @param {Function} listener
         * @param {Object} [context]
         * @return {boolean} if Signal has the specified listener.
         */
        has : function (listener, context) {
            return this._indexOfListener(listener, context) !== -1;
        },

        /**
         * Add a listener to the signal.
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        add : function (listener, listenerContext, priority) {
            validateListener(listener, 'add');
            return this._registerListener(listener, false, listenerContext, priority);
        },

        /**
         * Add listener to the signal that should be removed after first execution (will be executed only once).
         * @param {Function} listener Signal handler function.
         * @param {Object} [listenerContext] Context on which listener will be executed (object that should represent the `this` variable inside listener function).
         * @param {Number} [priority] The priority level of the event listener. Listeners with higher priority will be executed before listeners with lower priority. Listeners with same priority level will be executed at the same order as they were added. (default = 0)
         * @return {SignalBinding} An Object representing the binding between the Signal and listener.
         */
        addOnce : function (listener, listenerContext, priority) {
            validateListener(listener, 'addOnce');
            return this._registerListener(listener, true, listenerContext, priority);
        },

        /**
         * Remove a single listener from the dispatch queue.
         * @param {Function} listener Handler function that should be removed.
         * @param {Object} [context] Execution context (since you can add the same handler multiple times if executing in a different context).
         * @return {Function} Listener handler function.
         */
        remove : function (listener, context) {
            validateListener(listener, 'remove');

            var i = this._indexOfListener(listener, context);
            if (i !== -1) {
                this._bindings[i]._destroy(); //no reason to a SignalBinding exist if it isn't attached to a signal
                this._bindings.splice(i, 1);
            }
            return listener;
        },

        /**
         * Remove all listeners from the Signal.
         */
        removeAll : function () {
            var n = this._bindings.length;
            while (n--) {
                this._bindings[n]._destroy();
            }
            this._bindings.length = 0;
        },

        /**
         * @return {number} Number of listeners attached to the Signal.
         */
        getNumListeners : function () {
            return this._bindings.length;
        },

        /**
         * Stop propagation of the event, blocking the dispatch to next listeners on the queue.
         * <p><strong>IMPORTANT:</strong> should be called only during signal dispatch, calling it before/after dispatch won't affect signal broadcast.</p>
         * @see Signal.prototype.disable
         */
        halt : function () {
            this._shouldPropagate = false;
        },

        /**
         * Dispatch/Broadcast Signal to all listeners added to the queue.
         * @param {...*} [params] Parameters that should be passed to each handler.
         */
        dispatch : function (params) {
            if (! this.active) {
                return;
            }

            var paramsArr = Array.prototype.slice.call(arguments),
                n = this._bindings.length,
                bindings;

            if (this.memorize) {
                this._prevParams = paramsArr;
            }

            if (! n) {
                //should come after memorize
                return;
            }

            bindings = this._bindings.slice(); //clone array in case add/remove items during dispatch
            this._shouldPropagate = true; //in case `halt` was called before dispatch or during the previous dispatch.

            //execute all callbacks until end of the list or until a callback returns `false` or stops propagation
            //reverse loop since listeners with higher priority will be added at the end of the list
            do { n--; } while (bindings[n] && this._shouldPropagate && bindings[n].execute(paramsArr) !== false);
        },

        /**
         * Forget memorized arguments.
         * @see Signal.memorize
         */
        forget : function(){
            this._prevParams = null;
        },

        /**
         * Remove all bindings from signal and destroy any reference to external objects (destroy Signal object).
         * <p><strong>IMPORTANT:</strong> calling any method on the signal instance after calling dispose will throw errors.</p>
         */
        dispose : function () {
            this.removeAll();
            delete this._bindings;
            delete this._prevParams;
        },

        /**
         * @return {string} String representation of the object.
         */
        toString : function () {
            return '[Signal active:'+ this.active +' numListeners:'+ this.getNumListeners() +']';
        }

    };


    // Namespace -----------------------------------------------------
    //================================================================

    /**
     * Signals namespace
     * @namespace
     * @name signals
     */
    var signals = Signal;

    /**
     * Custom event broadcaster
     * @see Signal
     */
    // alias for backwards compatibility (see #gh-44)
    signals.Signal = Signal;



    //exports to multiple environments
    if(typeof define === 'function' && define.amd){ //AMD
        define(function () { return signals; });
    } else if (typeof module !== 'undefined' && module.exports){ //node
        module.exports = signals;
    } else { //browser
        //use string because of Google closure compiler ADVANCED_MODE
        /*jslint sub:true */
        global['signals'] = signals;
    }

}(this));

},{}],5:[function(require,module,exports){
var history = require('./core/history');

history.init();


},{"./core/history":1}],6:[function(require,module,exports){
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
},{}],7:[function(require,module,exports){
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
},{"../core/history":1}],8:[function(require,module,exports){
var resizeCanvas = require('../utils/resizeCanvas'),
	signals = require('../core/signals'),
	ANIMATION_TIME = 0.5,
	CLASS_IS_VISIBLE = 'is-visible';

exports.selector = '.js-card';
exports.constructor = function() {

	var _parent,
		_videoSrc,
		_isAlive,
		_isInView,
		_videoEl,
		_sizingEl,
		_canvasEl,
		_context,
		_progress,
		_windowHeight,
		_elementHeight,
		_canvasWidth,
		_canvasHeight,
		_imgUrl,
		_coverUrl,
		_coverEl,
		_imageEl;

	function init(el) {

		_parent = el;

		_sizingEl = el.getElementsByClassName('js-card__size')[0];
		_canvasEl = el.getElementsByClassName('js-card__canvas')[0];
		_imageEl = el.getElementsByClassName('js-card__image')[0];
		_coverEl = el.getElementsByClassName('js-card__cover')[0];
		_context = _canvasEl.getContext('2d');
		_progress = {p:0};
		_videoSrc = _canvasEl.getAttribute('data-mp4');
		_imgUrl = _imageEl.getAttribute('data-src');
		_coverUrl = _coverEl.getAttribute('data-src');

		_isInView = false;
		_windowHeight = window.innerHeight;

		signals.SCROLLED.add(onScroll);
		signals.RESIZED.add(onResize);
		onResize();
		onScroll();
	}

	function onScroll() {

		var scrollTop = window.pageYOffset || document.scrollTop || 0,
			offset = _parent.getBoundingClientRect().top + scrollTop;

		if(_windowHeight + scrollTop > offset && scrollTop < offset + _elementHeight) {

			inView();
		}
	}

	function destroy() {

		_isAlive = false;

		TweenLite.killTweensOf(_progress);

		_videoEl = null;
		_sizingEl = null;
		_canvasEl = null;
		_imageEl = null;
		_coverEl = null;

		_parent.removeEventListener('mouseenter', onMouseOver);
		_parent.removeEventListener('mouseleave', onMouseOut);
		_parent.removeEventListener('mouseenter', onMouseOver);
		_parent.removeEventListener('mouseleave', onMouseOut);

		signals.RESIZED.remove(onResize);
		signals.SCROLLED.remove(onScroll);
	}

	function onMouseOver() {

		if(!_videoEl) {

			setupVideo();
		}

		_isAlive = true;
		redraw();

		_videoEl.play();

		TweenLite.to(_progress, ANIMATION_TIME, {
			p:1,
			ease: Cubic.easeInOut
		})
	}

	function onMouseOut() {

		TweenLite.to(_progress, ANIMATION_TIME, {
			p:0,
			ease: Cubic.easeInOut,
			onComplete:function(){

				_videoEl.pause();
				_videoEl.currentTime = 0;
				_isAlive = false;
			}
		})
	}


	function inView() {

		_isInView = true;
		_parent.classList.add(CLASS_IS_VISIBLE);

		loadImage();
		redraw();

		_parent.addEventListener('touchstart', onTouchStart);
		_parent.addEventListener('touchend', onTouchEnd);
		_parent.addEventListener('mouseenter', onMouseOver);
		_parent.addEventListener('mouseleave', onMouseOut);

		signals.SCROLLED.remove(onScroll);
	}

	function onTouchStart() {

		_parent.removeEventListener('mouseenter', onMouseOver);
		_parent.removeEventListener('mouseleave', onMouseOut);
	}

	function onTouchEnd() {

		_parent.addEventListener('mouseenter', onMouseOver);
		_parent.addEventListener('mouseleave', onMouseOut);
	}

	function loadImage() {

		_imageEl.onload = onLoaded;
		_imageEl.src = _imgUrl;

		function onLoaded() {

			_imageEl.classList.add(CLASS_IS_VISIBLE);
		}
	}

	function setupVideo() {

		_videoEl = document.createElement('video');
		_videoEl.loop = true;
		_videoEl.src = _videoSrc;

		_coverEl.src = _coverUrl;
	}



	function redraw() {

		_context.clearRect(0, 0, _canvasWidth, _canvasHeight);

		if(_progress.p > 0) {

			drawMask(_progress.p);
		}

		if(_isAlive) {

			requestAnimationFrame(redraw);
		}
	}


	function drawMask(progress) {

		var firstHalfProgress = Math.min(1, progress * 2),
			secondHalfProgress = Math.max(0, (progress - 0.5) * 2);// eslint-disable-line

		if(!_coverEl || !_videoEl) {
			
			return;
		}

		_context.save();

		_context.beginPath();

		// start at bottom left
		_context.moveTo(0, _canvasHeight);

		// absolute line to bottom right, based on firstHalfProgress
		lineTo(Math.round(_canvasWidth * firstHalfProgress), _canvasHeight);

		// if we passed the first half, we draw two additional lines trying to fill up the screen
		if(secondHalfProgress) {

			lineTo(_canvasWidth, Math.round(_canvasHeight * (1 - secondHalfProgress)));
			lineTo(Math.round(_canvasWidth * secondHalfProgress), 0);
		}



		// absolute line back to top left, based on firstHalfProgress
		lineTo(0, Math.round(_canvasHeight * (1 - firstHalfProgress)));

		// close up our path
		_context.closePath();

		_context.clip();

		_context.drawImage(_coverEl, 0, 0, _canvasWidth, _canvasHeight);
		_context.drawImage(_videoEl, 0, 0, _canvasWidth, _canvasHeight);


		_context.restore();

		function lineTo(x, y) {

			_context.lineTo(x, y);
		}
	}

	function onResize() {

		_windowHeight = window.innerHeight;
		_canvasWidth = _sizingEl.offsetWidth;
		_canvasHeight = _sizingEl.offsetHeight;

		_imageEl.setAttribute('width', _canvasWidth);
		_imageEl.setAttribute('height', _canvasHeight);

		_coverEl.setAttribute('width', _canvasWidth);
		_coverEl.setAttribute('height', _canvasHeight);

		_elementHeight = _parent.offsetHeight;

		resizeCanvas(_canvasEl, _canvasWidth, _canvasHeight);

		if(!_isAlive) {

			redraw();
		}

		if(!_isInView) {

			onScroll();
		}
	}

	this.init = init;
	this.destroy = destroy;
};
},{"../core/signals":3,"../utils/resizeCanvas":11}],9:[function(require,module,exports){
var signals = require('../core/signals'),

	MOUSE_ENTER_EVENT = 'mouseenter',
	MOUSE_LEAVE_EVENT = 'mouseleave';


exports.selector = '.js-navLink';

exports.constructor = function() {

	var _el,
		_path;

	function init(el) {

		_el = el;

		_el.addEventListener('touchstart', onTouchStart);
		_el.addEventListener('touchend', onTouchEnd);
		_el.addEventListener(MOUSE_ENTER_EVENT, addHover);
		_path = stripSlashes(_el.getAttribute('href'));

		signals.HISTORY_CHANGED.add(onHistoryChanged);
	}

	function onTouchStart() {

		_el.removeEventListener(MOUSE_ENTER_EVENT, addHover);
	}

	function onTouchEnd() {

		_el.addEventListener(MOUSE_ENTER_EVENT, addHover);
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

		function onMouseOut() {

			tweenTo(100, true);

			_el.addEventListener(MOUSE_ENTER_EVENT, addHover);
			_el.removeEventListener(MOUSE_LEAVE_EVENT, onMouseOut);
		}

		function tweenTo(newX, remove) {

			var distance = (newX - currentHoverEl.tween.x) / 100,
				MAX_ANIMATION_TIME = 0.35;

			TweenLite.to(currentHoverEl.tween, MAX_ANIMATION_TIME * distance, {
				x: newX,
				ease: Cubic.easeInOut,
				onUpdate: function() {

					var transform = 'translateX(' + currentHoverEl.tween.x + '%)';

					currentHoverEl.style.msProperty = transform;
					currentHoverEl.style.webkitTransform = transform;
					currentHoverEl.style.transform = transform;
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
},{"../core/signals":3}],10:[function(require,module,exports){
var STATUS_OK= 200,
	READY_STATE_DONE = 4;

module.exports = function(url, callback, settings) {

	if (!settings) {
		settings = {};
	}

	var request = new XMLHttpRequest(),
		method = settings.method || 'GET';


	// needs to be open before responseType is set
	request.open(method, url, true);

	if (settings.responseType) {
		request.responseType = settings.responseType;
	}

	request.onreadystatechange = function() {

		var response;

		if (request.readyState === READY_STATE_DONE) {

			if (request.status === STATUS_OK) {

				response = request.response;

				callback(response);

			} else {

				console.error(request);
			}
		}
	};

	if (settings.params) {
		request.setRequestHeader('Content-length', settings.params.length);
	}

	request.send(settings.params);
};

},{}],11:[function(require,module,exports){
var DEVICE_PIXEL_RATIO = window.devicePixelRatio || 1,
	_backingStoreRatio,
	_canvasPixelRatio,
	context = document.createElement('canvas').getContext('2d');

_backingStoreRatio = getBackingStoreRatio(context);
_canvasPixelRatio = DEVICE_PIXEL_RATIO / _backingStoreRatio;

function getBackingStoreRatio(context) {// eslint-disable-line

	return context.webkitBackingStorePixelRatio ||
		context.mozBackingStorePixelRatio ||
		context.msBackingStorePixelRatio ||
		context.oBackingStorePixelRatio ||
		context.backingStorePixelRatio || 1;
}

module.exports = function(canvasEl, width, height) {

	var oldWidth,
		oldHeight,
		context = canvasEl.getContext('2d');

	canvasEl.width = width;
	canvasEl.height = height;

	if(DEVICE_PIXEL_RATIO !== _backingStoreRatio) {

		oldWidth = canvasEl.width;
		oldHeight = canvasEl.height;

		canvasEl.width = oldWidth * _canvasPixelRatio;
		canvasEl.height = oldHeight * _canvasPixelRatio;

		canvasEl.style.width = oldWidth + 'px';
		canvasEl.style.height = oldHeight + 'px';

		context.scale(_canvasPixelRatio, _canvasPixelRatio);
	}
};
},{}]},{},[5])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJhc3NldHMvc2NyaXB0cy9jb3JlL2hpc3RvcnkuanMiLCJhc3NldHMvc2NyaXB0cy9jb3JlL21vZHVsZUZhY3RvcnkuanMiLCJhc3NldHMvc2NyaXB0cy9jb3JlL3NpZ25hbHMuanMiLCJhc3NldHMvc2NyaXB0cy9saWJzL3NpZ25hbHMuanMiLCJhc3NldHMvc2NyaXB0cy9tYWluLmpzIiwiYXNzZXRzL3NjcmlwdHMvbW9kdWxlcy9BbmFseXRpY3MuanMiLCJhc3NldHMvc2NyaXB0cy9tb2R1bGVzL0FueUxpbmsuanMiLCJhc3NldHMvc2NyaXB0cy9tb2R1bGVzL0NhcmQuanMiLCJhc3NldHMvc2NyaXB0cy9tb2R1bGVzL05hdkxpbmsuanMiLCJhc3NldHMvc2NyaXB0cy91dGlscy9hamF4UmVxdWVzdC5qcyIsImFzc2V0cy9zY3JpcHRzL3V0aWxzL3Jlc2l6ZUNhbnZhcy5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN2JBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDSkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2xRQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFHQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM3Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwidmFyIGFqYXhSZXF1ZXN0ID0gcmVxdWlyZSgnLi4vdXRpbHMvYWpheFJlcXVlc3QnKSxcblx0c2lnbmFscyA9IHJlcXVpcmUoJy4vc2lnbmFscycpLFxuXHRtb2R1bGVGYWN0b3J5ID0gcmVxdWlyZSgnLi9tb2R1bGVGYWN0b3J5Jyk7XG5cbnZhciBBTklNQVRJT05fVElNRSA9IDAuMjUsXG5cblx0X2RvYyA9IGRvY3VtZW50LFxuXHRfd2luID0gd2luZG93LFxuXHRfaHRtbEVsLFxuXHRfY29udGVudEVsLFxuXHRfbWFza0VsLFxuXHRfcGVuZGluZ0NsYXNzID0gZmFsc2UsXG5cdF9wZW5kaW5nQ29udGVudCA9IGZhbHNlLFxuXHRfaXNIaWRpbmcgPSBmYWxzZTtcblxuXG5mdW5jdGlvbiBpbml0KCkge1xuXG5cdF93aW4uYWRkRXZlbnRMaXN0ZW5lcigncG9wc3RhdGUnLCBvblBvcFN0YXRlKTtcblxuXHRfbWFza0VsID0gX2RvYy5xdWVyeVNlbGVjdG9yKCcubWFzaycpO1xuXHRfaHRtbEVsID0gX2RvYy5xdWVyeVNlbGVjdG9yKCdodG1sJyk7XG5cdF9jb250ZW50RWwgPSBnZXRDb250ZW50RWwoX2RvYyk7XG5cdF9tYXNrRWwuc3R5bGUub3BhY2l0eSA9IDA7XG5cblx0X2RvYy5ib2R5LmNsYXNzTGlzdC5hZGQoJ2lzLXZpc2libGUnKTtcblx0X2NvbnRlbnRFbC5jbGFzc0xpc3QuYWRkKCdpcy12aXNpYmxlJyk7XG5cblx0bW9kdWxlRmFjdG9yeS5ydW4oKTtcbn1cblxuXG5cbmZ1bmN0aW9uIGludGVybmFsTG9hZCh1cmwpIHtcblxuXHRzaWduYWxzLkhJU1RPUllfQ0hBTkdFRC5kaXNwYXRjaCh1cmwpO1xuXG5cdGlmKGdhKSB7XG5cdFx0XG5cdFx0Z2EoJ3NlbmQnLCB7XG5cdFx0XHRoaXRUeXBlOiAncGFnZXZpZXcnLFxuXHRcdFx0cGFnZTogbG9jYXRpb24ucGF0aG5hbWVcblx0XHR9KTtcblx0fVxuXG5cdGlmKCFfaXNIaWRpbmcpIHtcblxuXHRcdGhpZGVQYWdlKCk7XG5cdH1cblxuXHRhamF4UmVxdWVzdCh1cmwsIGZ1bmN0aW9uKHJlc3BvbnNlKXtcblxuXHRcdFx0dmFyIHBhcnNlckVsID0gX2RvYy5jcmVhdGVFbGVtZW50KCdodG1sJyksXG5cdFx0XHRcdGNvbnRlbnRFbDtcblxuXHRcdFx0cGFyc2VyRWwuaW5uZXJIVE1MID0gcmVzcG9uc2U7XG5cblx0XHRcdGNvbnRlbnRFbCA9IGdldENvbnRlbnRFbChwYXJzZXJFbCk7XG5cblx0XHRcdF9wZW5kaW5nQ2xhc3MgPSBjb250ZW50RWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNsYXNzJyk7XG5cdFx0XHRfcGVuZGluZ0NvbnRlbnQgPSBjb250ZW50RWwuaW5uZXJIVE1MO1xuXG5cdFx0XHRpZighX2lzSGlkaW5nKSB7XG5cblx0XHRcdFx0c2V0dXBQYWdlKCk7XG5cdFx0XHR9XG5cdFx0fSk7XG59XG5cbmZ1bmN0aW9uIGdldENvbnRlbnRFbChwYXJlbnQpIHtcblxuXHRyZXR1cm4gcGFyZW50LnF1ZXJ5U2VsZWN0b3IoJy5qcy1jb250ZW50Jyk7XG59XG5cbmZ1bmN0aW9uIHB1c2hTdGF0ZSh1cmwpIHtcblxuXHRfd2luLmhpc3RvcnkucHVzaFN0YXRlKFxuXHRcdHsgdXJsOiB1cmwgfSxcblx0XHQnJyxcblx0XHR1cmxcblx0KTtcblxuXHRpbnRlcm5hbExvYWQodXJsKTtcbn1cblxuZnVuY3Rpb24gb25Qb3BTdGF0ZSgpIHtcblxuXG5cdGludGVybmFsTG9hZChfd2luLmxvY2F0aW9uLnBhdGhuYW1lKTtcbn1cblxuZnVuY3Rpb24gaGlkZVBhZ2UoKSB7XG5cblx0X2lzSGlkaW5nID0gdHJ1ZTtcblxuXHRfbWFza0VsLnN0eWxlLmRpc3BsYXkgPSAnYmxvY2snO1xuXG5cdHR3ZWVuTWFzaygxLCBmdW5jdGlvbigpIHtcblxuXHRcdFx0X2lzSGlkaW5nID0gZmFsc2U7XG5cblx0XHRcdGlmKF9wZW5kaW5nQ29udGVudCkge1xuXG5cdFx0XHRcdHNldHVwUGFnZSgpO1xuXHRcdFx0fVxuXHRcdH1cblx0KVxufVxuXG5mdW5jdGlvbiBzZXR1cFBhZ2UoKSB7XG5cblx0aWYoX3BlbmRpbmdDb250ZW50KSB7XG5cblx0XHR3aW5kb3cuc2Nyb2xsVG8oMCwwKTtcblx0XHRfY29udGVudEVsLmlubmVySFRNTCA9IF9wZW5kaW5nQ29udGVudDtcblx0XHRfaHRtbEVsLmNsYXNzTmFtZSA9IF9wZW5kaW5nQ2xhc3M7XG5cdFx0X3BlbmRpbmdDb250ZW50ID0gZmFsc2U7XG5cblx0XHRzaG93UGFnZSgpO1xuXHR9XG59XG5cbmZ1bmN0aW9uIHNob3dQYWdlKCkge1xuXG5cdGlmKF9pc0hpZGluZykge1xuXG5cdFx0cmV0dXJuO1xuXHR9XG5cblx0dHdlZW5NYXNrKDAsIGZ1bmN0aW9uKCl7XG5cblx0XHR2YXIgTU9EVUxFX0ZBQ1RPUllfREVMQVkgPSAwLjE1O1xuXG5cdFx0X21hc2tFbC5zdHlsZS5kaXNwbGF5ID0gJ25vbmUnO1xuXG5cdFx0VHdlZW5MaXRlLmRlbGF5ZWRDYWxsKE1PRFVMRV9GQUNUT1JZX0RFTEFZLCBmdW5jdGlvbigpe1xuXG5cdFx0XHRtb2R1bGVGYWN0b3J5LnJ1bihfY29udGVudEVsKTtcblx0XHR9KVxuXHR9KTtcbn1cblxuZnVuY3Rpb24gdHdlZW5NYXNrKGRlc3QsIGNhbGxiYWNrKSB7XG5cblx0dmFyIGVhc2U7XG5cblx0aWYoZGVzdCA+IDApIHtcblxuXHRcdGVhc2UgPSBDdWJpYy5lYXNlT3V0O1xuXG5cdH0gZWxzZSB7XG5cblx0XHRlYXNlID0gQ3ViaWMuZWFzZUluO1xuXHR9XG5cblx0VHdlZW5MaXRlLnRvKF9tYXNrRWwuc3R5bGUsIEFOSU1BVElPTl9USU1FLCB7XG5cdFx0b3BhY2l0eTogZGVzdCxcblx0XHRlYXNlOmVhc2UsXG5cdFx0b25Db21wbGV0ZTogZnVuY3Rpb24oKXtcblxuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9XG5cdH0pO1xufVxuXG5leHBvcnRzLmluaXQgPSBpbml0O1xuZXhwb3J0cy5wdXNoU3RhdGUgPSBwdXNoU3RhdGU7IiwidmFyIF9tb2R1bGVDb25maWdzID0gW1xuXHRcdHJlcXVpcmUoJy4uL21vZHVsZXMvQW5hbHl0aWNzJyksXG5cdFx0cmVxdWlyZSgnLi4vbW9kdWxlcy9BbnlMaW5rJyksXG5cdFx0cmVxdWlyZSgnLi4vbW9kdWxlcy9OYXZMaW5rJyksXG5cdFx0cmVxdWlyZSgnLi4vbW9kdWxlcy9DYXJkJylcblx0XSxcblx0X2N1cnJlbnRNb2R1bGVzID0gW107XG5cbmZ1bmN0aW9uIHJ1bihwYXJlbnRFbCkge1xuXG5cdGlmKCFwYXJlbnRFbCkge1xuXG5cdFx0cGFyZW50RWwgPSBkb2N1bWVudDtcblx0fVxuXG5cdGRlc3Ryb3lNb2R1bGVzKCk7XG5cblx0X2N1cnJlbnRNb2R1bGVzID0gW107XG5cblx0Y3JlYXRlTW9kdWxlcyhwYXJlbnRFbCk7XG59XG5cbmZ1bmN0aW9uIGRlc3Ryb3lNb2R1bGVzKCkge1xuXG5cdHZhciBpO1xuXG5cdGZvcihpID0gMDsgaSA8IF9jdXJyZW50TW9kdWxlcy5sZW5ndGg7IGkrKykge1xuXG5cdFx0X2N1cnJlbnRNb2R1bGVzW2ldLmRlc3Ryb3koKTtcblx0fVxufVxuXG5mdW5jdGlvbiBjcmVhdGVNb2R1bGVzKHBhcmVudEVsKSB7XG5cblx0X21vZHVsZUNvbmZpZ3MuZm9yRWFjaChmdW5jdGlvbihjb25maWcpe1xuXG5cblx0XHR2YXIgZWxzID0gcGFyZW50RWwucXVlcnlTZWxlY3RvckFsbChjb25maWcuc2VsZWN0b3IpLFxuXHRcdFx0bW9kdWxlLFxuXHRcdFx0bW9kdWxlRWwsXG5cdFx0XHRpO1xuXG5cdFx0Zm9yKGkgPSAwOyBpIDwgZWxzLmxlbmd0aDsgaSsrKSB7XG5cblx0XHRcdG1vZHVsZUVsID0gZWxzW2ldO1xuXG5cdFx0XHRtb2R1bGUgPSBuZXcgY29uZmlnLmNvbnN0cnVjdG9yKCk7XG5cblx0XHRcdG1vZHVsZS5pbml0KG1vZHVsZUVsKTtcblxuXHRcdFx0aWYoIW1vZHVsZUVsLmNsYXNzTGlzdC5jb250YWlucygnanMtbW9kdWxlSWdub3JlJykpIHtcblxuXHRcdFx0XHRfY3VycmVudE1vZHVsZXMucHVzaChtb2R1bGUpO1xuXHRcdFx0fVxuXHRcdH1cblx0fSk7XG59XG5cbmV4cG9ydHMucnVuID0gcnVuOyIsInZhciBTaWduYWwgPSByZXF1aXJlKCcuLi9saWJzL3NpZ25hbHMnKSxcblx0cmVzaXplZCA9IG5ldyBTaWduYWwoKSxcblx0c2Nyb2xsZWQgPSBuZXcgU2lnbmFsKCk7XG5cbndpbmRvdy5hZGRFdmVudExpc3RlbmVyKCdyZXNpemUnLCByZXNpemVkLmRpc3BhdGNoKTtcbmRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3Njcm9sbCcsIHNjcm9sbGVkLmRpc3BhdGNoKTtcblxuZXhwb3J0cy5ISVNUT1JZX0NIQU5HRUQgPSBuZXcgU2lnbmFsKCk7XG5leHBvcnRzLlJFU0laRUQgPSByZXNpemVkO1xuZXhwb3J0cy5TQ1JPTExFRCA9IHNjcm9sbGVkOyIsIi8qanNsaW50IG9uZXZhcjp0cnVlLCB1bmRlZjp0cnVlLCBuZXdjYXA6dHJ1ZSwgcmVnZXhwOnRydWUsIGJpdHdpc2U6dHJ1ZSwgbWF4ZXJyOjUwLCBpbmRlbnQ6NCwgd2hpdGU6ZmFsc2UsIG5vbWVuOmZhbHNlLCBwbHVzcGx1czpmYWxzZSAqL1xuLypnbG9iYWwgZGVmaW5lOmZhbHNlLCByZXF1aXJlOmZhbHNlLCBleHBvcnRzOmZhbHNlLCBtb2R1bGU6ZmFsc2UsIHNpZ25hbHM6ZmFsc2UgKi9cblxuLyoqIEBsaWNlbnNlXG4gKiBKUyBTaWduYWxzIDxodHRwOi8vbWlsbGVybWVkZWlyb3MuZ2l0aHViLmNvbS9qcy1zaWduYWxzLz5cbiAqIFJlbGVhc2VkIHVuZGVyIHRoZSBNSVQgbGljZW5zZVxuICogQXV0aG9yOiBNaWxsZXIgTWVkZWlyb3NcbiAqIFZlcnNpb246IDEuMC4wIC0gQnVpbGQ6IDI2OCAoMjAxMi8xMS8yOSAwNTo0OCBQTSlcbiAqL1xuXG4oZnVuY3Rpb24oZ2xvYmFsKXtcblxuICAgIC8vIFNpZ25hbEJpbmRpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgLyoqXG4gICAgICogT2JqZWN0IHRoYXQgcmVwcmVzZW50cyBhIGJpbmRpbmcgYmV0d2VlbiBhIFNpZ25hbCBhbmQgYSBsaXN0ZW5lciBmdW5jdGlvbi5cbiAgICAgKiA8YnIgLz4tIDxzdHJvbmc+VGhpcyBpcyBhbiBpbnRlcm5hbCBjb25zdHJ1Y3RvciBhbmQgc2hvdWxkbid0IGJlIGNhbGxlZCBieSByZWd1bGFyIHVzZXJzLjwvc3Ryb25nPlxuICAgICAqIDxiciAvPi0gaW5zcGlyZWQgYnkgSm9hIEViZXJ0IEFTMyBTaWduYWxCaW5kaW5nIGFuZCBSb2JlcnQgUGVubmVyJ3MgU2xvdCBjbGFzc2VzLlxuICAgICAqIEBhdXRob3IgTWlsbGVyIE1lZGVpcm9zXG4gICAgICogQGNvbnN0cnVjdG9yXG4gICAgICogQGludGVybmFsXG4gICAgICogQG5hbWUgU2lnbmFsQmluZGluZ1xuICAgICAqIEBwYXJhbSB7U2lnbmFsfSBzaWduYWwgUmVmZXJlbmNlIHRvIFNpZ25hbCBvYmplY3QgdGhhdCBsaXN0ZW5lciBpcyBjdXJyZW50bHkgYm91bmQgdG8uXG4gICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgSGFuZGxlciBmdW5jdGlvbiBib3VuZCB0byB0aGUgc2lnbmFsLlxuICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNPbmNlIElmIGJpbmRpbmcgc2hvdWxkIGJlIGV4ZWN1dGVkIGp1c3Qgb25jZS5cbiAgICAgKiBAcGFyYW0ge09iamVjdH0gW2xpc3RlbmVyQ29udGV4dF0gQ29udGV4dCBvbiB3aGljaCBsaXN0ZW5lciB3aWxsIGJlIGV4ZWN1dGVkIChvYmplY3QgdGhhdCBzaG91bGQgcmVwcmVzZW50IHRoZSBgdGhpc2AgdmFyaWFibGUgaW5zaWRlIGxpc3RlbmVyIGZ1bmN0aW9uKS5cbiAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ByaW9yaXR5XSBUaGUgcHJpb3JpdHkgbGV2ZWwgb2YgdGhlIGV2ZW50IGxpc3RlbmVyLiAoZGVmYXVsdCA9IDApLlxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFNpZ25hbEJpbmRpbmcoc2lnbmFsLCBsaXN0ZW5lciwgaXNPbmNlLCBsaXN0ZW5lckNvbnRleHQsIHByaW9yaXR5KSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEhhbmRsZXIgZnVuY3Rpb24gYm91bmQgdG8gdGhlIHNpZ25hbC5cbiAgICAgICAgICogQHR5cGUgRnVuY3Rpb25cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX2xpc3RlbmVyID0gbGlzdGVuZXI7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIGJpbmRpbmcgc2hvdWxkIGJlIGV4ZWN1dGVkIGp1c3Qgb25jZS5cbiAgICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5faXNPbmNlID0gaXNPbmNlO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDb250ZXh0IG9uIHdoaWNoIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgKG9iamVjdCB0aGF0IHNob3VsZCByZXByZXNlbnQgdGhlIGB0aGlzYCB2YXJpYWJsZSBpbnNpZGUgbGlzdGVuZXIgZnVuY3Rpb24pLlxuICAgICAgICAgKiBAbWVtYmVyT2YgU2lnbmFsQmluZGluZy5wcm90b3R5cGVcbiAgICAgICAgICogQG5hbWUgY29udGV4dFxuICAgICAgICAgKiBAdHlwZSBPYmplY3R8dW5kZWZpbmVkfG51bGxcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuY29udGV4dCA9IGxpc3RlbmVyQ29udGV4dDtcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVmZXJlbmNlIHRvIFNpZ25hbCBvYmplY3QgdGhhdCBsaXN0ZW5lciBpcyBjdXJyZW50bHkgYm91bmQgdG8uXG4gICAgICAgICAqIEB0eXBlIFNpZ25hbFxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fc2lnbmFsID0gc2lnbmFsO1xuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBMaXN0ZW5lciBwcmlvcml0eVxuICAgICAgICAgKiBAdHlwZSBOdW1iZXJcbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIHRoaXMuX3ByaW9yaXR5ID0gcHJpb3JpdHkgfHwgMDtcbiAgICB9XG5cbiAgICBTaWduYWxCaW5kaW5nLnByb3RvdHlwZSA9IHtcblxuICAgICAgICAvKipcbiAgICAgICAgICogSWYgYmluZGluZyBpcyBhY3RpdmUgYW5kIHNob3VsZCBiZSBleGVjdXRlZC5cbiAgICAgICAgICogQHR5cGUgYm9vbGVhblxuICAgICAgICAgKi9cbiAgICAgICAgYWN0aXZlIDogdHJ1ZSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRGVmYXVsdCBwYXJhbWV0ZXJzIHBhc3NlZCB0byBsaXN0ZW5lciBkdXJpbmcgYFNpZ25hbC5kaXNwYXRjaGAgYW5kIGBTaWduYWxCaW5kaW5nLmV4ZWN1dGVgLiAoY3VycmllZCBwYXJhbWV0ZXJzKVxuICAgICAgICAgKiBAdHlwZSBBcnJheXxudWxsXG4gICAgICAgICAqL1xuICAgICAgICBwYXJhbXMgOiBudWxsLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBDYWxsIGxpc3RlbmVyIHBhc3NpbmcgYXJiaXRyYXJ5IHBhcmFtZXRlcnMuXG4gICAgICAgICAqIDxwPklmIGJpbmRpbmcgd2FzIGFkZGVkIHVzaW5nIGBTaWduYWwuYWRkT25jZSgpYCBpdCB3aWxsIGJlIGF1dG9tYXRpY2FsbHkgcmVtb3ZlZCBmcm9tIHNpZ25hbCBkaXNwYXRjaCBxdWV1ZSwgdGhpcyBtZXRob2QgaXMgdXNlZCBpbnRlcm5hbGx5IGZvciB0aGUgc2lnbmFsIGRpc3BhdGNoLjwvcD5cbiAgICAgICAgICogQHBhcmFtIHtBcnJheX0gW3BhcmFtc0Fycl0gQXJyYXkgb2YgcGFyYW1ldGVycyB0aGF0IHNob3VsZCBiZSBwYXNzZWQgdG8gdGhlIGxpc3RlbmVyXG4gICAgICAgICAqIEByZXR1cm4geyp9IFZhbHVlIHJldHVybmVkIGJ5IHRoZSBsaXN0ZW5lci5cbiAgICAgICAgICovXG4gICAgICAgIGV4ZWN1dGUgOiBmdW5jdGlvbiAocGFyYW1zQXJyKSB7XG4gICAgICAgICAgICB2YXIgaGFuZGxlclJldHVybiwgcGFyYW1zO1xuICAgICAgICAgICAgaWYgKHRoaXMuYWN0aXZlICYmICEhdGhpcy5fbGlzdGVuZXIpIHtcbiAgICAgICAgICAgICAgICBwYXJhbXMgPSB0aGlzLnBhcmFtcz8gdGhpcy5wYXJhbXMuY29uY2F0KHBhcmFtc0FycikgOiBwYXJhbXNBcnI7XG4gICAgICAgICAgICAgICAgaGFuZGxlclJldHVybiA9IHRoaXMuX2xpc3RlbmVyLmFwcGx5KHRoaXMuY29udGV4dCwgcGFyYW1zKTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNPbmNlKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGV0YWNoKCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGhhbmRsZXJSZXR1cm47XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIERldGFjaCBiaW5kaW5nIGZyb20gc2lnbmFsLlxuICAgICAgICAgKiAtIGFsaWFzIHRvOiBteVNpZ25hbC5yZW1vdmUobXlCaW5kaW5nLmdldExpc3RlbmVyKCkpO1xuICAgICAgICAgKiBAcmV0dXJuIHtGdW5jdGlvbnxudWxsfSBIYW5kbGVyIGZ1bmN0aW9uIGJvdW5kIHRvIHRoZSBzaWduYWwgb3IgYG51bGxgIGlmIGJpbmRpbmcgd2FzIHByZXZpb3VzbHkgZGV0YWNoZWQuXG4gICAgICAgICAqL1xuICAgICAgICBkZXRhY2ggOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5pc0JvdW5kKCk/IHRoaXMuX3NpZ25hbC5yZW1vdmUodGhpcy5fbGlzdGVuZXIsIHRoaXMuY29udGV4dCkgOiBudWxsO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcmV0dXJuIHtCb29sZWFufSBgdHJ1ZWAgaWYgYmluZGluZyBpcyBzdGlsbCBib3VuZCB0byB0aGUgc2lnbmFsIGFuZCBoYXZlIGEgbGlzdGVuZXIuXG4gICAgICAgICAqL1xuICAgICAgICBpc0JvdW5kIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICghIXRoaXMuX3NpZ25hbCAmJiAhIXRoaXMuX2xpc3RlbmVyKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7Ym9vbGVhbn0gSWYgU2lnbmFsQmluZGluZyB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb25jZS5cbiAgICAgICAgICovXG4gICAgICAgIGlzT25jZSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pc09uY2U7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBIYW5kbGVyIGZ1bmN0aW9uIGJvdW5kIHRvIHRoZSBzaWduYWwuXG4gICAgICAgICAqL1xuICAgICAgICBnZXRMaXN0ZW5lciA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9saXN0ZW5lcjtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7U2lnbmFsfSBTaWduYWwgdGhhdCBsaXN0ZW5lciBpcyBjdXJyZW50bHkgYm91bmQgdG8uXG4gICAgICAgICAqL1xuICAgICAgICBnZXRTaWduYWwgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fc2lnbmFsO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEZWxldGUgaW5zdGFuY2UgcHJvcGVydGllc1xuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX2Rlc3Ryb3kgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fc2lnbmFsO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2xpc3RlbmVyO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuY29udGV4dDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHJldHVybiB7c3RyaW5nfSBTdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG9iamVjdC5cbiAgICAgICAgICovXG4gICAgICAgIHRvU3RyaW5nIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICdbU2lnbmFsQmluZGluZyBpc09uY2U6JyArIHRoaXMuX2lzT25jZSArJywgaXNCb3VuZDonKyB0aGlzLmlzQm91bmQoKSArJywgYWN0aXZlOicgKyB0aGlzLmFjdGl2ZSArICddJztcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4vKmdsb2JhbCBTaWduYWxCaW5kaW5nOmZhbHNlKi9cblxuICAgIC8vIFNpZ25hbCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVxuICAgIC8vPT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PVxuXG4gICAgZnVuY3Rpb24gdmFsaWRhdGVMaXN0ZW5lcihsaXN0ZW5lciwgZm5OYW1lKSB7XG4gICAgICAgIGlmICh0eXBlb2YgbGlzdGVuZXIgIT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvciggJ2xpc3RlbmVyIGlzIGEgcmVxdWlyZWQgcGFyYW0gb2Yge2ZufSgpIGFuZCBzaG91bGQgYmUgYSBGdW5jdGlvbi4nLnJlcGxhY2UoJ3tmbn0nLCBmbk5hbWUpICk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBDdXN0b20gZXZlbnQgYnJvYWRjYXN0ZXJcbiAgICAgKiA8YnIgLz4tIGluc3BpcmVkIGJ5IFJvYmVydCBQZW5uZXIncyBBUzMgU2lnbmFscy5cbiAgICAgKiBAbmFtZSBTaWduYWxcbiAgICAgKiBAYXV0aG9yIE1pbGxlciBNZWRlaXJvc1xuICAgICAqIEBjb25zdHJ1Y3RvclxuICAgICAqL1xuICAgIGZ1bmN0aW9uIFNpZ25hbCgpIHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIEFycmF5LjxTaWduYWxCaW5kaW5nPlxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgdGhpcy5fYmluZGluZ3MgPSBbXTtcbiAgICAgICAgdGhpcy5fcHJldlBhcmFtcyA9IG51bGw7XG5cbiAgICAgICAgLy8gZW5mb3JjZSBkaXNwYXRjaCB0byBhd2F5cyB3b3JrIG9uIHNhbWUgY29udGV4dCAoIzQ3KVxuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgIHRoaXMuZGlzcGF0Y2ggPSBmdW5jdGlvbigpe1xuICAgICAgICAgICAgU2lnbmFsLnByb3RvdHlwZS5kaXNwYXRjaC5hcHBseShzZWxmLCBhcmd1bWVudHMpO1xuICAgICAgICB9O1xuICAgIH1cblxuICAgIFNpZ25hbC5wcm90b3R5cGUgPSB7XG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFNpZ25hbHMgVmVyc2lvbiBOdW1iZXJcbiAgICAgICAgICogQHR5cGUgU3RyaW5nXG4gICAgICAgICAqIEBjb25zdFxuICAgICAgICAgKi9cbiAgICAgICAgVkVSU0lPTiA6ICcxLjAuMCcsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIElmIFNpZ25hbCBzaG91bGQga2VlcCByZWNvcmQgb2YgcHJldmlvdXNseSBkaXNwYXRjaGVkIHBhcmFtZXRlcnMgYW5kXG4gICAgICAgICAqIGF1dG9tYXRpY2FsbHkgZXhlY3V0ZSBsaXN0ZW5lciBkdXJpbmcgYGFkZCgpYC9gYWRkT25jZSgpYCBpZiBTaWduYWwgd2FzXG4gICAgICAgICAqIGFscmVhZHkgZGlzcGF0Y2hlZCBiZWZvcmUuXG4gICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICovXG4gICAgICAgIG1lbW9yaXplIDogZmFsc2UsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICogQHByaXZhdGVcbiAgICAgICAgICovXG4gICAgICAgIF9zaG91bGRQcm9wYWdhdGUgOiB0cnVlLFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBJZiBTaWduYWwgaXMgYWN0aXZlIGFuZCBzaG91bGQgYnJvYWRjYXN0IGV2ZW50cy5cbiAgICAgICAgICogPHA+PHN0cm9uZz5JTVBPUlRBTlQ6PC9zdHJvbmc+IFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBkdXJpbmcgYSBkaXNwYXRjaCB3aWxsIG9ubHkgYWZmZWN0IHRoZSBuZXh0IGRpc3BhdGNoLCBpZiB5b3Ugd2FudCB0byBzdG9wIHRoZSBwcm9wYWdhdGlvbiBvZiBhIHNpZ25hbCB1c2UgYGhhbHQoKWAgaW5zdGVhZC48L3A+XG4gICAgICAgICAqIEB0eXBlIGJvb2xlYW5cbiAgICAgICAgICovXG4gICAgICAgIGFjdGl2ZSA6IHRydWUsXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyXG4gICAgICAgICAqIEBwYXJhbSB7Ym9vbGVhbn0gaXNPbmNlXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbbGlzdGVuZXJDb250ZXh0XVxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ByaW9yaXR5XVxuICAgICAgICAgKiBAcmV0dXJuIHtTaWduYWxCaW5kaW5nfVxuICAgICAgICAgKiBAcHJpdmF0ZVxuICAgICAgICAgKi9cbiAgICAgICAgX3JlZ2lzdGVyTGlzdGVuZXIgOiBmdW5jdGlvbiAobGlzdGVuZXIsIGlzT25jZSwgbGlzdGVuZXJDb250ZXh0LCBwcmlvcml0eSkge1xuXG4gICAgICAgICAgICB2YXIgcHJldkluZGV4ID0gdGhpcy5faW5kZXhPZkxpc3RlbmVyKGxpc3RlbmVyLCBsaXN0ZW5lckNvbnRleHQpLFxuICAgICAgICAgICAgICAgIGJpbmRpbmc7XG5cbiAgICAgICAgICAgIGlmIChwcmV2SW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgYmluZGluZyA9IHRoaXMuX2JpbmRpbmdzW3ByZXZJbmRleF07XG4gICAgICAgICAgICAgICAgaWYgKGJpbmRpbmcuaXNPbmNlKCkgIT09IGlzT25jZSkge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1lvdSBjYW5ub3QgYWRkJysgKGlzT25jZT8gJycgOiAnT25jZScpICsnKCkgdGhlbiBhZGQnKyAoIWlzT25jZT8gJycgOiAnT25jZScpICsnKCkgdGhlIHNhbWUgbGlzdGVuZXIgd2l0aG91dCByZW1vdmluZyB0aGUgcmVsYXRpb25zaGlwIGZpcnN0LicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYmluZGluZyA9IG5ldyBTaWduYWxCaW5kaW5nKHRoaXMsIGxpc3RlbmVyLCBpc09uY2UsIGxpc3RlbmVyQ29udGV4dCwgcHJpb3JpdHkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FkZEJpbmRpbmcoYmluZGluZyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmKHRoaXMubWVtb3JpemUgJiYgdGhpcy5fcHJldlBhcmFtcyl7XG4gICAgICAgICAgICAgICAgYmluZGluZy5leGVjdXRlKHRoaXMuX3ByZXZQYXJhbXMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gYmluZGluZztcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQHBhcmFtIHtTaWduYWxCaW5kaW5nfSBiaW5kaW5nXG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfYWRkQmluZGluZyA6IGZ1bmN0aW9uIChiaW5kaW5nKSB7XG4gICAgICAgICAgICAvL3NpbXBsaWZpZWQgaW5zZXJ0aW9uIHNvcnRcbiAgICAgICAgICAgIHZhciBuID0gdGhpcy5fYmluZGluZ3MubGVuZ3RoO1xuICAgICAgICAgICAgZG8geyAtLW47IH0gd2hpbGUgKHRoaXMuX2JpbmRpbmdzW25dICYmIGJpbmRpbmcuX3ByaW9yaXR5IDw9IHRoaXMuX2JpbmRpbmdzW25dLl9wcmlvcml0eSk7XG4gICAgICAgICAgICB0aGlzLl9iaW5kaW5ncy5zcGxpY2UobiArIDEsIDAsIGJpbmRpbmcpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lclxuICAgICAgICAgKiBAcmV0dXJuIHtudW1iZXJ9XG4gICAgICAgICAqIEBwcml2YXRlXG4gICAgICAgICAqL1xuICAgICAgICBfaW5kZXhPZkxpc3RlbmVyIDogZnVuY3Rpb24gKGxpc3RlbmVyLCBjb250ZXh0KSB7XG4gICAgICAgICAgICB2YXIgbiA9IHRoaXMuX2JpbmRpbmdzLmxlbmd0aCxcbiAgICAgICAgICAgICAgICBjdXI7XG4gICAgICAgICAgICB3aGlsZSAobi0tKSB7XG4gICAgICAgICAgICAgICAgY3VyID0gdGhpcy5fYmluZGluZ3Nbbl07XG4gICAgICAgICAgICAgICAgaWYgKGN1ci5fbGlzdGVuZXIgPT09IGxpc3RlbmVyICYmIGN1ci5jb250ZXh0ID09PSBjb250ZXh0KSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQ2hlY2sgaWYgbGlzdGVuZXIgd2FzIGF0dGFjaGVkIHRvIFNpZ25hbC5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXJcbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IFtjb250ZXh0XVxuICAgICAgICAgKiBAcmV0dXJuIHtib29sZWFufSBpZiBTaWduYWwgaGFzIHRoZSBzcGVjaWZpZWQgbGlzdGVuZXIuXG4gICAgICAgICAqL1xuICAgICAgICBoYXMgOiBmdW5jdGlvbiAobGlzdGVuZXIsIGNvbnRleHQpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9pbmRleE9mTGlzdGVuZXIobGlzdGVuZXIsIGNvbnRleHQpICE9PSAtMTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogQWRkIGEgbGlzdGVuZXIgdG8gdGhlIHNpZ25hbC5cbiAgICAgICAgICogQHBhcmFtIHtGdW5jdGlvbn0gbGlzdGVuZXIgU2lnbmFsIGhhbmRsZXIgZnVuY3Rpb24uXG4gICAgICAgICAqIEBwYXJhbSB7T2JqZWN0fSBbbGlzdGVuZXJDb250ZXh0XSBDb250ZXh0IG9uIHdoaWNoIGxpc3RlbmVyIHdpbGwgYmUgZXhlY3V0ZWQgKG9iamVjdCB0aGF0IHNob3VsZCByZXByZXNlbnQgdGhlIGB0aGlzYCB2YXJpYWJsZSBpbnNpZGUgbGlzdGVuZXIgZnVuY3Rpb24pLlxuICAgICAgICAgKiBAcGFyYW0ge051bWJlcn0gW3ByaW9yaXR5XSBUaGUgcHJpb3JpdHkgbGV2ZWwgb2YgdGhlIGV2ZW50IGxpc3RlbmVyLiBMaXN0ZW5lcnMgd2l0aCBoaWdoZXIgcHJpb3JpdHkgd2lsbCBiZSBleGVjdXRlZCBiZWZvcmUgbGlzdGVuZXJzIHdpdGggbG93ZXIgcHJpb3JpdHkuIExpc3RlbmVycyB3aXRoIHNhbWUgcHJpb3JpdHkgbGV2ZWwgd2lsbCBiZSBleGVjdXRlZCBhdCB0aGUgc2FtZSBvcmRlciBhcyB0aGV5IHdlcmUgYWRkZWQuIChkZWZhdWx0ID0gMClcbiAgICAgICAgICogQHJldHVybiB7U2lnbmFsQmluZGluZ30gQW4gT2JqZWN0IHJlcHJlc2VudGluZyB0aGUgYmluZGluZyBiZXR3ZWVuIHRoZSBTaWduYWwgYW5kIGxpc3RlbmVyLlxuICAgICAgICAgKi9cbiAgICAgICAgYWRkIDogZnVuY3Rpb24gKGxpc3RlbmVyLCBsaXN0ZW5lckNvbnRleHQsIHByaW9yaXR5KSB7XG4gICAgICAgICAgICB2YWxpZGF0ZUxpc3RlbmVyKGxpc3RlbmVyLCAnYWRkJyk7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fcmVnaXN0ZXJMaXN0ZW5lcihsaXN0ZW5lciwgZmFsc2UsIGxpc3RlbmVyQ29udGV4dCwgcHJpb3JpdHkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBBZGQgbGlzdGVuZXIgdG8gdGhlIHNpZ25hbCB0aGF0IHNob3VsZCBiZSByZW1vdmVkIGFmdGVyIGZpcnN0IGV4ZWN1dGlvbiAod2lsbCBiZSBleGVjdXRlZCBvbmx5IG9uY2UpLlxuICAgICAgICAgKiBAcGFyYW0ge0Z1bmN0aW9ufSBsaXN0ZW5lciBTaWduYWwgaGFuZGxlciBmdW5jdGlvbi5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IFtsaXN0ZW5lckNvbnRleHRdIENvbnRleHQgb24gd2hpY2ggbGlzdGVuZXIgd2lsbCBiZSBleGVjdXRlZCAob2JqZWN0IHRoYXQgc2hvdWxkIHJlcHJlc2VudCB0aGUgYHRoaXNgIHZhcmlhYmxlIGluc2lkZSBsaXN0ZW5lciBmdW5jdGlvbikuXG4gICAgICAgICAqIEBwYXJhbSB7TnVtYmVyfSBbcHJpb3JpdHldIFRoZSBwcmlvcml0eSBsZXZlbCBvZiB0aGUgZXZlbnQgbGlzdGVuZXIuIExpc3RlbmVycyB3aXRoIGhpZ2hlciBwcmlvcml0eSB3aWxsIGJlIGV4ZWN1dGVkIGJlZm9yZSBsaXN0ZW5lcnMgd2l0aCBsb3dlciBwcmlvcml0eS4gTGlzdGVuZXJzIHdpdGggc2FtZSBwcmlvcml0eSBsZXZlbCB3aWxsIGJlIGV4ZWN1dGVkIGF0IHRoZSBzYW1lIG9yZGVyIGFzIHRoZXkgd2VyZSBhZGRlZC4gKGRlZmF1bHQgPSAwKVxuICAgICAgICAgKiBAcmV0dXJuIHtTaWduYWxCaW5kaW5nfSBBbiBPYmplY3QgcmVwcmVzZW50aW5nIHRoZSBiaW5kaW5nIGJldHdlZW4gdGhlIFNpZ25hbCBhbmQgbGlzdGVuZXIuXG4gICAgICAgICAqL1xuICAgICAgICBhZGRPbmNlIDogZnVuY3Rpb24gKGxpc3RlbmVyLCBsaXN0ZW5lckNvbnRleHQsIHByaW9yaXR5KSB7XG4gICAgICAgICAgICB2YWxpZGF0ZUxpc3RlbmVyKGxpc3RlbmVyLCAnYWRkT25jZScpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX3JlZ2lzdGVyTGlzdGVuZXIobGlzdGVuZXIsIHRydWUsIGxpc3RlbmVyQ29udGV4dCwgcHJpb3JpdHkpO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBSZW1vdmUgYSBzaW5nbGUgbGlzdGVuZXIgZnJvbSB0aGUgZGlzcGF0Y2ggcXVldWUuXG4gICAgICAgICAqIEBwYXJhbSB7RnVuY3Rpb259IGxpc3RlbmVyIEhhbmRsZXIgZnVuY3Rpb24gdGhhdCBzaG91bGQgYmUgcmVtb3ZlZC5cbiAgICAgICAgICogQHBhcmFtIHtPYmplY3R9IFtjb250ZXh0XSBFeGVjdXRpb24gY29udGV4dCAoc2luY2UgeW91IGNhbiBhZGQgdGhlIHNhbWUgaGFuZGxlciBtdWx0aXBsZSB0aW1lcyBpZiBleGVjdXRpbmcgaW4gYSBkaWZmZXJlbnQgY29udGV4dCkuXG4gICAgICAgICAqIEByZXR1cm4ge0Z1bmN0aW9ufSBMaXN0ZW5lciBoYW5kbGVyIGZ1bmN0aW9uLlxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlIDogZnVuY3Rpb24gKGxpc3RlbmVyLCBjb250ZXh0KSB7XG4gICAgICAgICAgICB2YWxpZGF0ZUxpc3RlbmVyKGxpc3RlbmVyLCAncmVtb3ZlJyk7XG5cbiAgICAgICAgICAgIHZhciBpID0gdGhpcy5faW5kZXhPZkxpc3RlbmVyKGxpc3RlbmVyLCBjb250ZXh0KTtcbiAgICAgICAgICAgIGlmIChpICE9PSAtMSkge1xuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRpbmdzW2ldLl9kZXN0cm95KCk7IC8vbm8gcmVhc29uIHRvIGEgU2lnbmFsQmluZGluZyBleGlzdCBpZiBpdCBpc24ndCBhdHRhY2hlZCB0byBhIHNpZ25hbFxuICAgICAgICAgICAgICAgIHRoaXMuX2JpbmRpbmdzLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiBsaXN0ZW5lcjtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogUmVtb3ZlIGFsbCBsaXN0ZW5lcnMgZnJvbSB0aGUgU2lnbmFsLlxuICAgICAgICAgKi9cbiAgICAgICAgcmVtb3ZlQWxsIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdmFyIG4gPSB0aGlzLl9iaW5kaW5ncy5sZW5ndGg7XG4gICAgICAgICAgICB3aGlsZSAobi0tKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYmluZGluZ3Nbbl0uX2Rlc3Ryb3koKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHRoaXMuX2JpbmRpbmdzLmxlbmd0aCA9IDA7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge251bWJlcn0gTnVtYmVyIG9mIGxpc3RlbmVycyBhdHRhY2hlZCB0byB0aGUgU2lnbmFsLlxuICAgICAgICAgKi9cbiAgICAgICAgZ2V0TnVtTGlzdGVuZXJzIDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2JpbmRpbmdzLmxlbmd0aDtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogU3RvcCBwcm9wYWdhdGlvbiBvZiB0aGUgZXZlbnQsIGJsb2NraW5nIHRoZSBkaXNwYXRjaCB0byBuZXh0IGxpc3RlbmVycyBvbiB0aGUgcXVldWUuXG4gICAgICAgICAqIDxwPjxzdHJvbmc+SU1QT1JUQU5UOjwvc3Ryb25nPiBzaG91bGQgYmUgY2FsbGVkIG9ubHkgZHVyaW5nIHNpZ25hbCBkaXNwYXRjaCwgY2FsbGluZyBpdCBiZWZvcmUvYWZ0ZXIgZGlzcGF0Y2ggd29uJ3QgYWZmZWN0IHNpZ25hbCBicm9hZGNhc3QuPC9wPlxuICAgICAgICAgKiBAc2VlIFNpZ25hbC5wcm90b3R5cGUuZGlzYWJsZVxuICAgICAgICAgKi9cbiAgICAgICAgaGFsdCA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuX3Nob3VsZFByb3BhZ2F0ZSA9IGZhbHNlO1xuICAgICAgICB9LFxuXG4gICAgICAgIC8qKlxuICAgICAgICAgKiBEaXNwYXRjaC9Ccm9hZGNhc3QgU2lnbmFsIHRvIGFsbCBsaXN0ZW5lcnMgYWRkZWQgdG8gdGhlIHF1ZXVlLlxuICAgICAgICAgKiBAcGFyYW0gey4uLip9IFtwYXJhbXNdIFBhcmFtZXRlcnMgdGhhdCBzaG91bGQgYmUgcGFzc2VkIHRvIGVhY2ggaGFuZGxlci5cbiAgICAgICAgICovXG4gICAgICAgIGRpc3BhdGNoIDogZnVuY3Rpb24gKHBhcmFtcykge1xuICAgICAgICAgICAgaWYgKCEgdGhpcy5hY3RpdmUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHZhciBwYXJhbXNBcnIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMpLFxuICAgICAgICAgICAgICAgIG4gPSB0aGlzLl9iaW5kaW5ncy5sZW5ndGgsXG4gICAgICAgICAgICAgICAgYmluZGluZ3M7XG5cbiAgICAgICAgICAgIGlmICh0aGlzLm1lbW9yaXplKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fcHJldlBhcmFtcyA9IHBhcmFtc0FycjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCEgbikge1xuICAgICAgICAgICAgICAgIC8vc2hvdWxkIGNvbWUgYWZ0ZXIgbWVtb3JpemVcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGJpbmRpbmdzID0gdGhpcy5fYmluZGluZ3Muc2xpY2UoKTsgLy9jbG9uZSBhcnJheSBpbiBjYXNlIGFkZC9yZW1vdmUgaXRlbXMgZHVyaW5nIGRpc3BhdGNoXG4gICAgICAgICAgICB0aGlzLl9zaG91bGRQcm9wYWdhdGUgPSB0cnVlOyAvL2luIGNhc2UgYGhhbHRgIHdhcyBjYWxsZWQgYmVmb3JlIGRpc3BhdGNoIG9yIGR1cmluZyB0aGUgcHJldmlvdXMgZGlzcGF0Y2guXG5cbiAgICAgICAgICAgIC8vZXhlY3V0ZSBhbGwgY2FsbGJhY2tzIHVudGlsIGVuZCBvZiB0aGUgbGlzdCBvciB1bnRpbCBhIGNhbGxiYWNrIHJldHVybnMgYGZhbHNlYCBvciBzdG9wcyBwcm9wYWdhdGlvblxuICAgICAgICAgICAgLy9yZXZlcnNlIGxvb3Agc2luY2UgbGlzdGVuZXJzIHdpdGggaGlnaGVyIHByaW9yaXR5IHdpbGwgYmUgYWRkZWQgYXQgdGhlIGVuZCBvZiB0aGUgbGlzdFxuICAgICAgICAgICAgZG8geyBuLS07IH0gd2hpbGUgKGJpbmRpbmdzW25dICYmIHRoaXMuX3Nob3VsZFByb3BhZ2F0ZSAmJiBiaW5kaW5nc1tuXS5leGVjdXRlKHBhcmFtc0FycikgIT09IGZhbHNlKTtcbiAgICAgICAgfSxcblxuICAgICAgICAvKipcbiAgICAgICAgICogRm9yZ2V0IG1lbW9yaXplZCBhcmd1bWVudHMuXG4gICAgICAgICAqIEBzZWUgU2lnbmFsLm1lbW9yaXplXG4gICAgICAgICAqL1xuICAgICAgICBmb3JnZXQgOiBmdW5jdGlvbigpe1xuICAgICAgICAgICAgdGhpcy5fcHJldlBhcmFtcyA9IG51bGw7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIFJlbW92ZSBhbGwgYmluZGluZ3MgZnJvbSBzaWduYWwgYW5kIGRlc3Ryb3kgYW55IHJlZmVyZW5jZSB0byBleHRlcm5hbCBvYmplY3RzIChkZXN0cm95IFNpZ25hbCBvYmplY3QpLlxuICAgICAgICAgKiA8cD48c3Ryb25nPklNUE9SVEFOVDo8L3N0cm9uZz4gY2FsbGluZyBhbnkgbWV0aG9kIG9uIHRoZSBzaWduYWwgaW5zdGFuY2UgYWZ0ZXIgY2FsbGluZyBkaXNwb3NlIHdpbGwgdGhyb3cgZXJyb3JzLjwvcD5cbiAgICAgICAgICovXG4gICAgICAgIGRpc3Bvc2UgOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLnJlbW92ZUFsbCgpO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2JpbmRpbmdzO1xuICAgICAgICAgICAgZGVsZXRlIHRoaXMuX3ByZXZQYXJhbXM7XG4gICAgICAgIH0sXG5cbiAgICAgICAgLyoqXG4gICAgICAgICAqIEByZXR1cm4ge3N0cmluZ30gU3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBvYmplY3QuXG4gICAgICAgICAqL1xuICAgICAgICB0b1N0cmluZyA6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHJldHVybiAnW1NpZ25hbCBhY3RpdmU6JysgdGhpcy5hY3RpdmUgKycgbnVtTGlzdGVuZXJzOicrIHRoaXMuZ2V0TnVtTGlzdGVuZXJzKCkgKyddJztcbiAgICAgICAgfVxuXG4gICAgfTtcblxuXG4gICAgLy8gTmFtZXNwYWNlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4gICAgLy89PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09PT09XG5cbiAgICAvKipcbiAgICAgKiBTaWduYWxzIG5hbWVzcGFjZVxuICAgICAqIEBuYW1lc3BhY2VcbiAgICAgKiBAbmFtZSBzaWduYWxzXG4gICAgICovXG4gICAgdmFyIHNpZ25hbHMgPSBTaWduYWw7XG5cbiAgICAvKipcbiAgICAgKiBDdXN0b20gZXZlbnQgYnJvYWRjYXN0ZXJcbiAgICAgKiBAc2VlIFNpZ25hbFxuICAgICAqL1xuICAgIC8vIGFsaWFzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eSAoc2VlICNnaC00NClcbiAgICBzaWduYWxzLlNpZ25hbCA9IFNpZ25hbDtcblxuXG5cbiAgICAvL2V4cG9ydHMgdG8gbXVsdGlwbGUgZW52aXJvbm1lbnRzXG4gICAgaWYodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKXsgLy9BTURcbiAgICAgICAgZGVmaW5lKGZ1bmN0aW9uICgpIHsgcmV0dXJuIHNpZ25hbHM7IH0pO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpeyAvL25vZGVcbiAgICAgICAgbW9kdWxlLmV4cG9ydHMgPSBzaWduYWxzO1xuICAgIH0gZWxzZSB7IC8vYnJvd3NlclxuICAgICAgICAvL3VzZSBzdHJpbmcgYmVjYXVzZSBvZiBHb29nbGUgY2xvc3VyZSBjb21waWxlciBBRFZBTkNFRF9NT0RFXG4gICAgICAgIC8qanNsaW50IHN1Yjp0cnVlICovXG4gICAgICAgIGdsb2JhbFsnc2lnbmFscyddID0gc2lnbmFscztcbiAgICB9XG5cbn0odGhpcykpO1xuIiwidmFyIGhpc3RvcnkgPSByZXF1aXJlKCcuL2NvcmUvaGlzdG9yeScpO1xuXG5oaXN0b3J5LmluaXQoKTtcblxuIiwiZXhwb3J0cy5zZWxlY3RvciA9ICcuanMtYW5hbHl0aWNzJztcblxuZXhwb3J0cy5jb25zdHJ1Y3RvciA9IGZ1bmN0aW9uKCkge1xuXG5cdHZhciBfZWwsXG5cdFx0X2NhdGVnb3J5LFxuXHRcdF9sYWJlbDtcblxuXHRmdW5jdGlvbiBpbml0KGVsKSB7XG5cblx0XHRfZWwgPSBlbDtcblx0XHRfY2F0ZWdvcnkgPSBfZWwuZ2V0QXR0cmlidXRlKCdkYXRhLWNhdGVnb3J5Jyk7XG5cdFx0X2xhYmVsID0gX2VsLmdldEF0dHJpYnV0ZSgnZGF0YS1sYWJlbCcpO1xuXG5cdFx0aWYoZ2EpIHtcblxuXHRcdFx0X2VsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgb25DbGljayk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gb25DbGljaygpIHtcblxuXHRcdGdhKCdzZW5kJywgJ2V2ZW50JywgX2NhdGVnb3J5LCAnY2xpY2snLCBfbGFiZWwpO1xuXHR9XG5cblx0ZnVuY3Rpb24gZGVzdHJveSgpIHtcblxuXHRcdF9lbC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIG9uQ2xpY2spO1xuXG5cdFx0X2xhYmVsID0gbnVsbDtcblx0XHRfY2F0ZWdvcnkgPSBudWxsO1xuXHRcdF9lbCA9IG51bGw7XG5cdH1cblxuXG5cdHRoaXMuaW5pdCA9IGluaXQ7XG5cdHRoaXMuZGVzdHJveSA9IGRlc3Ryb3k7XG59OyIsInZhciBoaXN0b3J5ID0gcmVxdWlyZSgnLi4vY29yZS9oaXN0b3J5Jyk7XG5cbmV4cG9ydHMuc2VsZWN0b3IgPSAnYSc7XG5cbmV4cG9ydHMuY29uc3RydWN0b3IgPSBmdW5jdGlvbigpIHtcblxuXHR2YXIgX2hyZWYsXG5cdFx0X2VsO1xuXG5cdGZ1bmN0aW9uIGluaXQoZWwpIHtcblxuXHRcdF9lbCA9IGVsO1xuXHRcdF9ocmVmID0gZWwuZ2V0QXR0cmlidXRlKCdocmVmJyk7XG5cblx0XHRpZighY2hlY2tJc1RhcmdldEJsYW5rKGVsKSAmJiAhY2hlY2tJc0V4dGVybmFsTGluayhfaHJlZikgJiYgIWNoZWNrSXNNYWlsdG9MaW5rKF9ocmVmKSkge1xuXG5cdFx0XHRfZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBvbkNsaWNrKGUpIHtcblxuXHRcdC8vIG1ha2Ugc3VyZSB3ZSBjYW4gYWN0dWFsbHkgb3BlbiB1cCBhIG5ldyB0YWJcblx0XHRpZighZS5tZXRhS2V5ICYmICFlLmN0cmxLZXkpIHtcblxuXHRcdFx0ZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHRpZihfaHJlZiAhPT0gd2luZG93LmxvY2F0aW9uLnBhdGhuYW1lKSB7XG5cblx0XHRcdFx0aGlzdG9yeS5wdXNoU3RhdGUoX2hyZWYpO1xuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG5cblx0XHRfZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcignY2xpY2snLCBvbkNsaWNrKTtcblxuXHRcdF9ocmVmID0gbnVsbDtcblx0XHRfZWwgPSBudWxsO1xuXHR9XG5cblx0ZnVuY3Rpb24gY2hlY2tJc01haWx0b0xpbmsodXJsKSB7XG5cblx0XHRyZXR1cm4gdXJsLmluZGV4T2YoJ21haWx0bzonKSA9PT0gMDtcblx0fVxuXG5cdGZ1bmN0aW9uIGNoZWNrSXNUYXJnZXRCbGFuayhlbCkge1xuXHRcdFxuXHRcdHZhciB0YXJnZXQgPSBlbC5nZXRBdHRyaWJ1dGUoJ3RhcmdldCcpO1xuXHRcdFxuXHRcdHJldHVybiB0YXJnZXQgPT09ICdfYmxhbmsnO1xuXHR9XG5cdFxuXHRmdW5jdGlvbiBjaGVja0lzRXh0ZXJuYWxMaW5rKHVybCkge1xuXG5cdFx0dmFyIFBBVFRFUk5fRk9SX0VYVEVSTkFMX1VSTFMgPSAvXihcXHcrOik/XFwvXFwvLztcblxuXHRcdHJldHVybiB1cmwgIT09IHVuZGVmaW5lZCAmJiB1cmwuc2VhcmNoKFBBVFRFUk5fRk9SX0VYVEVSTkFMX1VSTFMpICE9PSAtMTtcblx0fVxuXG5cdHRoaXMuaW5pdCA9IGluaXQ7XG5cdHRoaXMuZGVzdHJveSA9IGRlc3Ryb3k7XG59OyIsInZhciByZXNpemVDYW52YXMgPSByZXF1aXJlKCcuLi91dGlscy9yZXNpemVDYW52YXMnKSxcblx0c2lnbmFscyA9IHJlcXVpcmUoJy4uL2NvcmUvc2lnbmFscycpLFxuXHRBTklNQVRJT05fVElNRSA9IDAuNSxcblx0Q0xBU1NfSVNfVklTSUJMRSA9ICdpcy12aXNpYmxlJztcblxuZXhwb3J0cy5zZWxlY3RvciA9ICcuanMtY2FyZCc7XG5leHBvcnRzLmNvbnN0cnVjdG9yID0gZnVuY3Rpb24oKSB7XG5cblx0dmFyIF9wYXJlbnQsXG5cdFx0X3ZpZGVvU3JjLFxuXHRcdF9pc0FsaXZlLFxuXHRcdF9pc0luVmlldyxcblx0XHRfdmlkZW9FbCxcblx0XHRfc2l6aW5nRWwsXG5cdFx0X2NhbnZhc0VsLFxuXHRcdF9jb250ZXh0LFxuXHRcdF9wcm9ncmVzcyxcblx0XHRfd2luZG93SGVpZ2h0LFxuXHRcdF9lbGVtZW50SGVpZ2h0LFxuXHRcdF9jYW52YXNXaWR0aCxcblx0XHRfY2FudmFzSGVpZ2h0LFxuXHRcdF9pbWdVcmwsXG5cdFx0X2NvdmVyVXJsLFxuXHRcdF9jb3ZlckVsLFxuXHRcdF9pbWFnZUVsO1xuXG5cdGZ1bmN0aW9uIGluaXQoZWwpIHtcblxuXHRcdF9wYXJlbnQgPSBlbDtcblxuXHRcdF9zaXppbmdFbCA9IGVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLWNhcmRfX3NpemUnKVswXTtcblx0XHRfY2FudmFzRWwgPSBlbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy1jYXJkX19jYW52YXMnKVswXTtcblx0XHRfaW1hZ2VFbCA9IGVsLmdldEVsZW1lbnRzQnlDbGFzc05hbWUoJ2pzLWNhcmRfX2ltYWdlJylbMF07XG5cdFx0X2NvdmVyRWwgPSBlbC5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKCdqcy1jYXJkX19jb3ZlcicpWzBdO1xuXHRcdF9jb250ZXh0ID0gX2NhbnZhc0VsLmdldENvbnRleHQoJzJkJyk7XG5cdFx0X3Byb2dyZXNzID0ge3A6MH07XG5cdFx0X3ZpZGVvU3JjID0gX2NhbnZhc0VsLmdldEF0dHJpYnV0ZSgnZGF0YS1tcDQnKTtcblx0XHRfaW1nVXJsID0gX2ltYWdlRWwuZ2V0QXR0cmlidXRlKCdkYXRhLXNyYycpO1xuXHRcdF9jb3ZlclVybCA9IF9jb3ZlckVsLmdldEF0dHJpYnV0ZSgnZGF0YS1zcmMnKTtcblxuXHRcdF9pc0luVmlldyA9IGZhbHNlO1xuXHRcdF93aW5kb3dIZWlnaHQgPSB3aW5kb3cuaW5uZXJIZWlnaHQ7XG5cblx0XHRzaWduYWxzLlNDUk9MTEVELmFkZChvblNjcm9sbCk7XG5cdFx0c2lnbmFscy5SRVNJWkVELmFkZChvblJlc2l6ZSk7XG5cdFx0b25SZXNpemUoKTtcblx0XHRvblNjcm9sbCgpO1xuXHR9XG5cblx0ZnVuY3Rpb24gb25TY3JvbGwoKSB7XG5cblx0XHR2YXIgc2Nyb2xsVG9wID0gd2luZG93LnBhZ2VZT2Zmc2V0IHx8IGRvY3VtZW50LnNjcm9sbFRvcCB8fCAwLFxuXHRcdFx0b2Zmc2V0ID0gX3BhcmVudC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS50b3AgKyBzY3JvbGxUb3A7XG5cblx0XHRpZihfd2luZG93SGVpZ2h0ICsgc2Nyb2xsVG9wID4gb2Zmc2V0ICYmIHNjcm9sbFRvcCA8IG9mZnNldCArIF9lbGVtZW50SGVpZ2h0KSB7XG5cblx0XHRcdGluVmlldygpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGRlc3Ryb3koKSB7XG5cblx0XHRfaXNBbGl2ZSA9IGZhbHNlO1xuXG5cdFx0VHdlZW5MaXRlLmtpbGxUd2VlbnNPZihfcHJvZ3Jlc3MpO1xuXG5cdFx0X3ZpZGVvRWwgPSBudWxsO1xuXHRcdF9zaXppbmdFbCA9IG51bGw7XG5cdFx0X2NhbnZhc0VsID0gbnVsbDtcblx0XHRfaW1hZ2VFbCA9IG51bGw7XG5cdFx0X2NvdmVyRWwgPSBudWxsO1xuXG5cdFx0X3BhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZU92ZXIpO1xuXHRcdF9wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG9uTW91c2VPdXQpO1xuXHRcdF9wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uTW91c2VPdmVyKTtcblx0XHRfcGFyZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvbk1vdXNlT3V0KTtcblxuXHRcdHNpZ25hbHMuUkVTSVpFRC5yZW1vdmUob25SZXNpemUpO1xuXHRcdHNpZ25hbHMuU0NST0xMRUQucmVtb3ZlKG9uU2Nyb2xsKTtcblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VPdmVyKCkge1xuXG5cdFx0aWYoIV92aWRlb0VsKSB7XG5cblx0XHRcdHNldHVwVmlkZW8oKTtcblx0XHR9XG5cblx0XHRfaXNBbGl2ZSA9IHRydWU7XG5cdFx0cmVkcmF3KCk7XG5cblx0XHRfdmlkZW9FbC5wbGF5KCk7XG5cblx0XHRUd2VlbkxpdGUudG8oX3Byb2dyZXNzLCBBTklNQVRJT05fVElNRSwge1xuXHRcdFx0cDoxLFxuXHRcdFx0ZWFzZTogQ3ViaWMuZWFzZUluT3V0XG5cdFx0fSlcblx0fVxuXG5cdGZ1bmN0aW9uIG9uTW91c2VPdXQoKSB7XG5cblx0XHRUd2VlbkxpdGUudG8oX3Byb2dyZXNzLCBBTklNQVRJT05fVElNRSwge1xuXHRcdFx0cDowLFxuXHRcdFx0ZWFzZTogQ3ViaWMuZWFzZUluT3V0LFxuXHRcdFx0b25Db21wbGV0ZTpmdW5jdGlvbigpe1xuXG5cdFx0XHRcdF92aWRlb0VsLnBhdXNlKCk7XG5cdFx0XHRcdF92aWRlb0VsLmN1cnJlbnRUaW1lID0gMDtcblx0XHRcdFx0X2lzQWxpdmUgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9KVxuXHR9XG5cblxuXHRmdW5jdGlvbiBpblZpZXcoKSB7XG5cblx0XHRfaXNJblZpZXcgPSB0cnVlO1xuXHRcdF9wYXJlbnQuY2xhc3NMaXN0LmFkZChDTEFTU19JU19WSVNJQkxFKTtcblxuXHRcdGxvYWRJbWFnZSgpO1xuXHRcdHJlZHJhdygpO1xuXG5cdFx0X3BhcmVudC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcblx0XHRfcGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3RvdWNoZW5kJywgb25Ub3VjaEVuZCk7XG5cdFx0X3BhcmVudC5hZGRFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZU92ZXIpO1xuXHRcdF9wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG9uTW91c2VPdXQpO1xuXG5cdFx0c2lnbmFscy5TQ1JPTExFRC5yZW1vdmUob25TY3JvbGwpO1xuXHR9XG5cblx0ZnVuY3Rpb24gb25Ub3VjaFN0YXJ0KCkge1xuXG5cdFx0X3BhcmVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdtb3VzZWVudGVyJywgb25Nb3VzZU92ZXIpO1xuXHRcdF9wYXJlbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcignbW91c2VsZWF2ZScsIG9uTW91c2VPdXQpO1xuXHR9XG5cblx0ZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcblxuXHRcdF9wYXJlbnQuYWRkRXZlbnRMaXN0ZW5lcignbW91c2VlbnRlcicsIG9uTW91c2VPdmVyKTtcblx0XHRfcGFyZW50LmFkZEV2ZW50TGlzdGVuZXIoJ21vdXNlbGVhdmUnLCBvbk1vdXNlT3V0KTtcblx0fVxuXG5cdGZ1bmN0aW9uIGxvYWRJbWFnZSgpIHtcblxuXHRcdF9pbWFnZUVsLm9ubG9hZCA9IG9uTG9hZGVkO1xuXHRcdF9pbWFnZUVsLnNyYyA9IF9pbWdVcmw7XG5cblx0XHRmdW5jdGlvbiBvbkxvYWRlZCgpIHtcblxuXHRcdFx0X2ltYWdlRWwuY2xhc3NMaXN0LmFkZChDTEFTU19JU19WSVNJQkxFKTtcblx0XHR9XG5cdH1cblxuXHRmdW5jdGlvbiBzZXR1cFZpZGVvKCkge1xuXG5cdFx0X3ZpZGVvRWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpO1xuXHRcdF92aWRlb0VsLmxvb3AgPSB0cnVlO1xuXHRcdF92aWRlb0VsLnNyYyA9IF92aWRlb1NyYztcblxuXHRcdF9jb3ZlckVsLnNyYyA9IF9jb3ZlclVybDtcblx0fVxuXG5cblxuXHRmdW5jdGlvbiByZWRyYXcoKSB7XG5cblx0XHRfY29udGV4dC5jbGVhclJlY3QoMCwgMCwgX2NhbnZhc1dpZHRoLCBfY2FudmFzSGVpZ2h0KTtcblxuXHRcdGlmKF9wcm9ncmVzcy5wID4gMCkge1xuXG5cdFx0XHRkcmF3TWFzayhfcHJvZ3Jlc3MucCk7XG5cdFx0fVxuXG5cdFx0aWYoX2lzQWxpdmUpIHtcblxuXHRcdFx0cmVxdWVzdEFuaW1hdGlvbkZyYW1lKHJlZHJhdyk7XG5cdFx0fVxuXHR9XG5cblxuXHRmdW5jdGlvbiBkcmF3TWFzayhwcm9ncmVzcykge1xuXG5cdFx0dmFyIGZpcnN0SGFsZlByb2dyZXNzID0gTWF0aC5taW4oMSwgcHJvZ3Jlc3MgKiAyKSxcblx0XHRcdHNlY29uZEhhbGZQcm9ncmVzcyA9IE1hdGgubWF4KDAsIChwcm9ncmVzcyAtIDAuNSkgKiAyKTsvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cblx0XHRpZighX2NvdmVyRWwgfHwgIV92aWRlb0VsKSB7XG5cdFx0XHRcblx0XHRcdHJldHVybjtcblx0XHR9XG5cblx0XHRfY29udGV4dC5zYXZlKCk7XG5cblx0XHRfY29udGV4dC5iZWdpblBhdGgoKTtcblxuXHRcdC8vIHN0YXJ0IGF0IGJvdHRvbSBsZWZ0XG5cdFx0X2NvbnRleHQubW92ZVRvKDAsIF9jYW52YXNIZWlnaHQpO1xuXG5cdFx0Ly8gYWJzb2x1dGUgbGluZSB0byBib3R0b20gcmlnaHQsIGJhc2VkIG9uIGZpcnN0SGFsZlByb2dyZXNzXG5cdFx0bGluZVRvKE1hdGgucm91bmQoX2NhbnZhc1dpZHRoICogZmlyc3RIYWxmUHJvZ3Jlc3MpLCBfY2FudmFzSGVpZ2h0KTtcblxuXHRcdC8vIGlmIHdlIHBhc3NlZCB0aGUgZmlyc3QgaGFsZiwgd2UgZHJhdyB0d28gYWRkaXRpb25hbCBsaW5lcyB0cnlpbmcgdG8gZmlsbCB1cCB0aGUgc2NyZWVuXG5cdFx0aWYoc2Vjb25kSGFsZlByb2dyZXNzKSB7XG5cblx0XHRcdGxpbmVUbyhfY2FudmFzV2lkdGgsIE1hdGgucm91bmQoX2NhbnZhc0hlaWdodCAqICgxIC0gc2Vjb25kSGFsZlByb2dyZXNzKSkpO1xuXHRcdFx0bGluZVRvKE1hdGgucm91bmQoX2NhbnZhc1dpZHRoICogc2Vjb25kSGFsZlByb2dyZXNzKSwgMCk7XG5cdFx0fVxuXG5cblxuXHRcdC8vIGFic29sdXRlIGxpbmUgYmFjayB0byB0b3AgbGVmdCwgYmFzZWQgb24gZmlyc3RIYWxmUHJvZ3Jlc3Ncblx0XHRsaW5lVG8oMCwgTWF0aC5yb3VuZChfY2FudmFzSGVpZ2h0ICogKDEgLSBmaXJzdEhhbGZQcm9ncmVzcykpKTtcblxuXHRcdC8vIGNsb3NlIHVwIG91ciBwYXRoXG5cdFx0X2NvbnRleHQuY2xvc2VQYXRoKCk7XG5cblx0XHRfY29udGV4dC5jbGlwKCk7XG5cblx0XHRfY29udGV4dC5kcmF3SW1hZ2UoX2NvdmVyRWwsIDAsIDAsIF9jYW52YXNXaWR0aCwgX2NhbnZhc0hlaWdodCk7XG5cdFx0X2NvbnRleHQuZHJhd0ltYWdlKF92aWRlb0VsLCAwLCAwLCBfY2FudmFzV2lkdGgsIF9jYW52YXNIZWlnaHQpO1xuXG5cblx0XHRfY29udGV4dC5yZXN0b3JlKCk7XG5cblx0XHRmdW5jdGlvbiBsaW5lVG8oeCwgeSkge1xuXG5cdFx0XHRfY29udGV4dC5saW5lVG8oeCwgeSk7XG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gb25SZXNpemUoKSB7XG5cblx0XHRfd2luZG93SGVpZ2h0ID0gd2luZG93LmlubmVySGVpZ2h0O1xuXHRcdF9jYW52YXNXaWR0aCA9IF9zaXppbmdFbC5vZmZzZXRXaWR0aDtcblx0XHRfY2FudmFzSGVpZ2h0ID0gX3NpemluZ0VsLm9mZnNldEhlaWdodDtcblxuXHRcdF9pbWFnZUVsLnNldEF0dHJpYnV0ZSgnd2lkdGgnLCBfY2FudmFzV2lkdGgpO1xuXHRcdF9pbWFnZUVsLnNldEF0dHJpYnV0ZSgnaGVpZ2h0JywgX2NhbnZhc0hlaWdodCk7XG5cblx0XHRfY292ZXJFbC5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgX2NhbnZhc1dpZHRoKTtcblx0XHRfY292ZXJFbC5zZXRBdHRyaWJ1dGUoJ2hlaWdodCcsIF9jYW52YXNIZWlnaHQpO1xuXG5cdFx0X2VsZW1lbnRIZWlnaHQgPSBfcGFyZW50Lm9mZnNldEhlaWdodDtcblxuXHRcdHJlc2l6ZUNhbnZhcyhfY2FudmFzRWwsIF9jYW52YXNXaWR0aCwgX2NhbnZhc0hlaWdodCk7XG5cblx0XHRpZighX2lzQWxpdmUpIHtcblxuXHRcdFx0cmVkcmF3KCk7XG5cdFx0fVxuXG5cdFx0aWYoIV9pc0luVmlldykge1xuXG5cdFx0XHRvblNjcm9sbCgpO1xuXHRcdH1cblx0fVxuXG5cdHRoaXMuaW5pdCA9IGluaXQ7XG5cdHRoaXMuZGVzdHJveSA9IGRlc3Ryb3k7XG59OyIsInZhciBzaWduYWxzID0gcmVxdWlyZSgnLi4vY29yZS9zaWduYWxzJyksXG5cblx0TU9VU0VfRU5URVJfRVZFTlQgPSAnbW91c2VlbnRlcicsXG5cdE1PVVNFX0xFQVZFX0VWRU5UID0gJ21vdXNlbGVhdmUnO1xuXG5cbmV4cG9ydHMuc2VsZWN0b3IgPSAnLmpzLW5hdkxpbmsnO1xuXG5leHBvcnRzLmNvbnN0cnVjdG9yID0gZnVuY3Rpb24oKSB7XG5cblx0dmFyIF9lbCxcblx0XHRfcGF0aDtcblxuXHRmdW5jdGlvbiBpbml0KGVsKSB7XG5cblx0XHRfZWwgPSBlbDtcblxuXHRcdF9lbC5hZGRFdmVudExpc3RlbmVyKCd0b3VjaHN0YXJ0Jywgb25Ub3VjaFN0YXJ0KTtcblx0XHRfZWwuYWRkRXZlbnRMaXN0ZW5lcigndG91Y2hlbmQnLCBvblRvdWNoRW5kKTtcblx0XHRfZWwuYWRkRXZlbnRMaXN0ZW5lcihNT1VTRV9FTlRFUl9FVkVOVCwgYWRkSG92ZXIpO1xuXHRcdF9wYXRoID0gc3RyaXBTbGFzaGVzKF9lbC5nZXRBdHRyaWJ1dGUoJ2hyZWYnKSk7XG5cblx0XHRzaWduYWxzLkhJU1RPUllfQ0hBTkdFRC5hZGQob25IaXN0b3J5Q2hhbmdlZCk7XG5cdH1cblxuXHRmdW5jdGlvbiBvblRvdWNoU3RhcnQoKSB7XG5cblx0XHRfZWwucmVtb3ZlRXZlbnRMaXN0ZW5lcihNT1VTRV9FTlRFUl9FVkVOVCwgYWRkSG92ZXIpO1xuXHR9XG5cblx0ZnVuY3Rpb24gb25Ub3VjaEVuZCgpIHtcblxuXHRcdF9lbC5hZGRFdmVudExpc3RlbmVyKE1PVVNFX0VOVEVSX0VWRU5ULCBhZGRIb3Zlcik7XG5cdH1cblxuXHRmdW5jdGlvbiBvbkhpc3RvcnlDaGFuZ2VkKCkge1xuXG5cdFx0dmFyIHBhdGhuYW1lID0gc3RyaXBTbGFzaGVzKHdpbmRvdy5sb2NhdGlvbi5wYXRobmFtZSk7XG5cblx0XHRpZihwYXRobmFtZSA9PT0gX3BhdGgpIHtcblxuXHRcdFx0X2VsLmNsYXNzTGlzdC5hZGQoJ2lzLWFjdGl2ZScpO1xuXG5cdFx0fSBlbHNlIHtcblxuXHRcdFx0X2VsLmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuXHRcdH1cblx0fVxuXG5cdGZ1bmN0aW9uIGFkZEhvdmVyKCkge1xuXG5cdFx0dmFyIGN1cnJlbnRIb3ZlckVsO1xuXG5cdFx0X2VsLnJlbW92ZUV2ZW50TGlzdGVuZXIoTU9VU0VfRU5URVJfRVZFTlQsIGFkZEhvdmVyKTtcblxuXHRcdGN1cnJlbnRIb3ZlckVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG5cdFx0Y3VycmVudEhvdmVyRWwuY2xhc3NOYW1lID0gJ25hdl9fbGlua19faG92ZXInO1xuXHRcdGN1cnJlbnRIb3ZlckVsLnR3ZWVuID0ge3g6IC0xMDB9O1xuXG5cdFx0X2VsLmFwcGVuZENoaWxkKGN1cnJlbnRIb3ZlckVsKTtcblx0XHR0d2VlblRvKDApO1xuXG5cdFx0X2VsLmFkZEV2ZW50TGlzdGVuZXIoTU9VU0VfTEVBVkVfRVZFTlQsIG9uTW91c2VPdXQpO1xuXG5cdFx0ZnVuY3Rpb24gb25Nb3VzZU91dCgpIHtcblxuXHRcdFx0dHdlZW5UbygxMDAsIHRydWUpO1xuXG5cdFx0XHRfZWwuYWRkRXZlbnRMaXN0ZW5lcihNT1VTRV9FTlRFUl9FVkVOVCwgYWRkSG92ZXIpO1xuXHRcdFx0X2VsLnJlbW92ZUV2ZW50TGlzdGVuZXIoTU9VU0VfTEVBVkVfRVZFTlQsIG9uTW91c2VPdXQpO1xuXHRcdH1cblxuXHRcdGZ1bmN0aW9uIHR3ZWVuVG8obmV3WCwgcmVtb3ZlKSB7XG5cblx0XHRcdHZhciBkaXN0YW5jZSA9IChuZXdYIC0gY3VycmVudEhvdmVyRWwudHdlZW4ueCkgLyAxMDAsXG5cdFx0XHRcdE1BWF9BTklNQVRJT05fVElNRSA9IDAuMzU7XG5cblx0XHRcdFR3ZWVuTGl0ZS50byhjdXJyZW50SG92ZXJFbC50d2VlbiwgTUFYX0FOSU1BVElPTl9USU1FICogZGlzdGFuY2UsIHtcblx0XHRcdFx0eDogbmV3WCxcblx0XHRcdFx0ZWFzZTogQ3ViaWMuZWFzZUluT3V0LFxuXHRcdFx0XHRvblVwZGF0ZTogZnVuY3Rpb24oKSB7XG5cblx0XHRcdFx0XHR2YXIgdHJhbnNmb3JtID0gJ3RyYW5zbGF0ZVgoJyArIGN1cnJlbnRIb3ZlckVsLnR3ZWVuLnggKyAnJSknO1xuXG5cdFx0XHRcdFx0Y3VycmVudEhvdmVyRWwuc3R5bGUubXNQcm9wZXJ0eSA9IHRyYW5zZm9ybTtcblx0XHRcdFx0XHRjdXJyZW50SG92ZXJFbC5zdHlsZS53ZWJraXRUcmFuc2Zvcm0gPSB0cmFuc2Zvcm07XG5cdFx0XHRcdFx0Y3VycmVudEhvdmVyRWwuc3R5bGUudHJhbnNmb3JtID0gdHJhbnNmb3JtO1xuXHRcdFx0XHR9LFxuXHRcdFx0XHRvbkNvbXBsZXRlOiBmdW5jdGlvbigpIHtcblxuXHRcdFx0XHRcdGlmIChyZW1vdmUpIHtcblxuXHRcdFx0XHRcdFx0X2VsLnJlbW92ZUNoaWxkKGN1cnJlbnRIb3ZlckVsKTtcblx0XHRcdFx0XHRcdGN1cnJlbnRIb3ZlckVsID0gbnVsbDtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblx0XHRcdH0pXG5cdFx0fVxuXHR9XG5cblx0ZnVuY3Rpb24gc3RyaXBTbGFzaGVzKHN0cmluZykge1xuXG5cdFx0cmV0dXJuIHN0cmluZy5yZXBsYWNlKC9cXC8vZywgJycpO1xuXHR9XG5cblx0dGhpcy5pbml0ID0gaW5pdDtcbn07IiwidmFyIFNUQVRVU19PSz0gMjAwLFxuXHRSRUFEWV9TVEFURV9ET05FID0gNDtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbih1cmwsIGNhbGxiYWNrLCBzZXR0aW5ncykge1xuXG5cdGlmICghc2V0dGluZ3MpIHtcblx0XHRzZXR0aW5ncyA9IHt9O1xuXHR9XG5cblx0dmFyIHJlcXVlc3QgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKSxcblx0XHRtZXRob2QgPSBzZXR0aW5ncy5tZXRob2QgfHwgJ0dFVCc7XG5cblxuXHQvLyBuZWVkcyB0byBiZSBvcGVuIGJlZm9yZSByZXNwb25zZVR5cGUgaXMgc2V0XG5cdHJlcXVlc3Qub3BlbihtZXRob2QsIHVybCwgdHJ1ZSk7XG5cblx0aWYgKHNldHRpbmdzLnJlc3BvbnNlVHlwZSkge1xuXHRcdHJlcXVlc3QucmVzcG9uc2VUeXBlID0gc2V0dGluZ3MucmVzcG9uc2VUeXBlO1xuXHR9XG5cblx0cmVxdWVzdC5vbnJlYWR5c3RhdGVjaGFuZ2UgPSBmdW5jdGlvbigpIHtcblxuXHRcdHZhciByZXNwb25zZTtcblxuXHRcdGlmIChyZXF1ZXN0LnJlYWR5U3RhdGUgPT09IFJFQURZX1NUQVRFX0RPTkUpIHtcblxuXHRcdFx0aWYgKHJlcXVlc3Quc3RhdHVzID09PSBTVEFUVVNfT0spIHtcblxuXHRcdFx0XHRyZXNwb25zZSA9IHJlcXVlc3QucmVzcG9uc2U7XG5cblx0XHRcdFx0Y2FsbGJhY2socmVzcG9uc2UpO1xuXG5cdFx0XHR9IGVsc2Uge1xuXG5cdFx0XHRcdGNvbnNvbGUuZXJyb3IocmVxdWVzdCk7XG5cdFx0XHR9XG5cdFx0fVxuXHR9O1xuXG5cdGlmIChzZXR0aW5ncy5wYXJhbXMpIHtcblx0XHRyZXF1ZXN0LnNldFJlcXVlc3RIZWFkZXIoJ0NvbnRlbnQtbGVuZ3RoJywgc2V0dGluZ3MucGFyYW1zLmxlbmd0aCk7XG5cdH1cblxuXHRyZXF1ZXN0LnNlbmQoc2V0dGluZ3MucGFyYW1zKTtcbn07XG4iLCJ2YXIgREVWSUNFX1BJWEVMX1JBVElPID0gd2luZG93LmRldmljZVBpeGVsUmF0aW8gfHwgMSxcblx0X2JhY2tpbmdTdG9yZVJhdGlvLFxuXHRfY2FudmFzUGl4ZWxSYXRpbyxcblx0Y29udGV4dCA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJyk7XG5cbl9iYWNraW5nU3RvcmVSYXRpbyA9IGdldEJhY2tpbmdTdG9yZVJhdGlvKGNvbnRleHQpO1xuX2NhbnZhc1BpeGVsUmF0aW8gPSBERVZJQ0VfUElYRUxfUkFUSU8gLyBfYmFja2luZ1N0b3JlUmF0aW87XG5cbmZ1bmN0aW9uIGdldEJhY2tpbmdTdG9yZVJhdGlvKGNvbnRleHQpIHsvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cblx0cmV0dXJuIGNvbnRleHQud2Via2l0QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuXHRcdGNvbnRleHQubW96QmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuXHRcdGNvbnRleHQubXNCYWNraW5nU3RvcmVQaXhlbFJhdGlvIHx8XG5cdFx0Y29udGV4dC5vQmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fFxuXHRcdGNvbnRleHQuYmFja2luZ1N0b3JlUGl4ZWxSYXRpbyB8fCAxO1xufVxuXG5tb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKGNhbnZhc0VsLCB3aWR0aCwgaGVpZ2h0KSB7XG5cblx0dmFyIG9sZFdpZHRoLFxuXHRcdG9sZEhlaWdodCxcblx0XHRjb250ZXh0ID0gY2FudmFzRWwuZ2V0Q29udGV4dCgnMmQnKTtcblxuXHRjYW52YXNFbC53aWR0aCA9IHdpZHRoO1xuXHRjYW52YXNFbC5oZWlnaHQgPSBoZWlnaHQ7XG5cblx0aWYoREVWSUNFX1BJWEVMX1JBVElPICE9PSBfYmFja2luZ1N0b3JlUmF0aW8pIHtcblxuXHRcdG9sZFdpZHRoID0gY2FudmFzRWwud2lkdGg7XG5cdFx0b2xkSGVpZ2h0ID0gY2FudmFzRWwuaGVpZ2h0O1xuXG5cdFx0Y2FudmFzRWwud2lkdGggPSBvbGRXaWR0aCAqIF9jYW52YXNQaXhlbFJhdGlvO1xuXHRcdGNhbnZhc0VsLmhlaWdodCA9IG9sZEhlaWdodCAqIF9jYW52YXNQaXhlbFJhdGlvO1xuXG5cdFx0Y2FudmFzRWwuc3R5bGUud2lkdGggPSBvbGRXaWR0aCArICdweCc7XG5cdFx0Y2FudmFzRWwuc3R5bGUuaGVpZ2h0ID0gb2xkSGVpZ2h0ICsgJ3B4JztcblxuXHRcdGNvbnRleHQuc2NhbGUoX2NhbnZhc1BpeGVsUmF0aW8sIF9jYW52YXNQaXhlbFJhdGlvKTtcblx0fVxufTsiXX0=
