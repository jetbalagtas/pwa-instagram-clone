importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

const CACHE_STATIC_NAME = 'static-v30';
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
        clearAllData('posts')
        .then(() => clonedRes.json()
        .then(data => {
          for (const key in data) {
            writeData('posts', data[key]);
          }
        }));
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

self.addEventListener('sync', function(event) {
 console.log('[Service Worker] Background syncing...', event);
 if (event.tag === 'sync-new-posts') {
   console.log('[Service Worker] Syncing new Post...');
   event.waitUntil(
     readAllData('sync-posts')
     .then(data => {
       for (const dt of data) {
         fetch('https://us-central1-pwa-instagram-clone.cloudfunctions.net/storePostData', {
           method: 'POST',
           headers: {
             'Content-Type': 'application/json',
             'Accept': 'application/json'
           },
           body: JSON.stringify({
             id: dt.id,
             title: dt.title,
             location: dt.location,
             image: 'https://firebasestorage.googleapis.com/v0/b/pwa-instagram-clone.appspot.com/o/sf-boat.jpg?alt=media&token=1314ccfb-8292-4304-a6c4-f61ea8768ddc'
           })
         })
         .then(res => {
           console.log('Sent data', res);
           if (res.ok) {
             res.json()
             .then(resData => deleteItemFromData('sync-posts', resData.id));
           }
        })
        .catch(err => console.log('Error while sending data.', err));
       }
     })  
   );
 }
});

self.addEventListener('notificationclick', function(event) {
  const notification = event.notification;
  const action = event.action;

  console.log(notification);
  
  if (action === 'confirm') {
    console.log('Confirm was chosen.');
  } else {
    console.log(action);
    event.waitUntil(
      clients.matchAll()
      .then(clis => {
        const client = clis.find(c => c.visibilityState === 'visible');
        if (client !== undefined) {
          client.navigate(notification.data.url);
          client.focus();
        } else {
          clients.openWindow(notification.data.url);
        }
        notification.close();
      })
    );
  }
});

self.addEventListener('notificationclose', function(event) {
  console.log('Notification was closed', event);
});

self.addEventListener('push', function(event) {
  console.log('Push Notification received', event);
  let data = { title: 'New!', content: 'Something new happened!', openUrl: '/' };

  if (event.data) {
    data = JSON.parse(event.data.text());
  }

  const options = {
    body: data.content,
    icon: '/src/images/icons/app-icon-96x96.png',
    badge: '/src/images/icons/app-icon-96x96.png',
    data: {
      url: data.openUrl
    }
  }

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});
