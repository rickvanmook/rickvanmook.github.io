require('./core/history');

var NavLink = require('./header/NavLink'),
	WorkImage = require('./modules/WorkImage'),
	NAV_LINK_SELECTOR = 'js-navLink',
	WORK_IMAGE_SELECTOR = 'js-workImage',
	doc = document;

initModules(NAV_LINK_SELECTOR, NavLink);
initModules(WORK_IMAGE_SELECTOR, WorkImage);

function initModules(className, constructor) {

	var els = doc.getElementsByClassName(className),
		i;

	for(i = 0; i < els.length; i++) {

		new constructor(els[i]);
	}
}

