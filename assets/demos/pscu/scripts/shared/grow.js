var Grow = function(){

	this.init = function() {


		console.log('easing.backOut', easing.backOut);

		this.ownProgressUpdated.add(function(newProgress){

			var scaleY = newProgress != 0 ? easing.backOut(newProgress) : 0;

			this.element.style[Modernizr.prefixed('transform')] = "scale(" + newProgress + ", " + scaleY + ")";
			this.element.style.opacity = newProgress != 0 ? newProgress+0.5 : 0;

		}, this);
	}
};





Grow.prototype = new AbstractAnimationObject();
Grow.prototype.constructor = Grow;

window.prototypes.grow = Grow;