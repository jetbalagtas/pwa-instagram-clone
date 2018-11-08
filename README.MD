# How to Use
You need [Node.js](https://nodejs.org) installed on your machine. Simply download the installer from [nodejs.org](https://nodejs.org) and go through the installation steps.

Once Node.js is installed, open your command prompt or terminal and **navigate into this project folder**. There, run `npm install` to install all required dependencies.

Finally, run `npm start` to start the development server and visit [localhost:8080](http://localhost:8080) to see the running application.

## Testing Service Worker lifecycle (installation, activation, registration) and non-lifecycle (fetch, etc.) events
On an actual device plugged into the development machine or on an emulator, the window or tab running the app must be closed and reopened when new code is added to the Service Worker, in order for activation to execute. **Alternatively, when developing on the desktop,** use Chrome's DevTools' Application Tab to tick the "Update on reload" checkbox or click the "Update", "Unregister", or "SkipWaiting" link then reload the window/tab.

## Testing custom events such as deferring the App Install Banner
On the device or emulator, Clear & Reset the Site Settings from the 'i' menu of the Chrome window or tab.
