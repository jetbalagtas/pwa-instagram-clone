var CACHE_STATIC_NAME = 'static-v13';
var CACHE_DYNAMIC_NAME = 'dynamic-v2';

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
    .then(cache => {
      console.log('[Service Worker] Pre-caching App Shell...');
      cache.addAll([
        '/',
        '/index.html',
        '/offline.html',
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
      if (key !== CACHE_STATIC_NAME && key !== CACHE_DYNAMIC_NAME) {
        console.log('[Service Worker] Removing old cache.', key);
        return caches.delete(key);
      } 
    })))
  );
  return self.clients.claim();
});

self.addEventListener('fetch', function(event) {
  var url = 'https://httpbin.org/get';

  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(
      caches.open(CACHE_DYNAMIC_NAME)
      .then(cache => fetch(event.request)
      .then(res => {
        cache.put(event.request, res.clone());
        return res;
      }))
    );
  } else {
    event.respondWith(
      caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        } else {
          return fetch(event.request)
          .then(res => caches.open(CACHE_DYNAMIC_NAME)
          .then(cache => {
            cache.put(event.request.url, res.clone())
            return res;
          }))
          .catch(err => caches.open(CACHE_STATIC_NAME)
          .then(cache => cache.match('/offline.html'))
          );
        }
      })
    );
  }
});

// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//     .then(response => {
//       if (response) {
//         return response;
//       } else {
//         return fetch(event.request)
//         .then(res => caches.open(CACHE_DYNAMIC_NAME)
//         .then(cache => {
//           cache.put(event.request.url, res.clone())
//           return res;
//         }))
//         .catch(err => caches.open(CACHE_STATIC_NAME)
//         .then(cache => cache.match('/offline.html'))
//         );
//       }
//     })
//   );
// });

// Network first strategy
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//     .then(res => caches.open(CACHE_DYNAMIC_NAME)
//     .then(cache => {
//       cache.put(event.request.url, res.clone())
//       return res;
//     }))
//     .catch(err => caches.match(event.request))
//   );
// });
