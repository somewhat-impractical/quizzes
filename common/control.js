var Game = {
	buzzerFiles: ['bell.mp3', 'bong.ogg', 'buzzer.mp3', 'positive.ogg'],
	blocked: [false, false, false, false],
	scores: null,
	scoreKey: 'gameScores',
	broadcaster: null,
	broadcastName: 'game',
	indicators: document.querySelectorAll('.indicator'),
	scoreDisplays: document.querySelectorAll('.score'),

	init: function() {
		this.loadScores();
		navigator.serviceWorker.register('/service-worker.js').then(() => {
			navigator.serviceWorker.addEventListener('message', this);
			this.broadcaster = navigator.serviceWorker.controller;
		});
	},
	handleEvent: function(message) {
		console.log(message.data);
		if (message.data.broadcastName != this.broadcastName) {
			return;
		}

		switch (message.data.action) {
		case 'scoresUpdated':
			this.loadScores();
			return;
		}
		if (typeof this.handleBroadcast == 'function') {
			this.handleBroadcast(message.data);
		}
	},
	postMessage: function(data) {
		data.broadcastName = this.broadcastName;
		this.broadcaster.postMessage(data);
	},
	buttonPressed: function({ team, which }) {
		console.log(team + ' pressed button ' + which);
	},
	addScore: function(team, amount) {
		if (isNaN(amount)) {
			return;
		}
		this.setScore(team, this.scores[team] + amount);
	},
	setScore: function(team, newScore) {
		this.scores[team] = newScore;
		this.saveScores();
	},
	loadScores: function() {
		var savedScores = localStorage.getItem(this.scoreKey);
		if (savedScores) {
			this.scores = JSON.parse(savedScores);
		} else {
			this.scores = [0, 0, 0, 0];
		}
		this.updateScoreDisplay();
	},
	saveScores: function() {
		localStorage.setItem(this.scoreKey, JSON.stringify(this.scores));
		this.updateScoreDisplay();
		this.postMessage({ action: 'scoresUpdated' });
	},
	updateScoreDisplay: function() {
		for (var i = 0; i < 4; i++) {
			this.scoreDisplays[i].textContent = this.scores[i];
		}
	},
	setIndicator: function(team, className, remove) {
		if (className == 'lit' && !remove) {
			new Audio('/common/sounds/' + this.buzzerFiles[team]).play();
		}

		this.indicators[team].classList[remove ? 'remove' : 'add'](className);
		this.postMessage({
			action: 'setIndicator',
			team: team,
			className: className,
			remove: remove
		});
	}
};

var GamepadListener = {
	init: function() {
		addEventListener('gamepadconnected', this.connected.bind(this));
		addEventListener('gamepaddisconnected', this.disconnected.bind(this));
		addEventListener('gamepadbuttondown', this.buttonDown.bind(this));
		addEventListener('gamepadbuttonup', this.buttonUp.bind(this));
	},
	getButton: function(event) {
		return event.gamepad.index * 20 + event.button;
	},
	getButtonInfo: function(button) {
		var team = Math.floor(button / 5);
		var which = button % 5;
		if (which)
			which = 5 - which;

		return {
			team: team,
			which: which,
			isRealTeam: team > -1 && team < 4
		};
	},
	connected: function(event) {
		console.info(event);
		document.querySelectorAll('.connecteddisplay')[event.gamepad.index].classList.add('connected');
	},
	disconnected: function(event) {
		console.info(event);
		document.querySelectorAll('.connecteddisplay')[event.gamepad.index].classList.remove('connected');
	},
	buttonDown: function(event) {
		console.info(event);
		var button = this.getButton(event);
		document.querySelectorAll('.button')[button].classList.add('pressed');

		var buttonInfo = this.getButtonInfo(button);
		Game.buttonPressed(buttonInfo);
	},
	buttonUp: function(event) {
		console.info(event);
		var button = this.getButton(event);
		document.querySelectorAll('.button')[button].classList.remove('pressed');
	}
};
