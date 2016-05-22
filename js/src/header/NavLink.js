module.exports = NavLink;
var doc = document;

function NavLink(el) {

	el.addEventListener('mouseover', addHover);

	function addHover() {

		el.removeEventListener('mouseover', addHover);
		console.log('ok');
		var currentHoverEl;

		currentHoverEl = doc.createElement('div');
		currentHoverEl.className = 'nav__link__hover';
		currentHoverEl.tween = {x:-100};

		el.appendChild(currentHoverEl);
		tweenTo(0);

		el.addEventListener('mouseout', onMouseOut);

		function onMouseOut(e) {

			var e = event.toElement || event.relatedTarget;
			if (e.parentNode == this || e == this) {
				return;
			}

			tweenTo(100, true);

			el.addEventListener('mouseover', addHover);
			el.removeEventListener('mouseout', onMouseOut);
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