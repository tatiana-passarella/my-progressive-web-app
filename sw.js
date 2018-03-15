self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('eat-restaurant-review_stage-1').then(cache => {
      return cache.addAll([
        '/',
        'index.html',
        'restaurant.html',
        'img/logo.svg',
        'css/dist/styles.min.css',
        'js/dbhelper.js',
        'js/main.js',
        'data/restaurants.json',
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
        'js/lozad.min.js',
      ]);
    })
  )
});

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.open('eat-restaurant-review_stage-1').then(function (cache) {
            return cache.match(event.request).then(function (response) {
                return response || fetch(event.request).then(function (response) {
                    cache.put(event.request, response.clone());
                    return response;
                });
            });
        })
    );
});
