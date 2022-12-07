import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Notify } from 'notiflix/build/notiflix-notify-aio';

const totalEmptyMessage =
  'Sorry, there are no images matching your search query. Please try again.';
const totalLastMessage =
  "We're sorry, but you've reached the end of search results.";

const buttomLoadMoreVisibleClass = 'load-more-visible';

const form = document.querySelector('form#search-form');
const input = document.querySelector('[name="searchQuery"]');
const gallery = document.querySelector('div.gallery');
const buttonLoadMore = document.querySelector('button.load-more');

let requestParams = {
  key: '31801640-92314b1461717efb7747c4e31',
  q: '',
  image_type: 'photo',
  orientation: 'horizontal',
  safesearch: 'true',
  page: 1,
  per_page: 40,
};

let lightbox = new SimpleLightbox('.gallery a');

buttonLoadMore.addEventListener('click', loadMore);
form.addEventListener('submit', event => {
  event.preventDefault();
  
  let inputValue = input.value;
  if (inputValue.length > 0) {
    requestParams.q = input.value;
    requestParams.page = 1;
    gallery.innerHTML = '';
    loadPhotos();
  }
});

function loadMore(){
  buttonLoadMore.classList.remove(buttomLoadMoreVisibleClass);
  requestParams.page += 1;
  loadPhotos().then(smoothWindowScroll);
}

window.onscroll = () => {
  let scollHeight = window.innerHeight + window.scrollY;
  if (scollHeight >= document.body.offsetHeight) {
    if(buttonLoadMore.classList.contains(buttomLoadMoreVisibleClass)){
      console.log("!!!window.onscroll");
      loadMore();
    }    
  }
};

function smoothWindowScroll() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight,
    behavior: 'smooth',
  });
}

async function loadPhotos() {
  let urlParams = [];
  for (let key in requestParams) {
    urlParams.push(`${key}=${requestParams[key]}`);
  }

  const request = 'https://pixabay.com/api/?' + urlParams.join('&');
  let data;
  try {
    const response = await fetch(request);
    data = await fetchResponseCallback(response);
  } catch (error) {
    data = Notify.failure(error);
  }
  return fetchJsonCallback(data);
}

function fetchResponseCallback(response) {
  if (!response.ok) {
    throw new Error(response.status);
  }
  return response.json();
}

function fetchJsonCallback(data) {
  if (data.total === 0) {
    Notify.warning(totalEmptyMessage);
    return;
  }

  if (requestParams.page === 1) {
    Notify.success(`Hooray! We found ${data.totalHits} images.`);
  }

  let currentItems = requestParams.page * requestParams.per_page;
  if (currentItems > data.totalHits) {
    buttonLoadMore.classList.remove(buttomLoadMoreVisibleClass);
    Notify.warning(totalLastMessage);
  } else {
    buttonLoadMore.classList.add(buttomLoadMoreVisibleClass);
  }

  const newArrayImages = data.hits.map(markupCallback);
  gallery.insertAdjacentHTML('beforeend', newArrayImages.join(''));

  lightbox.refresh();
}

function markupCallback(element) {
  return `<div class="photo-card">
              <a class="photo-card__link" href="${element.largeImageURL}">         
                <img class="photo-card__img" src=${element.webformatURL} alt="${element.tags}" loading="lazy" />
                <div class="info">
                    <p class="info-item">
                        <b>Likes</b>
                        <span>${element.likes}</span>
                    </p>
                    
                  
                    <p class="info-item">
                        <b>Views</b>
                        <span>${element.views}</span>
                    </p>
                  
                    <p class="info-item">
                        <b>Comments</b>
                        <span>${element.comments}</span>
                    </p>
                    <p class="info-item">
                        <b>Downloads</b>
                        <span>${element.downloads}</span>
                    </p>
                </div>
              </a>
          </div>`;
}
