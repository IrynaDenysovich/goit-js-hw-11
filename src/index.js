import axios from 'axios';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

import { Notify } from 'notiflix/build/notiflix-notify-aio';

const totalEmptyMessage =
  'Sorry, there are no images matching your search query. Please try again.';
const totalLastMessage =
  "We're sorry, but you've reached the end of search results.";

const form = document.querySelector('form#search-form');
const input = document.querySelector('[name="searchQuery"]');
const gallery = document.querySelector('div.gallery');

let loadComplete = false;
let timeoutIndex = null;
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

form.addEventListener('submit', event => {
  event.preventDefault();
  let inputValue = input.value.trim();
  loadComplete = false;
  if (inputValue.length > 0) {
    requestParams.q = input.value;
    requestParams.page = 1;
    gallery.innerHTML = '';
    loadPhotos();
  }
});

function loadMore(){
  if(!loadComplete){
    requestParams.page += 1;
    loadPhotos().then(smoothWindowScroll);
  }
}

window.onscroll = () => {
  clearTimeout(timeoutIndex);
  timeoutIndex = setTimeout(scrollInfinity, 200);
}

function scrollInfinity(){
  let scollHeight = window.innerHeight + window.scrollY + 20;
  if (scollHeight >= document.body.offsetHeight) {
    loadMore();  
  }
}

function smoothWindowScroll() {
  const { height: cardHeight } =
    gallery.firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
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
    const response = await axios(request);
    data = response.data;
  } catch (error) {
    data = Notify.failure(error);
    return;
  }
  return fetchJsonCallback(data);
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
    loadComplete = true;
    Notify.warning(totalLastMessage);
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
