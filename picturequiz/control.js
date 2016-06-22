/* globals Game, GamepadListener, db */
var blankImageURL = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAADElEQVQImWNgoBMAAABpAAFEI8ARAAAAAElFTkSuQmCC';
Game.pictureIndex = -1;
Game.paused = true;
Game.currentImageDisplay = document.querySelector('div#current > img');
Game.currentImageDisplay.src = blankImageURL;
Game.nextButton = document.getElementById('nextButton');
Game.responseButtons = document.getElementById('response');
Game.nextImageDisplay = document.querySelector('div#next > img');
Game.scoreKey = 'pictureQuizScores';
Game.broadcastName = 'pictureQuiz';
Game.buzzerFiles = ['missile.mp3', 'motorbike.mp3', 'submarine2.mp3', 'aeroplane.mp3'];

Game.handleBroadcast = function(messageData) {
	switch (messageData.action) {
	case 'stop':
		Game.paused = true;
		Game.nextButton.hidden = false;
		break;
	case 'scoresUpdated':
		Game.loadScores();
		break;
	}
};
Game.randomise = function() {
	return db.transaction('pictures').objectStore('pictures').getAllKeys().then(function(keys) {
		Game.pictures = [];
		var images = [];
		var i;
		for (i = 0; i < keys.length; i++) {
			images.push({ key: keys[i], sort: Math.random() });
		}
		images.sort(function(a, b) {
			return a.sort - b.sort;
		});
		for (i = 0; i < images.length; i++) {
			Game.pictures[i] = images[i].key;
		}
	}).then(function() {
		return db.transaction('pictures').objectStore('pictures').get(Game.pictures[Game.pictureIndex + 1]);
	}).then(function(image) {
		if (!image) {
			return;
		}

		var url = URL.createObjectURL(image.image);
		Game.nextImageDisplay.src = url;
	});
};
Game.startNextImage = function() {
	for (var i = 0; i < 4; i++) {
		if (this.blocked[i]) {
			this.blocked[i] = false;
			this.setIndicator(i, 'blocked', true);
		}
	}

	if (++this.pictureIndex >= this.pictures.length) {
		Game.currentImageDisplay.src = blankImageURL;
		Game.nextButton.hidden = true;
		console.log('End of game');
		return;
	}

	db.transaction('pictures').objectStore('pictures').get(this.pictures[this.pictureIndex]).then(function(image) {
		var url = URL.createObjectURL(image.image);
		console.log('Image is ' + url);

		Game.currentImageDisplay.src = url;
		Game.broadcaster.postMessage({
			action: 'startImage',
			src: url,
			blockout: image.blockout
		});
		Game.paused = false;
		Game.nextButton.hidden = true;

	}).then(function() {
		if (Game.pictureIndex + 1 >= Game.pictures.length) {
			Game.nextImageDisplay.src = blankImageURL;
			return;
		}
		return db.transaction('pictures').objectStore('pictures').get(Game.pictures[Game.pictureIndex + 1]);
	}).then(function(image) {
		if (!image) {
			return;
		}

		var url = URL.createObjectURL(image.image);
		Game.nextImageDisplay.src = url;
	});
};
Game.buttonPressed = function({ team, which }) {
	console.log(team + ' pressed button ' + which);
	if (this.paused || this.blocked[team] || which !== 0) {
		return;
	}

	this.currentTeam = team;
	this.paused = true;
	this.pause();
	this.setIndicator(team, 'lit', false);
	this.responseButtons.hidden = false;
};
Game.response = function(correct) {
	this.responseButtons.hidden = true;
	this.setIndicator(this.currentTeam, 'lit', true);
	if (correct) {
		this.postMessage({
			action: 'correctAnswer',
			team: this.currentTeam
		});
		this.reveal();
		this.nextButton.hidden = false;
	} else {
		this.postMessage({
			action: 'incorrectAnswer',
			team: this.currentTeam
		});
		this.blocked[this.currentTeam] = true;
		this.setIndicator(this.currentTeam, 'blocked', false);
		this.paused = false;
		this.resume();
	}
	delete this.currentTeam;
};
Game.pause = function() {
	this.postMessage({ action: 'pause' });
};
Game.resume = function() {
	this.postMessage({ action: 'resume' });
};
Game.reveal = function() {
	this.postMessage({ action: 'reveal' });
};

/* exported dbReady */
function dbReady() {
	Game.randomise();
}

Game.init();
GamepadListener.init();
