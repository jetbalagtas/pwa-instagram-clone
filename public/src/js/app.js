/* eslint-disable no-unused-vars */
let deferredPrompt;
const enableNotificationsButtons = document.querySelectorAll('.enable-notifications');

if (!window.Promise) {
  window.Promise = Promise;
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker
    .register('/sw.js')
    .then(function() {
      console.log('Service worker registered.');
    })
    .catch(function(err) {
      console.log(err);
    });
}

window.addEventListener('beforeinstallprompt', function(event) {
  console.log('beforeinstallprompt fired.');
  event.preventDefault();
  deferredPrompt = event;
  return false;
});

const displayConfirmationNotification = () => {
  if ('serviceWorker' in navigator) {
    const options = {
      body: 'You successfully subscribed to notifications!',
      icon: '/src/images/icons/app-icon-96x96.png',
      image: '/src/images/sf-boat.jpg',
      dir: 'ltr',
      lang: 'en-US', // BCP 47
      vibrate: [100, 50, 200],
      badge: '/src/images/icons/app-icon-96x96.png',
      tag: 'confirm-notification',
      renotify: true,
      actions: [
        { action: 'confirm', title: 'Okay', icon: '/src/images/icons/app-icon-96x96.png' },
        { action: 'cancel', title: 'Cancel', icon: '/src/images/icons/app-icon-96x96.png' }
      ]
    };
    navigator.serviceWorker.ready
    .then(swreg => swreg.showNotification('PWAGram: Success!', options))
  }
}

const configurePushSub = () => {
  if (!('serviceWorker' in navigator)) return;
  let reg;
  navigator.serviceWorker.ready
  .then(swreg => {
    reg = swreg;
    return swreg.pushManager.getSubscription();
  })
  .then(sub => {
    if (sub === null) {
      // create a new subscription
      const vapidPublicKey = 'BIH_gXww3ZWVsr-GObFSJSBJyP7MetEQaTEadfkc_5iosLQkp4culaU34UOZLkRAcehGEi8szSP0deU_WAwH17E';
      const convertedPublicKey = urlBase64ToUint8Array(vapidPublicKey);
      return reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedPublicKey
      });
    } else {
      // We have an existing subscription
    }
  })
  .then(newSub => fetch('https://pwa-instagram-clone.firebaseio.com/subscriptions.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(newSub)
    }))
    .then(res => {
      if (res.ok) {
        displayConfirmationNotification();
      }
    })
    .catch(err => console.log(err));
}

const askForNotificationPermission = () => {
  Notification.requestPermission(result => {
    console.log('Notification permission', result);
    if (result != 'granted') {
      console.log('No notification permission granted.');
    } else {
      configurePushSub();
      // displayConfirmationNotification();
    }
  });
}

if ('Notification' in window && 'serviceWorker' in navigator) {
  for (let i = 0; i < enableNotificationsButtons.length; i ++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}
