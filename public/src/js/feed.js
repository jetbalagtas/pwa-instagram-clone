/* eslint-disable require-jsdoc */
const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');
const form = document.querySelector('form');
const titleInput = document.querySelector('#title');
const locationInput = document.querySelector('#location');
const videoPlayer = document.querySelector('#player');
const canvasElement = document.querySelector('#canvas');
const captureButton = document.querySelector('#capture-btn');
const imagePicker = document.querySelector('#image-picker');
const imagePickerArea = document.querySelector('#pick-image');
let picture;
const locationBtn = document.querySelector('#location-btn');
const locationLoader = document.querySelector('#location-loader');
let fetchedLocation;

locationBtn.addEventListener('click', (event) => {
  if (!('geolocation' in navigator)) {
    locationBtn.style.display = 'none';
  }

  locationBtn.style.display = 'none';
  locationLoader.style.display = 'block';

  navigator.geolocation.getCurrentPosition(
    (position) => {
      locationBtn.style.display = 'inline';
      locationLoader.style.display = 'none';
      fetchedLocation = { lat: position.coords.latitude, lng: 0 };
      locationInput.value = 'In Summerville';
      document.querySelector('#manual-location').classList.add('is-focused');
    },
    (err) => {
      console.log(err);
      locationBtn.style.display = 'inline';
      locationLoader.style.display = 'none';
      alert('Couldn\'t fetch location, please enter manually.');
      fetchedLocation = { lat: null, lng: null };
    },
    { timeout: 7000 }
  );
});

const initializeLocation = () => {
  if (!('geolocation' in navigator)) {
    locationBtn.style.display = 'none';
  }
}

const initializeMedia = () => {
  if (!('mediaDevices' in navigator)) {
    navigator.mediaDevices = {};
  }

  if (!('getUserMedia' in navigator.mediaDevices)) {
    navigator.mediaDevices.getUserMedia = (constraints => {
      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;
      
      if (!getUserMedia) {
        return Promise.reject(new Error('getUserMedia is not implemented.'));
      }

      return new Promise((resolve, reject) => {
        getUserMedia.call(navigator, constraints, resolve, reject);
      });
    })
  }

  navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    videoPlayer.srcObject = stream;
    videoPlayer.style.display = 'block';
  })
  .catch(err => {
    imagePickerArea.style.display = 'block';
  });
}

captureButton.addEventListener('click', (event) => {
  canvasElement.style.display = 'block';
  videoPlayer.style.display = 'none';
  captureButton.style.display = 'none';
  const context = canvasElement.getContext('2d');
  context.drawImage(videoPlayer, 0, 0, canvas.width, videoPlayer.videoHeight / (videoPlayer.videoWidth / canvas.width));
  videoPlayer.srcObject.getVideoTracks().forEach(track => track.stop());
  picture = dataURItoBlob(canvasElement.toDataURL());
});

imagePicker.addEventListener('change', (event) => {
  picture = event.target.files[0];
});

const openCreatePostModal = () => {
  createPostArea.style.transform = 'translateY(0)';
  initializeMedia();
  initializeLocation();
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(choiceResult => {
      console.log(choiceResult.outcome);
      
      if (choiceResult.outcome === 'dismissed') {
        console.log('User cancelled installation.');
      } else {
        console.log('User added app to homescreen.');
      }
    });

    deferredPrompt = null;
  }

  // Example of how to unregister/remove a serviceWorker
  // if ('serviceWorker' in navigator) {
  //   navigator.serviceWorker.getRegistrations()
  //   .then(registrations => {
  //     for (let i = 0; i < registrations.length; i++) {
  //       registrations[i].unregister();
  //     }
  //   });
  // }
}

const closeCreatePostModal = () => {
  createPostArea.style.transform = 'translateY(100vh)';
  imagePickerArea.style.display = 'none';
  videoPlayer.style.display = 'none';
  canvasElement.style.display = 'none';
  locationBtn.style.display = 'inline';
  locationLoader.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use. Allows to save assets to cache on demand otherwise.
// const onSaveButtonClicked = (event) => {
//   console.log('clicked');
//   if ('caches' in window) {
//     caches.open('user-requested')
//     .then(cache => {
//       cache.add('https://httpbin.org/get');
//       cache.add('/src/images/sf-boat.jpg');
//     });
//   }
// }

const clearCards = () => {
  while (sharedMomentsArea.hasChildNodes()) {
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

const createCard = (data) => {
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  const cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url(' + data.image + ')';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.backgroundPosition = 'center';
  cardWrapper.appendChild(cardTitle);
  const cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.style.color = 'white';
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = data.title;
  cardTitle.appendChild(cardTitleTextElement);
  const cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = data.location;
  cardSupportingText.style.textAlign = 'center';
  // const cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'Save';
  // cardSaveButton.addEventListener('click', onSaveButtonClicked);
  // cardSupportingText.appendChild(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

const updateUI = (data => {
  clearCards();
  for (let i = 0; i < data.length; i++) {
    createCard(data[i])
  }
});

const url = 'https://pwa-instagram-clone.firebaseio.com/posts.json';
let networkDataReceived = false;

fetch(url)
.then(res => res.json())
.then(data => {
  networkDataReceived = true;
  console.log('From web: ', data);
  const dataArray = [];
  for (const key in data) {
    dataArray.push(data[key]);
  }
  updateUI(dataArray);
});

if ('indexedDB' in window) {
  readAllData('posts')
  .then(data => {
    if (!networkDataReceived) {
      console.log('From cache', data);
      updateUI(data);
    }
  });
}

const sendData = () => {
  const postData = new FormData();
  const id = new Date().toISOString();
  postData.append('id', id);
  postData.append('title', titleInput.value);
  postData.append('location', locationInput.value);
  postData.append('file', picture, id + '.png');
  postData.append('rawLocationLat', fetchedLocation.lat);
  postData.append('rawLocationLng', fetchedLocation.lng);

  fetch('https://us-central1-pwa-instagram-clone.cloudfunctions.net/storePostData', {
    method: 'POST',
    body: postData
  })
  .then(res => console.log('Sent data', res));
  updateUI();
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  if (titleInput.value.trim() === '' || locationInput.value.trim() === '') {
    alert('Please enter valid data!')
    return;
  }

  closeCreatePostModal();

  if ('serviceWorker' in navigator && 'SyncManager' in window) {
    navigator.serviceWorker.ready
    .then(sw => {
      const post = {
        id: new Date().toISOString(),
        title: titleInput.value,
        location: locationInput.value,
        picture: picture,
        rawLocation: fetchedLocation
      };
      writeData('sync-posts', post)
      .then(() => sw.sync.register('sync-new-posts'))
      .then(() => {
        const snackbarContainer = document.querySelector('#confirmation-toast');
        const data = { message: 'Your post was saved for syncing!' };
        snackbarContainer.MaterialSnackbar.showSnackbar(data);
      })
      .catch(err => console.log(err));
    });
  } else {
    sendData();
  }
});
