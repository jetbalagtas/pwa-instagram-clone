importScripts('/src/js/idb.js');

const CACHE_STATIC_NAME = 'static-v15';
const CACHE_DYNAMIC_NAME = 'dynamic-v2';
const STATIC_FILES = [
  '/',
  '/index.html',
  '/offline.html',
  '/src/js/app.js',
  '/src/js/feed.js',
  '/src/js/idb.js',
  '/src/js/promise.js',
  '/src/js/fetch.js',
  '/src/js/material.min.js',
  '/src/css/app.css',
  '/src/css/feed.css',
  '/src/images/main-image.jpg',
  'https://fonts.googleapis.com/css?family=Roboto:400,700',
  'https://fonts.googleapis.com/icon?family=Material+Icons',
  'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
];

const dbPromise = idb.open('posts-store', 1, function(db) {
  if (!db.objectStoreNames.contains('posts')) {
    db.createObjectStore('posts', { keyPath: 'id' });
  }
})

// const trimCache = (cacheName, maxItems) => {
//   caches.open(cacheName)
//   .then(cache => cache.keys()
//   .then(keys => {
//     if (keys.length > maxItems) {
//       cache.delete(keys[0])
//       .then(trimCache(cacheName, maxItems));
//     }
//   }));
// }

self.addEventListener('install', function(event) {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_STATIC_NAME)
    .then(cache => {
      console.log('[Service Worker] Pre-caching App Shell...');
      cache.addAll(STATIC_FILES);
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

const isInArray = (string, array) => {
  let cachePath;
  if (string.indexOf(self.origin) === 0) {
    cachePath = string.substring(self.origin.length);
  } else {
    cachePath = string;
  }
  return array.indexOf(cachePath) > -1;
}

self.addEventListener('fetch', function(event) {
  const url = 'https://pwa-instagram-clone.firebaseio.com/posts';
  if (event.request.url.indexOf(url) > -1) {
    event.respondWith(fetch(event.request)
      .then(res => {
        const clonedRes = res.clone();
        clonedRes.json()
        .then(data => {
          for (const key in data) {
            dbPromise
            .then(db => {
              const tx = db.transaction('posts', 'readwrite');
              const store = tx.objectStore('posts');
              store.put(data[key]);
              return tx.complete;
            });
          }
        });
        return res;
      })
    );
  } else if (isInArray(event.request.url, STATIC_FILES)) {
    event.respondWith(caches.match(event.request));
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
            // trimCache(CACHE_DYNAMIC_NAME, 3);
            cache.put(event.request.url, res.clone())
            return res;
          }))
          .catch(err => caches.open(CACHE_STATIC_NAME)
          .then(cache => {
            if (event.request.headers.get('accept').includes('text/html')) {
              return cache.match('/offline.html');
            }
          }));
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

// Cache-only strategy
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     caches.match(event.request)
//   );
// });

// Network-only strategy
// self.addEventListener('fetch', function(event) {
//   event.respondWith(
//     fetch(event.request)
//   );
// });
