import { PhotosApiService } from './photos-api-service';
import { Notify } from 'notiflix/build/notiflix-notify-aio';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import throttle from 'lodash.throttle';

const refs = {
  form: document.querySelector('#search-form'),
  gallery: document.querySelector('.gallery'),
};

refs.form.addEventListener('submit', throttle(onSearchSubmit, 300));
window.addEventListener('scroll', throttle(positionCheck, 250));
window.addEventListener('resize', throttle(positionCheck, 250));

let lithboxGallery = new SimpleLightbox('.lithboxImage');
const photosApiService = new PhotosApiService();

async function onSearchSubmit(evt) {
  evt.preventDefault();

  photosApiService.query = evt.currentTarget.elements.searchQuery.value;
  photosApiService.resetPage();
  const response = await photosApiService.fetchImagesViaAxios();
  photosApiService.maxImagesQuantity = response.maxImagesQuantity;
  photosApiService.imagesArray = response.imagesArray;
  photosApiService.totalFoundImages = response.imagesArray.length;
  


  if (response.imagesArray.length === 0) {
    clearGalleryContainer();
    Notify.failure('Sorry, there are no images matching your search query. Please try again.');
    return;
  }
  
  Notify.success(`We found ${photosApiService.totalFoundImages} images.`);
  refs.gallery.innerHTML = galleryMarkup(response.imagesArray);
  lithboxGallery.refresh();
  positionCheck();
}

async function additionalPhotoRender(evt) {
  photosApiService.totalFoundImages += photosApiService.imagesArray.length;

  if (photosApiService.totalFoundImages > photosApiService.maxImagesQuantity) {
    Notify.info("We're sorry, but you've reached the end of search results.");
    return;
  }

  const response = await photosApiService.fetchImagesViaAxios();
  refs.gallery.insertAdjacentHTML('beforeend', galleryMarkup(response.imagesArray));
  Notify.success(`We found ${photosApiService.totalFoundImages} images.`);
  lithboxGallery.refresh();
}

function galleryMarkup(images) {
  return images
    .map(image => {
      return `<div class="photo-card">
        <a class="lithboxImage" href="${image.largeImageURL}">
          <div class="image-wrapper">
            <img src="${image.webformatURL}" alt="${image.tags}" loading="lazy"/>
          </div>
          <div class="info">
          <p class="info-item">
            <b>Likes:</b>
            <span>${image.likes}</span> 
          </p>
          <p class="info-item">
            <b>Views:</b>
            <span> ${image.views}</span> 
          </p>
          <p class="info-item">
            <b>Comments:</b>
            <span>${image.comments}</span> 
          </p>
          <p class="info-item">
            <b>Downloads:</b>
            <span>${image.downloads}</span>
          </p>
        </div>
        </a>
      </div>`;
    })
    .join('');
}

function clearGalleryContainer() {
  refs.gallery.innerHTML = '';
}

function positionCheck() {
  const height = document.body.offsetHeight;
  const screenHeight = window.innerHeight;  
  const scrolled = window.scrollY
  const threshold = height - screenHeight / 4;
  const position = scrolled + screenHeight;

  if (position >= threshold) {
    additionalPhotoRender();
  }
}

