# How to Use
You need [Node.js](https://nodejs.org) installed on your machine. Simply download the installer from [nodejs.org](https://nodejs.org) and go through the installation steps.

Once Node.js is installed, open your command prompt or terminal and **navigate into this project folder**. Then install all required dependencies:

    npm install

Finally, start the development server:

    npm start

Then visit [localhost:8080](http://localhost:8080) to see the running application.

## Testing Service Worker lifecycle (installation, activation, registration) and non-lifecycle (fetch, etc.) events
On an actual device plugged into the development machine or on an emulator, the window or tab running the app must be closed and reopened when new code is added to the Service Worker, in order for activation to execute. **Alternatively, when developing on the desktop,** use Chrome's DevTools' Application Tab to tick the "Update on reload" checkbox or click the "Update", "Unregister", or "SkipWaiting" link then reload the window/tab.

## Testing custom events such as deferring the App Install Banner
On the device or emulator, Clear & Reset the Site Settings from the 'i' menu of the Chrome window or tab.

## Adding Server Side Code (writing the API for the backend, if deploying to Firebase)
After Firebase initialization, navigate to the functions folder installed by Firebase, then:
    
    npm install firebase-admin cors --save

Follow these instructions to create and deploy your cloud functions:
    https://firebase.google.com/docs/functions/write-firebase-functions

Basically, after writing your backend code, run:

    firebase deploy

## Securing Push Messages
You'll need to use the [VAPID protocol](https://blog.mozilla.org/services/2016/04/04/using-vapid-with-webpush/). Start by installing the ```web-push``` third party package to your backend. While in the ```functions``` folder, run:

    npm install --save web-push

Then, generate both Public and Private keys by running:

    npm run web-push generate-vapid-keys
