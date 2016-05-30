var resizeCanvas = require('../utils/resizeCanvas');

exports.selector = '.js-workImage';
exports.constructor = function() {

	var _parent,
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
		_image;

	function init(el) {

		var videoSrc;

		_isAlive = true;
		_parent = el;
		_videoEl = document.createElement('video');
		_sizingEl = el.getElementsByClassName('js-workImage__size')[0];
		_canvasEl = el.getElementsByClassName('js-workImage__canvas')[0];
		_context = _canvasEl.getContext('2d');
		_progress = {p:0};
		_loadedCount = 0;
		_imgUrl = _canvasEl.getAttribute('data-jpg');
		_image = new Image();

		_videoEl.src =  _canvasEl.getAttribute('data-mp4');
		_videoEl.loop= true;

		_image.onload = onLoaded;
		_image.src = _imgUrl;
	}

	function destroy() {

		_isAlive = false;
		_image.onload = null;

		_videoEl = null;
		TweenLite.killTweensOf(_progress);

		_parent.removeEventListener('mouseenter', onMouseOver);
		_parent.removeEventListener('mouseleave', onMouseOut);
		window.removeEventListener('resize', onResize);
	}

	function onMouseOver() {

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
			}
		})
	}


	function onLoaded() {

		window.addEventListener('resize', onResize);
		onResize();

		redraw();

		_parent.addEventListener('mouseenter', onMouseOver);
		_parent.addEventListener('mouseleave', onMouseOut);
	}



	function redraw() {

		_context.drawImage(_image, 0, 0, _canvasWidth, _canvasHeight);

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

		_canvasWidth = _sizingEl.offsetWidth;
		_canvasHeight = _sizingEl.offsetHeight;

		resizeCanvas(_canvasEl, _canvasWidth, _canvasHeight);
	}

	this.init = init;
	this.destroy = destroy;
};