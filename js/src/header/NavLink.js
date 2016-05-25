module.exports = NavLink;
var doc = document;

function NavLink(el) {

	el.addEventListener('mouseenter', addHover);

	function addHover() {

		el.removeEventListener('mouseenter', addHover);

		var currentHoverEl;

		currentHoverEl = doc.createElement('div');
		currentHoverEl.className = 'nav__link__hover';
		currentHoverEl.tween = {x:-100};

		el.appendChild(currentHoverEl);
		tweenTo(0);

		el.addEventListener('mouseleave', onMouseOut);

		function onMouseOut(e) {

			tweenTo(100, true);

			el.addEventListener('mouseenter', addHover);
			el.removeEventListener('mouseleave', onMouseOut);
		}

		function tweenTo(newX, remove) {

			var distance = (newX - currentHoverEl.tween.x) / 100,
				ease = newX > 0 ? Cubic.easeIn : Cubic.easeOut;


			TweenLite.to(currentHoverEl.tween, 0.35 * distance, {
				x:newX,
				ease: Cubic.easeInOut,
				onUpdate:function(){

					currentHoverEl.style.transform = 'translateX(' + currentHoverEl.tween.x + '%)';
				},
				onComplete:function(){

					if(remove){

						el.removeChild(currentHoverEl);
						currentHoverEl = null;
					}
				}
			})
		}
	}
}