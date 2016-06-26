var isPlaying = true,
	currentTime = 0,
	currentProgress = 0,
	totalDuration = 0,
	currentLoaded = 0,
	bufferStartOffset = 0,
	currentBuffer = null,
	currentBufferPlayer = null;


// function play(ignorePlayState) { updateIsPlaying(true, ignorePlayState); }
// function pause(ignorePlayState) { updateIsPlaying(false, ignorePlayState); }
function getIsPlaying() {return isPlaying; }
function getCurrentTime() {return currentTime; }
function getCurrentLoaded() {return currentLoaded; }
function getCurrentProgress() {return currentProgress; }

// scpSignals.locationDataUpdated.add(function(newData) {
//
// 	totalDuration = Math.floor(newData.duration);
// 	reset();
// 	stop();
// 	updateCurrentLoaded(0);
// });

function updateIsPlaying(newIsPlaying, ignorePlayState) {

	if(isPlaying !== newIsPlaying) {

		isPlaying = newIsPlaying;

		if(isPlaying) {
			play();
		} else {
			pause();
		}
	}
}


function scrub(target) {

	var normalizedTarget = Math.min(currentLoaded, target),
		newStartOffset = normalizedTarget * totalDuration;


	if(isPlaying) {
		stop();
		bufferStartOffset = newStartOffset;
		play();
	} else {

		bufferStartOffset = newStartOffset;

		var newTime = Math.floor(totalDuration * normalizedTarget);
		updateCurrentTime(newTime);
	}
}

function updateBuffer(newBuffer) {

	currentBuffer = newBuffer;
	updateCurrentLoaded(currentBuffer.duration/totalDuration);

	if(isPlaying && currentLoaded > 0) {

		pause();
		play(bufferStartOffset);
	}
}

window.updateBuffer = updateBuffer;

function play() {

	currentBufferPlayer = new BufferPlayer(currentBuffer);
	// currentBufferPlayer.timeUpdated.add(updateCurrentTime);
	// currentBufferPlayer.bufferEnded.add(onBufferEnded);
	currentBufferPlayer.start(bufferStartOffset);
}

function pause() {

	bufferStartOffset += stop();
}

function stop() {

	var stopOffset = 0;

	if(currentBufferPlayer !== null) {
		stopOffset = currentBufferPlayer.stop();
		currentBufferPlayer = null;
	}

	return stopOffset;
}

function reset() {
	isPastIntro = false;
	bufferStartOffset = 0;
	updateCurrentTime(0);
	updateCurrentLoaded(0);
}

function updateCurrentTime(newTime) {

	newTime = Math.min(totalDuration, Math.max(0, newTime));

	if(currentTime !== newTime) {

		currentTime = newTime;
		currentProgress = Math.min(1, currentTime / totalDuration);
	}
}

function updateCurrentLoaded(newCurrentLoaded) {

	currentLoaded = Math.round(newCurrentLoaded * 100) / 100;
}


function BufferPlayer(buffer) {

	var source = audioContext.createBufferSource(),
		isTicking = false,
		tickerTimeout = false,
		duration = buffer.duration,
		currentTime,
		startOffset,
		startTime;

	source.buffer = buffer;
	source.onended = function(){
		console.log('onended');
	};

	updateSource(source);

	this.start = function(initialStartOffset) {

		startOffset = initialStartOffset;
		startTime = audioContext.currentTime;
		isTicking = true;
		timeTicker();
		source.start(0, startOffset % duration);
	};

	this.stop = function() {

		source.stop(0);
		source.onended = null;
		source = null;
		isTicking = false;

		return audioContext.currentTime - startTime;
	};


	function timeTicker() {

		if(isTicking) {

			var newTime = Math.round(Math.min(duration, audioContext.currentTime-startTime+startOffset));

			if(currentTime !== newTime) {
				currentTime = newTime;
			}

			if(typeof tickerTimeout === 'number') {
				clearTimeout(tickerTimeout);
				tickerTimeout = false;
			}

			requestAnimationFrame(timeTicker);
		}
	}
}