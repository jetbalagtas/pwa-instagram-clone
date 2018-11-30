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

workbox.precaching.precacheAndRoute([]);
