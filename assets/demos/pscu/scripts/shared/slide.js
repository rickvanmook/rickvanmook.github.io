// var prefixed = require('../../utils/modernizrPrefixed');

var METHOD_TRANSLATE = "translate";
//var METHOD_POSITION = "position";
//var METHOD_SIZE = "size";
//var METHOD_SCALE = "scale";

var slideIn = function(){

	this.init = function() {

		var element = this.element;

		var unitY = element.getAttribute("unit") || "%";
		var unitX = element.getAttribute("unit") || "%";

		var fromX = element.getAttribute("fromX") || 0;
		var toX = element.getAttribute("toX") || 0;
		unitX = element.getAttribute("unitX") || unitX;

		var fromY = element.getAttribute("fromY") || 0;
		var toY = element.getAttribute("toY") || 0;
		unitY = element.getAttribute("unitY") || unitY;

		var fadeFrom = element.getAttribute("fadeFrom") || 1;
		var fadeTo = element.getAttribute("fadeTo") || 1;

		var method = element.getAttribute("method") || METHOD_TRANSLATE;

		var differenceX = fromX - toX;
		var differenceY = fromY - toY;
		var differenceFade = fadeFrom - fadeTo;

		var slideMethod;
		var methods = {

			sizeX:sizeX,
			sizeY:sizeY,
			sizeXandY:sizeXandY,

			positionX:positionX,
			positionY:positionY,
			positionXandY:positionXandY,

			translateX:translateX,
			translateY:translateY,
			translateXandY:translateXandY,

			scaleX:scaleX,
			scaleY:scaleY,
			scaleXandY:scaleXandY
		};


		if(differenceX !=  0 && differenceY != 0) {
			slideMethod = methods[method + "XandY"];
		} else if(differenceX !=  0) {
			if(fromY != 0) {
				getY = function() { return fromY + unitY };
				slideMethod = methods[method + "XandY"];
			} else {
				slideMethod = methods[method + "X"];
			}

		} else if(differenceY !=  0) {

			if(fromX != 0) {
				getX = function() { return fromX + unitX };
				slideMethod = methods[method + "XandY"];
			} else {
				slideMethod = methods[method + "Y"];
			}

		}

		var fadeMethod;
		if(differenceFade != 0) {
			fadeMethod = function(newProgress) {
				var opacity = fadeFrom-(newProgress*differenceFade);

				this.element.style.display = opacity == 0 ? "none" : "";
				this.element.style.opacity = opacity;

			};
		}

		if(slideMethod || fadeMethod) this.ownProgressUpdated.add(function(newProgress){

			if(fadeMethod) fadeMethod.apply(this, [newProgress]);
			if(slideMethod) slideMethod.apply(this, [newProgress]);
		}, this);




		function sizeX(newProgress) { positionWidth(getX(newProgress)); }
		function sizeY(newProgress) { positionHeight(getY(newProgress)); }
		function sizeXandY(newProgress) { positionWidth(newProgress); positionHeight(newProgress); }


		function positionX(newProgress) { positionLeft(getX(newProgress)); }
		function positionY(newProgress) { positionTop(getY(newProgress)); }
		function positionXandY(newProgress) { positionX(newProgress); positionY(newProgress); }

		function translateX(newProgress) { translate(prefixed.translateX(getX(newProgress))); }
		function translateY(newProgress) { translate(prefixed.translateY(getY(newProgress))); }
		function translateXandY(newProgress) { translate(prefixed.translate(getX(newProgress),getY(newProgress))); }

		function scaleX(newProgress) { translate("scale("+getX(newProgress)+")"); }
		function scaleY(newProgress) { translate("scale("+getY(newProgress)+")"); }
		function scaleXandY(newProgress) { translate("scale("+getX(newProgress)+","+getY(newProgress)+")"); }



		function translate(translate) {

			element.style[prefixed.transform] = translate;
		}

		function positionWidth(width) { element.style.width = width; }
		function positionHeight(height) { element.style.height = height; }

		function positionTop(top) { element.style.top = top; }
		function positionLeft(left) { element.style.left = left; }

		function getY(newProgress) { return (fromY-(newProgress*differenceY)) + unitY; }
		function getX(newProgress) { return (fromX-(newProgress*differenceX)) + unitX; }
	}
};

slideIn.prototype = new AbstractAnimationObject();
slideIn.prototype.constructor = slideIn;

window.prototypes.slide = slideIn;