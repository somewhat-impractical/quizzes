/* globals db */
var WIDTH = 800;
var HEIGHT = 500;
// var ROWS = 5;
// var COLUMNS = 8;
// var blockout;

var pictureCanvas = document.getElementById('picture');
var pictureContext = pictureCanvas.getContext('2d');
var textarea = document.querySelector('textarea');

var timeout;
textarea.oninput = function() {
	if (timeout) {
		clearTimeout(timeout);
	}
	setTimeout(function() {
		pictureCanvas.setAttribute('style', 'position: absolute; left: 0;' + textarea.value);
	}, 750);
};
// var blockoutCanvas = document.getElementById('blockout');
// var blockoutContext = blockoutCanvas.getContext('2d');
// blockoutCanvas.onclick = function(event) {
// 	if (!blockout) {
// 		return;
// 	}

// 	var bcr = this.getBoundingClientRect();
// 	var row = Math.floor((event.clientY - bcr.top) / 100);
// 	var column = Math.floor((event.clientX - bcr.left) / 100);
// 	var position = row * COLUMNS + column;
// 	var index = blockout.indexOf(position);
// 	if (index >= 0) {
// 		blockout.splice(index, 1);
// 		blockoutContext.clearRect(column * 100, row * 100, 100, 100);
// 		if (position % 2) {
// 			blockoutContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
// 			blockoutContext.fillRect(column * 100, row * 100, 100, 100);
// 		}
// 	} else {
// 		blockout.push(position);
// 		blockoutContext.fillStyle = 'rgba(255, 0, 0, 0.25)';
// 		blockoutContext.fillRect(column * 100, row * 100, 100, 100);
// 	}
// };
var input = document.querySelector('input[type="file"]');
input.onchange = function() {
	// console.log(this.files[0]);
	loadCanvasFile(this.files[0]);
};
if (input.value) {
	input.onchange();
}

document.documentElement.addEventListener('dragover', function(event) {
	// console.log(event.dataTransfer);
	if (event.dataTransfer.types.contains('application/x-moz-file') ||
			event.dataTransfer.types.contains('text/uri-list')) {
		event.dataTransfer.dropEffect = 'copy';
		event.preventDefault();
	}
});
document.documentElement.addEventListener('drop', function(event) {
	// console.log(event.dataTransfer);
	if (event.dataTransfer.files.length > 0) {
		loadCanvasFile(event.dataTransfer.files[0]);
	} else {
		loadCanvas(event.dataTransfer.getData('text/uri-list'));
	}
	event.preventDefault();
});

document.querySelector('input[type="button"]').onclick = function() {
	pictureCanvas.toBlob(function(blob) {
		var before = {};
		var after = {};
		for (let property of textarea.value.split('\n').filter(p => p)) {
			let [name, value] = property.split(':');
			before[name] = value.trim();
			after[name] = 'none';
		}

		db.transaction('pictures', 'readwrite').objectStore('pictures').add({
			image: blob,
			before, after
			// blockout: blockout.sort(function(a, b) {
			// 	return a - b;
			// })
		}).then(function(pk) {
			createThumbnail(blob, pk);
		});
	}, 'image/jpeg', 'quality=80');
};

/* exported dbReady */
function dbReady() {
	db.transaction('pictures').objectStore('pictures').openCursor().onsuccess = function() {
		var cursor = this.result;
		if (cursor) {
			createThumbnail(cursor.value.image, cursor.primaryKey);
			cursor.continue();
		}
	};
}

function loadCanvas(url) {
	var img = document.createElement('img');
	img.onload = function() {
		var scale = Math.max(WIDTH / this.width, HEIGHT / this.height);
		var newWidth = this.width * scale;
		var newHeight = this.height * scale;
		pictureContext.drawImage(
			this,
			0, 0, this.width, this.height,
			(WIDTH - newWidth) / 2, (HEIGHT - newHeight) / 2, newWidth, newHeight
		);
		// blockoutContext.clearRect(0, 0, WIDTH, HEIGHT);
		// blockoutContext.fillStyle = 'rgba(0, 0, 0, 0.1)';
		// for (var i = 0; i < ROWS; i++) {
		// 	for (var j = 0; j < COLUMNS; j++) {
		// 		if ((i + j) % 2) {
		// 			blockoutContext.fillRect(j * 100, i * 100, 100, 100);
		// 		}
		// 	}
		// }
		// blockout = [];
		URL.revokeObjectURL(this.src);
	};
	img.src = url;
}
function loadCanvasFile(file) {
	loadCanvas(URL.createObjectURL(file));
}

function createThumbnail(blob, pk=0) {
	var existing = document.querySelector('div#existing');
	var template = document.querySelector('div#existing > template');

	var url = URL.createObjectURL(blob);
	var img = template.content.firstElementChild.cloneNode(true);
	img.src = url;
	img.dataset.pk = pk;
	existing.insertBefore(img, existing.firstElementChild);
}

/* exported deleteImage */
function deleteImage(img) {
	var pk = parseInt(img.dataset.pk, 10);
	db.transaction('pictures', 'readwrite').objectStore('pictures').delete(pk).then(function() {
		img.remove();
	});
}
