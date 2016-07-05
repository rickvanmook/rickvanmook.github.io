var transform = Modernizr.prefixed('transform');
var transformOrigin = Modernizr.prefixed('transformOrigin');

function translateX2d(x) { return "translateX(" + x + ")"; }
function translateY2d(y) { return "translateY(" + y + ")"; }
function translate2d(x, y) { return "translate(" + x + "," + y + ")"; }

function translateX3d(x) { return "translate3d(" + x + ",0,0)"; }
function translateY3d(y) { return "translate3d(0," + y + ",0)"; }
function translate3d(x, y) { return "translate3d(" + x + ","+y+",0)"; }

var translateX;
var translateY;
var translate;

if(Modernizr.csstransforms3d) {
	translateX = translateX3d;
	translateY = translateY3d;
	translate = translate3d;
} else {
	translateX = translateX2d;
	translateY = translateY2d;
	translate = translate2d;
}

var prefixed = {
	translateX: translateX,
	translateY: translateY,
	translate: translate,

	transform: transform,
	transformOrigin: transformOrigin
};

window.prefixed = prefixed;


