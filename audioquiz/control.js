/* globals Game, GamepadListener */
Game.audioFiles = [
	'frozen heart (frozen).ogg',
	'ghostbusters.ogg',
	'hakuna matata (lion king).ogg',
	'harry potter.ogg',
	'indiana jones.ogg',
	'i\'ve got a dream (tangled).ogg',
	'katy perry dark horse.ogg',
	'lorde royals.ogg',
	'macarena.ogg',
	'macklemore thrift shop.ogg',
	'mana mana (muppets).ogg',
	'men in black.ogg',
	'mission impossible.ogg',
	'move it (madagascar).ogg',
	'pingu.ogg',
	'silento watch me.ogg',
	'star wars.ogg',
	'teletubbies.ogg',
	'thomas.ogg',
	'we will rock you.ogg',
	'ymca.ogg'
];
Game.currentTrack = -1;
Game.audioElement = document.getElementById('audio');
Game.responseRow = document.getElementById('response');
Game.answered = false;
Game.scoreKey = 'audioQuizScores';
Game.broadcastName = 'audioQuiz';
Game.randomise = function() {
	var tracks = [];
	var i;
	for (i = 0; i < this.audioFiles.length; i++) {
		tracks.push({ src: this.audioFiles[i], sort: Math.random() });
	}
	tracks.sort(function(a, b) {
		return a.sort - b.sort;
	});
	for (i = 0; i < this.audioFiles.length; i++) {
		this.audioFiles[i] = tracks[i].src;
	}
};
Game.nextTrack = function() {
	for (var i = 0; i < 4; i++) {
		if (this.blocked[i]) {
			this.blocked[i] = false;
			this.setIndicator(i, 'blocked', true);
		}
	}

	if (this.audioFiles.length <= ++this.currentTrack) {
		console.log('End of game');
		return;
	}
	console.log('Track is ' + this.audioFiles[this.currentTrack]);
	this.audioElement.src = 'audio/' + encodeURIComponent(this.audioFiles[this.currentTrack]);
	this.answered = false;
};
Game.buttonPressed = function({ team, which }) {
	console.log(team + ' pressed the button');
	if (this.answered || this.audioElement.paused || this.blocked[team] || which !== 0) {
		return;
	}

	this.currentTeam = team;
	this.audioElement.pause();
	this.setIndicator(team, 'lit', false);
	this.responseRow.hidden = false;
};
Game.response = function(correct) {
	this.responseRow.hidden = true;
	this.setIndicator(this.currentTeam, 'lit', true);
	var score = (this.audioElement.duration - this.audioElement.currentTime) / this.audioElement.duration;
	if (correct) {
		this.scores[this.currentTeam] += Math.round(score * 40);
		this.saveScores();
		this.answered = true;
	} else {
		this.scores[this.currentTeam] -= Math.round(score * 20);
		this.saveScores();
		this.blocked[this.currentTeam] = true;
		this.setIndicator(this.currentTeam, 'blocked', false);
		this.audioElement.play();
	}
	delete this.currentTeam;
};

Game.init();
Game.randomise();
Game.nextTrack();
GamepadListener.init();
