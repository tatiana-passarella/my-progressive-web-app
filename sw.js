self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('mws-restaurant-stage-1').then(cache => {
      return cache.addAll([
        '/',
        '/css/styles.css',
        '/js/dbhelper.js',
        '/js/main.js',
        '/data/restaurants.json',
        '/img/1_s.jpg',
        '/img/2_s.jpg',
        '/img/3_s.jpg',
        '/img/4_s.jpg',
        '/img/5_s.jpg',
        '/img/6_s.jpg',
        '/img/7_s.jpg',
        '/img/8_s.jpg',
        '/img/9_s.jpg',
        '/img/10_s.jpg',
      ]);
    })
  )
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response || fetch(event.request);
    })
  );
});
