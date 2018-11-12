self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open('static')
    .then(cache => {
      console.log('[Service Worker] Pre-caching App Shell...');
      cache.add('/src/js/app.js')
    })
  );
});

self.addEventListener('activate', function(event) {
  console.log('[Service Worker] Activating Service Worker...', event);
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  event.respondWith(fetch(event.request));
});
