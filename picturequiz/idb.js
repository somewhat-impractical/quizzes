/* globals dbReady, indexedDB, IDBRequest */
var db;

(function() {
	var request = indexedDB.open('pictureQuiz', 1);

	request.onsuccess = function() {
		db = this.result;

		if (typeof dbReady == 'function') {
			dbReady.call();
		}
	};

	request.onerror = function() {
		console.error(this.error);
	};

	request.onupgradeneeded = function() {
		db = this.result;

		if (db.objectStoreNames.contains('pictures')) {
			db.deleteObjectStore('pictures');
		}

		var picturesDB;
		if (db.objectStoreNames.contains('pictures')) {
			picturesDB = this.transaction.objectStore('pictures');
		} else {
			picturesDB = db.createObjectStore('pictures', { autoIncrement: true });
		}
	};
})();

IDBRequest.prototype.then = function(resolve, reject) {
	return new Promise((_resolve, _reject) => {
		this.onsuccess = function() {
			_resolve(this.result);
		};
		this.onerror = function() {
			_reject(this.error);
		};
	}).then(resolve, reject);
};
