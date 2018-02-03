/* globals GameDisplay, StopIteration */
GameDisplay.scoreKey = 'pictureQuizScores';
GameDisplay.broadcastName = 'pictureQuiz';
GameDisplay.handleBroadcast = function(messageData) {
	switch (messageData.action) {
	case 'correctAnswer':
		this.scores[messageData.team] += remaining;
		this.saveScores();
		break;
	case 'incorrectAnswer':
		this.scores[messageData.team] -= Math.floor(remaining / 2);
		this.saveScores();
		break;
	case 'startImage':
		image.src = messageData.src;
		blockout = messageData.blockout;
		break;
	case 'pause':
		clearTimeout(timeout);
		break;
	case 'resume':
		nextFill();
		break;
	case 'reveal':
		reveal();
		break;
	}
};
GameDisplay.init();

var canvas = document.querySelector('canvas');
var context = canvas.getContext('2d');
context.lineWidth = 0.5;
var image = document.createElement('img');
var filler = null;
var timeout = null;
var remaining = 0;
var plugOrSocket;
var blockout;

image.onload = function() {
	filler = fill();
	nextFill();
	if (this.src.startsWith('blob:')) {
		URL.revokeObjectURL(this.src);
	}
};

function* fill() {
	context.clearRect(0, 0, 800, 500);
	remaining = 40;

	var scale = Math.min(image.width / 800, image.height / 500);
	var offsetX = (image.width - 800) / 2;
	var offsetY = (image.height - 500) / 2;
	var parts = [];
	var i;
	for (i = 0; i < 40; i++) {
		parts.push({
			index: i,
			sort: Math.random() + (blockout.includes(i) ? 0.5 : 0)
		});
	}
	parts.sort(function(a, b) {
		return a.sort - b.sort;
	});
	plugOrSocket = [];
	for (i = 0; i < 67; i++) {
		plugOrSocket.push(Math.random() < 0.5);
	}

	for (i = 0; i < 40; i++) {
		var row = Math.floor(parts[i].index / 8);
		var column = parts[i].index % 8;

		drawPiece(row, column);
		context.globalCompositeOperation = 'source-in';
		context.drawImage(image, offsetX, offsetY, 800 * scale, 500 * scale, 0, 0, 800, 500);
		context.globalCompositeOperation = 'source-over';
		yield;
		remaining--;
	}
	throw StopIteration;
}

function nextFill() {
	try {
		filler.next();
		timeout = setTimeout(nextFill, 400);
	} catch (ex) {
		if (ex instanceof StopIteration) {
			GameDisplay.postMessage({
				action: 'stop'
			});
		} else {
			console.error(ex);
		}
	}
}

function reveal() {
	clearTimeout(timeout);
	var scale = Math.min(image.width / 800, image.height / 500);
	var offsetX = (image.width - 800 * scale) / 2;
	var offsetY = (image.height - 500 * scale) / 2;
	context.drawImage(image, offsetX, offsetY, 800 * scale, 500 * scale, 0, 0, 800, 500);
}

function drawPiece(row, column) {
	context.save();
	context.translate(50 + column * 100, 50 + row * 100);
	context.beginPath();
	context.moveTo(50, -50);
	if (column == 7) {
		drawEdge();
	} else if (plugOrSocket[row * 7 + column]) {
		drawPlug();
	} else {
		drawSocket();
	}
	context.rotate(Math.PI / 2);
	if (row == 4) {
		drawEdge();
	} else if (plugOrSocket[35 + row * 8 + column]) {
		drawPlug();
	} else {
		drawSocket();
	}
	context.rotate(Math.PI / 2);
	if (column === 0) {
		drawEdge();
	} else if (plugOrSocket[row * 7 + column - 1]) {
		drawSocket();
	} else {
		drawPlug();
	}
	context.rotate(Math.PI / 2);
	if (row === 0) {
		drawEdge();
	} else if (plugOrSocket[35 + (row - 1) * 8 + column]) {
		drawSocket();
	} else {
		drawPlug();
	}
	context.closePath();
	context.fill();
	context.stroke();
	context.restore();
}

function drawSocket() {
	context.bezierCurveTo(48.349661, -20, 57.434828, -0.181161, 45.78125, -9.925789);
	context.bezierCurveTo(45.42066, -10.289919, 45.040548, -10.634179, 44.642578, -10.957039);
	context.bezierCurveTo(44.606178, -10.992239, 44.573878, -11.016839, 44.537109, -11.052739);
	context.lineTo(44.537109, -11.037109);
	context.bezierCurveTo(42.035399, -13.040079, 38.927406, -14.133672, 35.722656, -14.138672);
	context.bezierCurveTo(27.913986, -14.138912, 21.583984, -7.80869, 21.583984, 0);
	context.bezierCurveTo(21.583984, 7.80869, 27.913986, 14.138912, 35.722656, 14.138664);
	context.bezierCurveTo(38.927406, 14.133664, 42.035399, 13.040071, 44.537109, 11.037101);
	context.lineTo(44.537109, 11.052731);
	context.bezierCurveTo(44.573879, 11.016831, 44.606179, 10.992231, 44.642578, 10.957031);
	context.bezierCurveTo(45.040548, 10.634171, 45.42066, 10.289911, 45.78125, 9.925781);
	context.bezierCurveTo(57.434828, 0.181153, 48.349661, 20, 50, 50);
}

function drawPlug() {
	context.bezierCurveTo(51.650339, -20, 42.56517, -0.181161, 54.21875, -9.925781);
	context.bezierCurveTo(54.57934, -10.289911, 54.959452, -10.634171, 55.357422, -10.957031);
	context.bezierCurveTo(55.393822, -10.992231, 55.426122, -11.016831, 55.462891, -11.052731);
	context.lineTo(55.462891, -11.037101);
	context.bezierCurveTo(57.964601, -13.040071, 61.072594, -14.133664, 64.277344, -14.138664);
	context.bezierCurveTo(72.086014, -14.138904, 78.416016, -7.808682, 78.416016, 0.000008);
	context.bezierCurveTo(78.416016, 7.808698, 72.086014, 14.13892, 64.277344, 14.13868);
	context.bezierCurveTo(61.072594, 14.13368, 57.964601, 13.040087, 55.462891, 11.037117);
	context.lineTo(55.462891, 11.052747);
	context.bezierCurveTo(55.426121, 11.016847, 55.393821, 10.992247, 55.357422, 10.957047);
	context.bezierCurveTo(54.959452, 10.634171, 54.57934, 10.289911, 54.21875, 9.925781);
	context.bezierCurveTo(42.56517, 0.181153, 51.650339, 20, 50, 50);
}

function drawEdge() {
	context.lineTo(50, 50);
}
