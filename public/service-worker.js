/* eslint-disable quotes */
importScripts('https://storage.googleapis.com/workbox-cdn/releases/3.6.3/workbox-sw.js');
importScripts('/src/js/idb.js');
importScripts('/src/js/utility.js');

workbox.precaching.suppressWarnings();

workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/, workbox.strategies.staleWhileRevalidate({
  cacheName: 'post-images'
}));

workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/, workbox.strategies.staleWhileRevalidate({
  cacheName: 'google-fonts',
  plugins: [
    new workbox.expiration.Plugin({
      maxEntries: 3,
      maxAgeSeconds: 60 * 60 * 24 * 30
    })
  ]
}));

workbox.routing.registerRoute('https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css', workbox.strategies.staleWhileRevalidate({
  cacheName: 'material-css'
}));

workbox.routing.registerRoute('https://pwa-instagram-clone.firebaseio.com/posts.json', (args) => fetch(args.event.request)
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
  }));

workbox.routing.registerRoute(routeData => routeData.event.request.headers
  .get('accept').includes('text/html'),
  (args) => caches.match(args.event.request)
  .then(response => {
    if (response) {
      return response;
    } else {
      return fetch(args.event.request)
      .then(res => caches.open('dynamic')
      .then(cache => {
        cache.put(args.event.request.url, res.clone())
        return res;
      }))
      .catch(err => caches.match('/offline.html')
      .then(res => res));
    }
  }));

workbox.precaching.precacheAndRoute([
  {
    "url": "favicon.ico",
    "revision": "2cab47d9e04d664d93c8d91aec59e812"
  },
  {
    "url": "index.html",
    "revision": "8609f52bdd12e2d22b445f8ceb320ecf"
  },
  {
    "url": "manifest.json",
    "revision": "2d81e90280825b2c424e0b5f97868275"
  },
  {
    "url": "offline.html",
    "revision": "f4d0ab34874f4dacd8bd04cb91bf2159"
  },
  {
    "url": "src/css/app.css",
    "revision": "59d917c544c1928dd9a9e1099b0abd71"
  },
  {
    "url": "src/css/feed.css",
    "revision": "c42a64cda5cc2a9756300296f70068a0"
  },
  {
    "url": "src/css/help.css",
    "revision": "1c6d81b27c9d423bece9869b07a7bd73"
  },
  {
    "url": "src/images/main-image-lg.jpg",
    "revision": "31b19bffae4ea13ca0f2178ddb639403"
  },
  {
    "url": "src/images/main-image-sm.jpg",
    "revision": "c6bb733c2f39c60e3c139f814d2d14bb"
  },
  {
    "url": "src/images/main-image.jpg",
    "revision": "5c66d091b0dc200e8e89e56c589821fb"
  },
  {
    "url": "src/images/sf-boat.jpg",
    "revision": "0f282d64b0fb306daf12050e812d6a19"
  },
  {
    "url": "src/js/app.min.js",
    "revision": "27c44f0a5abe81df3ba59231fb75da51"
  },
  {
    "url": "src/js/feed.min.js",
    "revision": "a874b4abe9d523871cac92a7c0fa2346"
  },
  {
    "url": "src/js/fetch.min.js",
    "revision": "32590119a06bf9ade8026dd12baa695e"
  },
  {
    "url": "src/js/idb.min.js",
    "revision": "ea82c8cec7e6574ed535bee7878216e0"
  },
  {
    "url": "src/js/material.min.js",
    "revision": "713af0c6ce93dbbce2f00bf0a98d0541"
  },
  {
    "url": "src/js/promise.min.js",
    "revision": "7be19d2e97926f498f2668e055e26b22"
  },
  {
    "url": "src/js/utility.min.js",
    "revision": "141b203dea94b103f6500786d689bc26"
  }
]);

self.addEventListener('sync', function(event) {
  console.log('[Service Worker] Background syncing...', event);
  if (event.tag === 'sync-new-posts') {
    console.log('[Service Worker] Syncing new Post...');
    event.waitUntil(
      readAllData('sync-posts')
      .then(data => {
        for (const dt of data) {
          const postData = new FormData();
          postData.append('id', dt.id);
          postData.append('title', dt.title);
          postData.append('location', dt.location);
          postData.append('rawLocationLat', dt.rawLocation.lat);
          postData.append('rawLocationLng', dt.rawLocation.lng);
          postData.append('file', dt.picture, dt.id + '.png');
          
          fetch('https://us-central1-pwa-instagram-clone.cloudfunctions.net/storePostData', {
            method: 'POST',
            body: postData
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
