var STATUS_OK= 200,
	READY_STATE_DONE = 4;

module.exports = function(url, callback, settings) {

	if (!settings) {
		settings = {};
	}

	var request = new XMLHttpRequest(),
		method = settings.method || 'GET';


	// needs to be open before responseType is set
	request.open(method, url, true);

	if (settings.responseType) {
		request.responseType = settings.responseType;
	}

	request.onreadystatechange = function() {

		var response;

		if (request.readyState === READY_STATE_DONE) {

			if (request.status === STATUS_OK) {

				response = request.response;

				callback(response);

			} else {

				console.error(request);
			}
		}
	};

	if (settings.params) {
		request.setRequestHeader('Content-length', settings.params.length);
	}

	request.send(settings.params);
};
