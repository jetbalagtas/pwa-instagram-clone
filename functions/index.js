const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin: true});
const webpush = require('web-push');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions

const serviceAccount = require('./pwa-instagram-clone-firebase-key.json');
const vapidKey = require('./vapidkeys.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://pwa-instagram-clone.firebaseio.com/',

});

exports.storePostData = functions.https.onRequest((request, response) => {
 cors(request, response, () => {
   admin.database().ref('posts').push({
     id: request.body.id,
     title: request.body.title,
     location: request.body.location,
     image: request.body.image
   })
   .then(() => {
     webpush.setVapidDetails(vapidKey.SUBJECT, vapidKey.VAPID_PUBLIC_KEY, vapidKey.VAPID_PRIVATE_KEY);
     return admin.database().ref('subscriptions').once('value');
   })
   .then(subscriptions => {
     subscriptions.forEach(sub => {
       const pushConfig = {
         endpoint: sub.val().endpoint,
         keys: {
           auth: sub.val().keys.auth,
           p256dh: sub.val().keys.p256dh
         }
       };

       // eslint-disable-next-line promise/no-nesting
       webpush.sendNotification(pushConfig, JSON.stringify({
         title: 'New Post',
         content: 'New Post Added!',
         openUrl: '/help'
        }))
       .catch(err => console.log(err));
     });
     return response.status(201).json({message: 'Data stored.', id: request.body.id});
   })
   .catch(err => response.status(500).json({error: err}));
 });
});
