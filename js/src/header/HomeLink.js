module.exports = HomeLink;


function HomeLink(el) {

	var letters = 'RickvanMok',
		shortName = 'RvMook       ',
		longName =  'Rick van Mook';

	window.el = el;
	window.transitionToShort = transitionToShort;
	window.transitionToLong = transitionToLong;
	window.findLetter = findLetter;
	window.transitionTo = transitionTo;

	function transitionToShort() {

		transitionTo(shortName, true);
	}

	function transitionToLong() {

		transitionTo(longName);
	}


	function transitionTo(string, isBackwards) {

		var i,
			index,
			delay;

		for(i = 1; i < string.length; i++) {

			if(isBackwards) {

				index = string.length - i;
				delay = index * 0.5;

			} else {

				index = i;
				delay = i*0.5;
			}

			findLetter(i, string, i, delay);
		}
	}

	function findLetter(index, result, stepsRemaining, delay) {

		var hasDelay = delay > 0,
			isDone = stepsRemaining < 0,
			char;

		if(!hasDelay) {

			char = isDone ?  result.substr(index, 1) : letters.substr(Math.random()*letters.length, 1);

			el.innerHTML = replaceAt(el.innerHTML, index, char);
		}

		if(!isDone || hasDelay) {

			if(hasDelay) {

				delay--;

			} else {

				stepsRemaining--;
			}

			setTimeout(function(){

				findLetter(index, result, stepsRemaining, delay);
			}, 45);
		}
	}
}

function replaceAt(string, index, character) {
	return string.substr(0, index) + character + string.substr(index+character.length);
}