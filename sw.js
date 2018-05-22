self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('EAT_restaurant-review').then(cache => {
      return cache.addAll([
        '/',
        'index.html',
        'restaurant.html',
        'img/logo.svg',
        'css/styles.css',
        'js/dbhelper.js',
        'js/main.js',
        'js/restaurant_info.js',
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
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', event => {
  const { request } = event
  if (!request.url.includes('restaurants')) {
    event.respondWith(
      caches
        .match(event.request, { ignoreSearch: true })
        .then(response => response || fetch(event.request))
        .catch(err => console.log(err)),
    )
  }
})



// self.addEventListener('fetch', function (event) {
//     event.respondWith(
//         caches.open('EAT_restaurant-review').then(function (cache) {
//             return cache.match(event.request).then(function (response) {
//                 return response || fetch(event.request).then(function (response) {
//                     cache.put(event.request, response.clone());
//                     return response;
//                 });
//             });
//         })
//     );
// });
