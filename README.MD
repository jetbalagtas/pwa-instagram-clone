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

# The Backend

## Adding Server Side Code (writing the API for the backend, if deploying to Firebase)
After Firebase initialization, in your terminal, navigate to the ```functions``` folder installed by Firebase, then:
    
    npm install firebase-admin cors --save

Follow these instructions to create and deploy your cloud functions:
    https://firebase.google.com/docs/functions/write-firebase-functions

Basically, after writing/editing your backend code, run:

    firebase deploy

## Securing Push Messages
You'll need to use the [VAPID protocol](https://blog.mozilla.org/services/2016/04/04/using-vapid-with-webpush/). Start by installing the ```web-push``` third party package to your backend. While in the ```functions``` folder, run:

    npm install --save web-push

Then, generate both Public and Private keys by running:

    npm run web-push generate-vapid-keys

## Accessing formData that reaches the server
Firebase parses the request body for us and turns it into a Buffer. Hence we need the ```busboy``` library to read the data from that Buffer. We also need to store the image URL in Firebase's cloud storage, which uses Google's cloud storage behind the scenes. For this, we need to install the ```@google-cloud/storage``` package (version 1.7 specified due to Firebase cloud functions having received a breaking change). In the ```functions``` folder, run:

    npm install --save busboy @google-cloud/storage@1.7

## Giving users access to the file/image stored in the server
We will have to generate a public access URL for the file. Firebase uses a ```firebaseStorageDownloadTokens``` file metadata property that takes a unique string. It is also this unique string that Firebase needs attached to the end of the image URL. So while in the ```functions``` folder, install the ```uuid-v4``` package:

    npm install --save uuid-v4

# Automatic Service Worker Management with Workbox
To simplify service worker management, we can use Workbox by Google. More at: [Workbox](https://developers.google.com/web/tools/workbox/). We use the generic approach and install the Workbox CLI:

    npm install --save-dev workbox-cli

Setup the CLI to work with the project by running the wizard:

    workbox wizard

Generate a Service Worker for the first time:

    workbox generateSW workbox-config.js

Finally, whenever we update our site/app, run this:

    npm run build
