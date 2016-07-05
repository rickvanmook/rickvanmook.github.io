var remove = function(){

	this.init = function() {

		this.display = "";

		var before = this.element.getAttribute('before') || 0;
		var after = this.element.getAttribute('after') || 1;

		this.ownProgressUpdated.add(function(newProgress){


			var newDisplay = (newProgress <= before || newProgress >= after) ? "none" : "";
			if(newDisplay != this.display) {
				this.element.style.display = this.display = newDisplay;
			}


		}, this);
	}
};

remove.prototype = new AbstractAnimationObject();
remove.prototype.constructor = remove;

window.prototypes.remove = remove;