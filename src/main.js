import { fetchImages } from './js/pixabay-api.js';
import { renderGallery, clearGallery } from './js/render-functions.js';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';
import iziToast from 'izitoast';
import 'izitoast/dist/css/iziToast.min.css';

const form = document.querySelector('.search-form');
const galleryContainer = document.querySelector('.gallery');
const loader = document.querySelector('.loader');
const loadMoreButton = document.querySelector('.load-more');
let page = 1;
const perPage = 15;
let lightbox;
let query = '';

form.addEventListener('submit', onFormSubmit);
loadMoreButton.addEventListener('click', onLoadMore);
async function onFormSubmit(e) {
  e.preventDefault();
  query = e.currentTarget.elements.searchQuery.value.trim();

  if (!query) {
    iziToast.error({
      message: 'Please enter a search query!',
      position: 'topRight',
      theme: 'dark',
      backgroundColor: 'red',
    });
    return;
  }

  page = 1;
  clearGallery(galleryContainer);
  toggleLoadMoreButton(false);
  clearEndMessage();
  try {
    toggleLoader(true);
    const { hits, totalHits } = await fetchImages(query, page, perPage);

    if (!hits.length) {
      iziToast.error({
        message: 'Sorry, there are no images matching your search query.',
        position: 'topRight',
        theme: 'dark',
        backgroundColor: 'red',
      });
      return;
    }

    galleryContainer.insertAdjacentHTML('beforeend', renderGallery(hits));
    initializeLightbox();

    iziToast.success({
      message: `Found ${totalHits} images!`,
      position: 'topRight',
      theme: 'dark',
    });
    if (totalHits > perPage) {
      toggleLoadMoreButton(true); // Показуємо кнопку, якщо є більше зображень
    }
  } catch (error) {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
      theme: 'dark',
      backgroundColor: 'red',
    });
  } finally {
    toggleLoader(false);
  }
}
async function onLoadMore() {
  page += 1;
  try {
    toggleLoader(true);
    const { hits, totalHits } = await fetchImages(query, page, perPage);
    galleryContainer.insertAdjacentHTML('beforeend', renderGallery(hits));
    initializeLightbox();

    if (page * perPage >= totalHits) {
      toggleLoadMoreButton(false); // Ховаємо кнопку, якщо завантажили всі зображення
      showEndMessage();
    } else {
      smoothScroll();
    }
  } catch (error) {
    iziToast.error({
      message: 'Something went wrong. Please try again later.',
      position: 'topRight',
      theme: 'dark',
      backgroundColor: 'red',
    });
  } finally {
    toggleLoader(false);
  }
}
function toggleLoader(isLoading) {
  loader.style.display = isLoading ? 'block' : 'none';
  loadMoreButton.disabled = isLoading; // Вимикаємо кнопку під час завантаження
  loadMoreButton.textContent = isLoading ? 'Loading...' : 'Load More';
}
function toggleLoadMoreButton(isVisible) {
  loadMoreButton.style.display = isVisible ? 'block' : 'none';
}
function initializeLightbox() {
  if (lightbox) {
    lightbox.refresh();
  } else {
    lightbox = new SimpleLightbox('.gallery a', {
      captionsData: 'alt',
      captionPosition: 'bottom',
      captionDelay: 250,
    });
  }
}
function showEndMessage() {
  const message = `<p class="end-message">We're sorry, but you've reached the end of search results.</p>`;
  galleryContainer.insertAdjacentHTML('afterend', message);
}

function clearEndMessage() {
  const endMessage = document.querySelector('.end-message');
  if (endMessage) {
    endMessage.remove();
  }
}

function smoothScroll() {
  const firstElement = galleryContainer.firstElementChild;
  if (!firstElement) return;
  const { height: cardHeight } = firstElement.getBoundingClientRect();
  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
