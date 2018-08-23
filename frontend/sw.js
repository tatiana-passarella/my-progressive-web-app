self.importScripts('/js/idb.min.js');

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
				'js/idb.min.js',
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
				'img/app-icon-256.png',
				'img/app-icon-512.png',
			]);
		})
	)
});

self.addEventListener('activate', event => {
	event.waitUntil(self.clients.claim());
});


self.addEventListener('fetch', (event) => {
  var request = event.request;
  event.respondWith(
    caches.match(request).then((response) => {
      if (response) {
        return response;
      }
      return fetch(request).then((response) => {
        var responseToCache = response.clone();
        caches.open('EAT_restaurant-review').then((cache) => {
            cache.put(request, responseToCache).catch((err) => {
              console.warn(request.url + ': ' + err.message);
            });
          }); 
        return response;
      });
    })
  );
});

function sendOutbox() {
return idb.open('EAT_restaurant-review', 1).then(function (db) {
	var transaction = db.transaction('outbox', 'readonly');	
	return transaction.objectStore('outbox').getAll();
	}).then(function (reviews) {
			return Promise.all(reviews.map(function (review) {
				var reviewId = review.id;
				delete review.id;
				return fetch('http://localhost:1337/reviews', {
					method: 'POST',
					body: JSON.stringify(review),
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					}
			}).then(function (response) {
				console.log(response);
				return response.json();
			}).then(function (data) {
				console.log("Added: ", data);
				if (data) {
					// Deleting review from outbox
					idb.open('EAT_restaurant-review', 1).then(function (db) {
						var transaction = db.transaction('outbox', 'readwrite');
						return transaction.objectStore('outbox').delete(reviewId);
					})
				}
			})
		}))
	});
}

self.addEventListener('sync', function (event) {
	if (event.tag === 'outbox') {
		event.waitUntil(sendOutbox().then(() => {
				console.log("Background sync done!")
			}).catch((error) => {
				console.log("Background sync error: ",error);
			})
		);
	}
});
