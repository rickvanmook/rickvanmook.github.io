// Which HTML element is the target of the event
function mouseTarget(e) {

	var target;

	if(e.target) {

		target = e.target;

	} else if(e.srcElement) {

		target = e.srcElement;
	}

	if(target.nodeType == 3) {// defeat Safari bug

		target = target.parentNode;
	}

	return target;
}

// Mouse position relative to the document
// From http://www.quirksmode.org/js/events_properties.html
function mousePositionDocument(e) {

	var posx = 0,
		posy = 0;

	if (e.pageX || e.pageY) {

		posx = e.pageX;
		posy = e.pageY;

	} else if (e.clientX || e.clientY) {

		posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
		posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
	}

	return {
		x : posx,
		y : posy
	};
}

// Find out where an element is on the page
// From http://www.quirksmode.org/js/findpos.html
function findPos(obj) {

	var curleft = 0,
		curtop = 0;

	if (obj.offsetParent) {
		do {
			curleft += obj.offsetLeft;
			curtop += obj.offsetTop;
		} while (obj = obj.offsetParent);
	}

	return {
		left : curleft,
		top : curtop
	};
}

module.exports = function(e) {

	var mousePosDoc = mousePositionDocument(e),
		target = mouseTarget(e),
		targetPos = findPos(target),
		posx = mousePosDoc.x - targetPos.left,
		posy = mousePosDoc.y - targetPos.top;

	return {
		x : posx,
		y : posy
	};
};