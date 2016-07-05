// var matrixToArray = require('../../utils/matrixToArray');
// var prefixed = require('../../utils/modernizrPrefixed');

var scale = function(){

	this.init = function() {

		var fadeFrom = this.element.getAttribute("fadeFrom") || 1;
		var fadeTo = this.element.getAttribute("fadeTo") || 1;

		var fromX = this.element.getAttribute("fromX") || 1;
		var toX = this.element.getAttribute("toX") || 0;

		var fromY = this.element.getAttribute("fromY") || 1;
		var toY = this.element.getAttribute("toY") || 0;
		var postFix = this.element.getAttribute("postFix") || "";

		var fadeDifference = fadeFrom - fadeTo;
		var differenceX = fromX - toX;
		var differenceY = fromY - toY;



		this.ownProgressUpdated.add(function(newProgress){

			var fadeValue = fadeFrom-(newProgress*fadeDifference);
			var scaleX = 1;
			var scaleY = 1;
			if(differenceX != 0) scaleX = fromX-(newProgress*differenceX);
			if(differenceY != 0) scaleY = fromY-(newProgress*differenceY);

			this.element.style.opacity = fadeValue;
			this.element.style[prefixed.transform] = "scale(" + scaleX + "," + scaleY +") " + postFix;

		}, this);
	}
};





scale.prototype = new AbstractAnimationObject();
scale.prototype.constructor = scale;

window.prototypes.scale = scale;