var CLASS_PART = 'part',
	CLASS_SCENE = 'scene',
	CLASS_LAYER = 'layer',
	CLASS_SPRITE = 'sprite';

var AbstractAnimationObject = function() {

	this.construct = construct;
	this.init = function(){};
};


function construct(element, parentProgressSignal) {

	var _this = this,
		_currentProgress,
		_progressEasing = element.getAttribute('easing'),
		_progressStart = element.getAttribute('start') || 0,
		_progressEnd = element.getAttribute('end')  || 1,
		_progressLength = _progressEnd - _progressStart;

	_this.element = element;
	_this.ownProgressUpdated = new Signal();
	_this.children = getChildren();

	parentProgressSignal.add(function(newProgress){


		var requestedProgress = (Math.max(_progressStart, Math.min(_progressEnd, newProgress)) - _progressStart) / _progressLength;

		if(easing[_progressEasing]) requestedProgress = easing[_progressEasing](requestedProgress);

		if(requestedProgress != _currentProgress) {

			_currentProgress = requestedProgress;
			_this.ownProgressUpdated.dispatch(_currentProgress, _this.element);
		}
	}, _this);


	function getChildren() {

		var childClass;

		if(containsClass(CLASS_PART)) {

			childClass = CLASS_SCENE;

		} else if(containsClass(CLASS_SCENE)) {

			childClass = CLASS_LAYER;

		} else if(containsClass(CLASS_LAYER)) {

			childClass = CLASS_SPRITE;
		}

		if(childClass) {

			return parseAnimationObjects.parse(element, childClass, _this.ownProgressUpdated)

		} else {

			return false;
		}
	}

	function containsClass(className) {

		return _this.element.classList.contains(className)
	}
}