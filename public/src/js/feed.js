/* eslint-disable require-jsdoc */
const shareImageButton = document.querySelector('#share-image-button');
const createPostArea = document.querySelector('#create-post');
const closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea = document.querySelector('#shared-moments');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if (deferredPrompt) {
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then(function(choiceResult) {
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

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

// Currently not in use. Allows to save assets to cache on demand otherwise.
const onSaveButtonClicked = (event) => {
  console.log('clicked');
  if ('caches' in window) {
    caches.open('user-requested')
    .then(cache => {
      cache.add('https://httpbin.org/get');
      cache.add('/src/images/sf-boat.jpg');
    });
  }
}

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
  cardTitle.style.height = '180px';
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

if ('caches' in window) {
  caches.match(url)
  .then(response => {
    if (response) {
      return response.json();
    }
  })
  .then(data => {
    console.log('From cache: ', data);
    if (!networkDataReceived) {
      const dataArray = [];
      for (const key in data) {
        dataArray.push(data[key]);
      }
      updateUI(dataArray)
    }
  })
}
