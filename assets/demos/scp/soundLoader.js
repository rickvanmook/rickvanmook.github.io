(function() {
	var SAMPLE_RATE = audioContext.sampleRate,
		PATH = 'audio/soundscape',
		EXTENSION_OGG = '.ogg',
		EXTENSION_M4A = '.m4a',
		AUDIO_EXTENSION = supportsVorbis ? EXTENSION_OGG : EXTENSION_M4A,
		AUDIO_FILE_NUM = 5,
		CHANNELS = 4;

	var buffer = audioContext.createBuffer( CHANNELS, 1, SAMPLE_RATE),
		loadCount = 0,
		isLoading = false;

	/*****************************
	 * LOADING AND PARSING UTILS *
	 *****************************/

	function loadNextSound() {

		if(!isLoading && loadCount < AUDIO_FILE_NUM) {

			isLoading = true;

			loadCount++;
			return soundLoader(PATH + loadCount + AUDIO_EXTENSION)
				.then(updateBuffer)
				.then(function(){

					isLoading = false;

					window.updateBuffer(buffer);

					loadNextSound();
				})
				.catch(function (error) {
					// Handle any error from all above steps
					console.error(error);
				})

		} else {

			var deferred = Q.defer();
			deferred.resolve();
			return deferred.promise;
		}
	}

	function updateBuffer(newBuffers) {

		if(buffer !== null) {
			buffer = appendBuffer(buffer, newBuffers);
		}
	}


	function soundLoader(url) {


		var deferred = Q.defer(),
			taskList = [],
			progresses = [0,0],
			urls;

		if(AUDIO_EXTENSION === EXTENSION_M4A) {
			urls = [
				url.replace(AUDIO_EXTENSION, 'A'+AUDIO_EXTENSION),
				url.replace(AUDIO_EXTENSION, 'B'+AUDIO_EXTENSION)
			];

		} else {

			urls = [url];
		}

		for(var i = 0; i < urls.length; i++) {
			taskList.push(loadAudio(urls[i]).then(decodeAudio));
		}



		Q.all(taskList)
			.then(function(buffers){
					deferred.resolve(buffers);
				},
				noop);

		return deferred.promise;
	}

	function appendBuffer(buffer, newBuffers) {

		var bufferNum = newBuffers.length,
			channelCount = 0,
			newBufferLength = 0;

		for(var i = 0; i < bufferNum; i++) {

			newBufferLength = Math.max(newBufferLength, newBuffers[i].length);
		}


		var tmpBuffer = audioContext.createBuffer( CHANNELS, (buffer.length + newBufferLength), SAMPLE_RATE );

		newBuffers.forEach(function(newBuffer){

			for (var i = 0; i < newBuffer.numberOfChannels; i++, channelCount++) {

				var channel = tmpBuffer.getChannelData(channelCount);

				channel.set(buffer.getChannelData(channelCount), 0);
				channel.set(newBuffer.getChannelData(i), buffer.length);
			}
		});


		return tmpBuffer;
	}


	function loadAudio(url) {

		return ajaxRequest(url,{responseType:'arraybuffer'});
	}

	function decodeAudio(audioArray) {

		var deferred = Q.defer();

		audioContext.decodeAudioData(audioArray, function(buffer) {

			deferred.resolve(buffer);

		}, function(e){
			throw new Error('Can\'t decode audio');
		});

		return deferred.promise;
	}


	window.loadNextSound = loadNextSound;

})();