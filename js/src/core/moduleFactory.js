var _moduleConfigs = [
		require('../modules/Analytics'),
		require('../modules/AnyLink'),
		require('../modules/NavLink'),
		require('../modules/Card')
	],
	_currentModules = [];

function run(parentEl) {

	if(!parentEl) {

		parentEl = document;
	}

	destroyModules();

	_currentModules = [];

	createModules(parentEl);
}

function destroyModules() {

	var i;

	for(i = 0; i < _currentModules.length; i++) {

		_currentModules[i].destroy();
	}
}

function createModules(parentEl) {

	_moduleConfigs.forEach(function(config){


		var els = parentEl.querySelectorAll(config.selector),
			module,
			moduleEl,
			i;

		for(i = 0; i < els.length; i++) {

			moduleEl = els[i];

			module = new config.constructor();

			module.init(moduleEl);

			if(!moduleEl.classList.contains('js-moduleIgnore')) {

				_currentModules.push(module);
			}
		}
	});
}

exports.run = run;