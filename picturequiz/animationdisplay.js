/* globals GameDisplay */
GameDisplay.scoreKey = 'pictureQuizScores';
GameDisplay.broadcastName = 'pictureQuiz';
GameDisplay.handleBroadcast = function(messageData) {
	switch (messageData.action) {
	case 'correctAnswer':
		this.scores[messageData.team] += Math.round(40 - animation.currentTime * 0.0025);
		this.saveScores();
		break;
	case 'incorrectAnswer':
		this.scores[messageData.team] -= Math.floor((40 - animation.currentTime * 0.0025) / 2);
		this.saveScores();
		break;
	case 'startImage':
		image.style.visibility = 'hidden';
		image.src = messageData.src;
		before = messageData.before;
		after = messageData.after;
		break;
	case 'pause':
		animation.pause();
		break;
	case 'resume':
		animation.play();
		break;
	case 'reveal':
		if (animation.playState != 'finished') {
			animation.playbackRate = 10;
			animation.play();
		}
		break;
	}
};
GameDisplay.init();

var image = document.querySelector('img');
var before, after, animation;

image.onload = function() {
	animation = image.animate([before, after], {duration: 16000, iterations: 1});
	animation.onfinish = function() {
		GameDisplay.postMessage({
			action: 'stop'
		});
	};

	image.style.visibility = null;
	if (this.src.startsWith('blob:')) {
		URL.revokeObjectURL(this.src);
	}
};
