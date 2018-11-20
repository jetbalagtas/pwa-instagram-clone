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
  const options = {
    body: 'You successfully subscribed to notifications!'
  };
  new Notification('PWAGram: Success!', options);
}

const askForNotificationPermission = () => {
  Notification.requestPermission(result => {
    console.log('Notification permission', result);
    if (result != 'granted') {
      console.log('No notification permission granted.');
    } else {
      displayConfirmationNotification();
    }
  });
}

if ('Notification' in window) {
  for (let i = 0; i < enableNotificationsButtons.length; i ++) {
    enableNotificationsButtons[i].style.display = 'inline-block';
    enableNotificationsButtons[i].addEventListener('click', askForNotificationPermission);
  }
}
