importScripts('/js/idb.min.js');

self.addEventListener('install', event => {
	event.waitUntil(
		caches.open('EAT_restaurant-review').then(cache => {
			return cache.addAll([
				'/',
				'index.html',
				'restaurant.html',
				'img/logo.svg',
				'css/index.min.css',
				'css/restaurant.min.css',
				'js/dbhelper.js',
				'js/index.js',
				'js/restaurant.js',
				'js/lazy-load.min.js',
				'img/1_s.jpg',
				'img/2_s.jpg',
				'img/3_s.jpg',
				'img/4_s.jpg',
				'img/5_s.jpg',
				'img/6_s.jpg',
				'img/7_s.jpg',
				'img/8_s.jpg',
				'img/9_s.jpg',
				'img/10_s.jpg',
			]);
		})
	)
});

self.addEventListener('activate', event => {
	event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', event => {
	const { request } = event;
	if (!request.url.includes('restaurants')) {
		event.respondWith(
			caches
				.match(event.request, { ignoreSearch: true })
				.then(response => response || fetch(event.request))
				.catch(err => console.log(err)),
		)
	}
});


function sendOutbox() {
	return idb.open('EAT_restaurant-review', 1).then(function (db) {
		var transaction = db.transaction('outboxDB', 'readonly');
		return transaction.objectStore('outboxDB').getAll();
	  	}).then(function (reviews) {
			console.log(reviews);
			return Promise.all(reviews.map(function (review) {
			// Store id in a costant to delete it later 
			//var reviewID = review.id;
			//delete review.id;
			idb.open('EAT_restaurant-review', 1).then(function (db) {
		  		var transaction = db.transaction('outboxDB', 'readwrite');
		  		var myKey = db.transaction('outboxDB').objectStore('outboxDB').get(key);
			});
			

			console.log("Review ready to send: ", review);
			// Fetching request the review
			return fetch('http://localhost:1337/reviews', {
				method: 'POST',
				body: JSON.stringify(review),
				headers: {
				  'Accept': 'application/json',
				  'Content-Type': 'application/json'
				}
			}).then(function (response) {

				// Deleting data from indexDB
				idb.open('EAT_restaurant-review', 1).then(function (db) {
		  			var transaction = db.transaction('outboxDB', 'readwrite');
		  			return transaction.objectStore('outboxDB').delete(myKey);
				});


				console.log(response);
				return response.json();
			}).then(function (data) {
		  		console.log("Successfully sent data: ", data);
		  		if (data) {
					
		  		}
			});
		}));
	});
}

self.addEventListener('sync', function (event) {
	if (event.tag === 'outbox') {
		event.waitUntil(sendOutbox()
			.then(() => {
				console.log("Background sync done!")
			})
			.catch((error) => {
				console.log("Background sync error: ",error);
			})
		);
	}
});