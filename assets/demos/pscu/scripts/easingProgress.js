(function(global){

	var easing = {};

	easing.linear = function (currentIteration) {
		return currentIteration;
	};

	easing.quadIn = function (currentIteration) {
		return currentIteration * currentIteration;
	};

	easing.quadOut = function(currentIteration) {
		return -currentIteration * (currentIteration - 2);
	};

	easing.quadInOut = function(currentIteration) {
		if ((currentIteration /= 0.5) < 1) {
			return 0.5 * currentIteration * currentIteration;
		}
		return -0.5 * ((--currentIteration) * (currentIteration - 2) - 1);
	};

	easing.cubicIn = function(currentIteration) {
		return Math.pow(currentIteration, 3);
	};

	easing.cubicOut = function(currentIteration) {
		return (Math.pow(currentIteration - 1, 3) + 1);
	};

	easing.cubicInOut = function(currentIteration) {
		if ((currentIteration /= 0.5) < 1) {
			return 0.5 * Math.pow(currentIteration, 3);
		}
		return 0.5 * (Math.pow(currentIteration - 2, 3) + 2);
	};

	easing.quartIn = function(currentIteration) {
		return Math.pow (currentIteration, 4);
	};

	easing.quartOut = function(currentIteration) {
		return -(Math.pow(currentIteration - 1, 4) - 1);
	};

	easing.quartInOut = function(currentIteration) {
		if ((currentIteration /= 0.5) < 1) {
			return 0.5 * Math.pow(currentIteration, 4);
		}
		return -1/2 * (Math.pow(currentIteration - 2, 4) - 2);
	};

	easing.quintIn = function(currentIteration) {
		return Math.pow (currentIteration, 5);
	};

	easing.quintOut = function(currentIteration) {
		return (Math.pow(currentIteration - 1, 5) + 1);
	};

	easing.quintInOut = function(currentIteration) {
		if ((currentIteration /= 0.5) < 1) {
			return 0.5 * Math.pow(currentIteration, 5);
		}
		return 0.5 * (Math.pow(currentIteration - 2, 5) + 2);
	};

	easing.sineIn = function(currentIteration) {
		return (1 - Math.cos(currentIteration * (Math.PI / 2)));
	};

	easing.sineOut = function(currentIteration) {
		return Math.sin(currentIteration * (Math.PI / 2));
	};

	easing.sineInOut = function(currentIteration) {
		return 0.5 * (1 - Math.cos(Math.PI * currentIteration));
	};

	easing.expoIn = function(currentIteration) {
		return Math.pow(2, 10 * (currentIteration - 1));
	};

	easing.expoOut = function(currentIteration) {
		return (-Math.pow(2, -10 * currentIteration) + 1);
	};

	easing.expoInOut = function(currentIteration) {
		if ((currentIteration /= 0.5) < 1) {
			return 0.5 * Math.pow(2, 10 * (currentIteration - 1));
		}
		return 0.5 * (-Math.pow(2, -10 * --currentIteration) + 2);
	};

	easing.circIn = function(currentIteration) {
		return (1 - Math.sqrt(1 - currentIteration * currentIteration));
	};

	easing.circOut = function(currentIteration) {
		return Math.sqrt(1 - (currentIteration = currentIteration - 1) * currentIteration);
	};

	easing.circInOut = function(currentIteration) {
		if ((currentIteration /= 0.5) < 1) {
			return 0.5 * (1 - Math.sqrt(1 - currentIteration * currentIteration));
		}
		return 0.5 * (Math.sqrt(1 - (currentIteration -= 2) * currentIteration) + 1);
	};

	easing.backIn = function (currentIteration, overShoot) {

		if (overShoot == undefined) overShoot = 1.70158;
		return (currentIteration)*currentIteration*((overShoot+1)*currentIteration - overShoot);
	};

	easing.backOut = function (currentIteration, overShoot) {
		if (overShoot == undefined) overShoot = 1.70158;

		return (currentIteration=currentIteration-1)*currentIteration*((overShoot+1)*currentIteration + overShoot) + 1;
	};

	easing.backInOut = function (currentIteration, overShoot) {

		if (!overShoot) overShoot = 1.70158;

		if ((currentIteration/=0.5) < 1) return 0.5*(currentIteration*currentIteration*(((overShoot*=(1.525))+1)*currentIteration - overShoot));
		return 0.5*((currentIteration-=2)*currentIteration*(((overShoot*=(1.525))+1)*currentIteration + overShoot) + 2);
	};



	easing.inElastic = function (currentIteration, amplitude, period) {

		var s;

		if (currentIteration==0) return 0;
		if (currentIteration==1) return 1;

		if(!amplitude) amplitude = 1;
		if (!period) period = .3;


		if (amplitude < 1) {
			amplitude=1;
			s = period/4;
		}
		else {
			s = period/(2*Math.PI) * Math.asin (1/amplitude);
		}

		return -(amplitude*Math.pow(2,10*(currentIteration-=1)) * Math.sin( (currentIteration-s)*(2*Math.PI)/period ));
	};



	easing.outElastic = function (currentIteration, amplitude, period) {

		var s;

		if (currentIteration==0) return 0;
		if (currentIteration==1) return 1;

		if(!amplitude) amplitude = 1;
		if (!period) period = .3;

		if (amplitude < 1) {

			amplitude = 1;
			s = period/4;
		}
		else {
			s = period/(2*Math.PI) * Math.asin (1/amplitude);
		}



		return amplitude*Math.pow(2,-10*currentIteration) * Math.sin( (currentIteration-s)*(2*Math.PI)/period ) + 1;
	};



	easing.inOutElastic = function (currentIteration, amplitude, period) {


		var s;

		if (currentIteration==0) return 0;
		if (currentIteration==1) return 1;

		if(!amplitude) amplitude = 1;
		if (!period) period = (.44996);

		if (amplitude < Math.abs(1)) {
			amplitude=1;
			s=period/4;
		}
		else {
			s = period/(2*Math.PI) * Math.asin (1/amplitude);
		}

		if (currentIteration < 1) {
			return -.5*(amplitude*Math.pow(2,10*(currentIteration-=1)) * Math.sin( (currentIteration-s)*(2*Math.PI)/period ));
		}

		return amplitude*Math.pow(2,-10*(currentIteration-=1)) * Math.sin( (currentIteration-s)*(2*Math.PI)/period )*.5 + 1;
	};




	// bounce easing in
	var bounceIn = function (currentTime) {
		return 1 - bounceOut(1-currentTime);
	};

	// bounce easing out
	var bounceOut = function (currentTime) {
		if ((currentTime/=1) < (1/2.75)) {
			return 7.5625*currentTime*currentTime;
		} else if (currentTime < (2/2.75)) {
			return 7.5625*(currentTime-=(1.5/2.75))*currentTime + .75;
		} else if (currentTime < (2.5/2.75)) {
			return 7.5625*(currentTime-=(2.25/2.75))*currentTime + .9375;
		} else {
			return 7.5625*(currentTime-=(2.625/2.75))*currentTime + .984375;
		}
	};

	// bounce easing in/out
	var bounceInOut = function (currentTime) {
		if (currentTime < .5) return bounceIn((currentTime*2) / 2);
		return bounceOut(currentTime / 2 + .5);
	};

	easing.bounceOut = bounceOut;
	easing.bounceIn = bounceIn;
	easing.bounceInOut = bounceInOut;

	global.easing = easing;

}(this));