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