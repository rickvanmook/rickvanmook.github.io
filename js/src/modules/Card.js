var resizeCanvas = require('../utils/resizeCanvas');

var COUNTER = 0;

exports.selector = '.js-card';
exports.constructor = function() {

	var _parent,
		_videoSrc,
		_isAlive,
		_videoEl,
		_sizingEl,
		_canvasEl,
		_context,
		_progress,
		_loadedCount,
		_canvasWidth,
		_canvasHeight,
		_imgUrl,
		_imageEl;

	var _id = COUNTER++;



	function init(el) {

		_parent = el;

		_sizingEl = el.getElementsByClassName('js-card__size')[0];
		_canvasEl = el.getElementsByClassName('js-card__canvas')[0];
		_imageEl = el.getElementsByClassName('js-card__image')[0];
		_context = _canvasEl.getContext('2d');
		_progress = {p:0};
		_loadedCount = 0;
		_videoSrc = _canvasEl.getAttribute('data-mp4');

		inView();
	}

	function destroy() {

		_isAlive = false;

		_videoEl = null;
		TweenLite.killTweensOf(_progress);

		_parent.removeEventListener('mouseenter', onMouseOver);
		_parent.removeEventListener('mouseleave', onMouseOut);
		window.removeEventListener('resize', onResize);
	}

	function onMouseOver() {

		_isAlive = true;
		redraw();

		_videoEl.play();

		TweenLite.to(_progress, 0.5, {
			p:1,
			ease: Cubic.easeInOut
		})
	}

	function onMouseOut() {

		TweenLite.to(_progress, 0.5, {
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

		_videoEl = document.createElement('video');
		_videoEl.loop = true;
		_videoEl.src = _videoSrc;

		window.addEventListener('resize', onResize);
		onResize();

		redraw();

		_parent.addEventListener('mouseenter', onMouseOver);
		_parent.addEventListener('mouseleave', onMouseOut);
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
			secondHalfProgress = Math.max(0, (progress - 0.5) * 2);

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

		_context.drawImage(_videoEl, 0, 0, _canvasWidth, _canvasHeight);


		_context.restore();

		function lineTo(x, y) {

			_context.lineTo(x, y);
		}
	}

	function onResize() {

		_canvasWidth = Math.ceil(_sizingEl.offsetWidth);
		_canvasHeight = Math.ceil(_sizingEl.offsetHeight);

		_imageEl.setAttribute('width', _canvasWidth);
		_imageEl.setAttribute('height', _canvasHeight);

		resizeCanvas(_canvasEl, _canvasWidth, _canvasHeight);

		if(!_isAlive) {

			redraw();
		}
	}

	this.init = init;
	this.destroy = destroy;
};