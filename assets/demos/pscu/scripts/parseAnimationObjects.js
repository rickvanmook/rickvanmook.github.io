(function(){
var _prototypes = window.prototypes;

function parseAnimationObjects(parent, className, parentProgressSignal) {

	var animationEls = getChildrenByClassName(className, parent);
	var animationObjects = [];

	var i = 0;
	var max = animationEls.length;
	var animationObject;
	var prototype;
	var animationEl;

	for(i; i < max; i++) {

		animationEl = animationEls[i];

		var type = animationEl.getAttribute("type") || 'default';

		prototype = _prototypes[type];
		if(!prototype) {
			console.warn(type + " is not a valid animation type.");
			prototype = AbstractAnimationObject;
		}

		animationObject = new prototype();
		animationObject.construct(animationEl, parentProgressSignal);
		animationObject.init();
		animationObjects.push(animationObject);
	}

	return animationObjects;
}

function getChildrenByClassName(classname, parent)  {
	if(classname == "sprite") {

		var a = parseDirectChildren(parent, classname, "layer", []);

	} else {
		a = parent.getElementsByClassName(classname);
	}

	return a;
}



function parseDirectChildren(parent, targetName, breakingName, matches) {

	var children = parent.children;
	var max = children.length;

	var i, child;
	var targetRegExp = new RegExp('\\b' + targetName + '\\b');
	var breakingRegExp = new RegExp('\\b' + breakingName + '\\b');

	for(i = 0; i < max; i++) {
		child = children[i];

		if(breakingRegExp.test(child.className)) {

			continue;
		}

		if(targetRegExp.test(child.className)) {

			matches.push(child);
		}

		parseDirectChildren(child, targetName, breakingName, matches);
	}


	return matches;
}

	window.parseAnimationObjects = {
		parse: parseAnimationObjects
	}

})();