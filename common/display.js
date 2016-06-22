var GameDisplay = {
	scores: null,
	scoreKey: 'gameScores',
	broadcaster: null,
	broadcastName: 'game',
	indicators: document.querySelectorAll('.indicator'),
	scoreDisplays: document.querySelectorAll('.score'),

	init: function() {
		this.loadScores();
		navigator.serviceWorker.register('/service-worker.js');
		navigator.serviceWorker.addEventListener('message', this);
		this.broadcaster = navigator.serviceWorker.controller;
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
		case 'setIndicator':
			this.setIndicator(message.data.team, message.data.className, message.data.remove);
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
		this.indicators[team].classList[remove ? 'remove' : 'add'](className);
	}
};
