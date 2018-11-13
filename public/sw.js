self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open('static-v2')
    .then(cache => {
      console.log('[Service Worker] Pre-caching App Shell...');
      cache.addAll([
        '/',
        '/index.html',
        '/src/js/app.js',
        '/src/js/feed.js',
        '/src/js/promise.js',
        '/src/js/fetch.js',
        '/src/js/material.min.js',
        '/src/css/app.css',
        '/src/css/feed.css',
        '/src/images/main-image.jpg',
        'https://fonts.googleapis.com/css?family=Roboto:400,700',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
      ]);
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker...', event);
  event.waitUntil(
    caches.keys()
    .then(keyList => Promise.all(keyList.map(key => {
      if (key !== 'static-v2' && key !== 'dynamic') {
        console.log('[Service Worker] Removing old cache.', key);
        return caches.delete(key);
      } 
    })))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request)
    .then(response => {
      if (response) {
        return response;
      } else {
        return fetch(event.request)
        .then(res => caches.open('dynamic')
        .then(cache => {
          cache.put(event.request.url, res.clone())
          return res;
        }))
        .catch(err => {})
      }
    })
  );
});
