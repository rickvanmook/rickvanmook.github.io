var NavLink = require('./header/NavLink'),
	HomeLink = require('./header/HomeLink'),
	NAV_LINK_SELECTOR = 'js-navLink',
	HOME_LINK_SELECTOR = 'js-homeLink',
	doc = document;



initModules(NAV_LINK_SELECTOR, NavLink);
initModules(HOME_LINK_SELECTOR, HomeLink);

function initModules(className, constructor) {

	var els = doc.getElementsByClassName(className),
		i;

	for(i = 0; i < els.length; i++) {

		new constructor(els[i]);
	}
}

