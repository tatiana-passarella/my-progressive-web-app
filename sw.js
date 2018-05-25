self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('EAT_restaurant-review').then(cache => {
      return cache.addAll([
        '/',
        'index.html',
        'restaurant.html',
        'img/logo.svg',
        'css/index.css',
        'css/restaurant.css',
        'js/dbhelper.js',
        'js/index.js',
        'js/restaurant.js',
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