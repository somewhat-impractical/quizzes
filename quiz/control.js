/* globals Game, GamepadListener */
Game.valueInput = document.querySelector('#value > input[type="number"]');
Game.responseButtons = document.getElementById('response');
Game.scoreKey = 'quizScores';
Game.broadcastName = 'quiz';
Game.buzzerFiles = ['sizzle.mp3', 'minedud.mp3', 'splash.mp3', 'freeze.mp3'];
Game.ignored = [0, 0, 0, 0];
Game.buttonPressed = function({ team, which }) {
	console.log(team + ' pressed button ' + which);
	var ignoredUntil = this.ignored[team];
	var now = Date.now();
	this.ignored[team] = now + 500;
	if (this.currentTeam !== undefined || ignoredUntil > now || which !== 0) {
		return;
	}

	this.currentTeam = team;
	this.setIndicator(team, 'lit', false);
	this.responseButtons.hidden = false;
};
Game.response = function(correct) {
	var team = this.currentTeam;
	if (team !== undefined) {
		delete this.currentTeam;

		this.responseButtons.hidden = true;
		this.setIndicator(team, 'lit', true);
		if (correct) {
			this.addScore(team, parseInt(this.valueInput.value, 10));
		}
	}
};

Game.init();
GamepadListener.init();
