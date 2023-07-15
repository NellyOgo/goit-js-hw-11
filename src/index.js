const API_KEY = '38183263-7b55f24cf30c776edf1c7da27';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";
import axios from 'axios';
import Notiflix from 'notiflix';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const notification = document.querySelector('.notification');

let currentPage = 1;
let searchQuery = '';
let notificationShown = false;

form.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

function handleFormSubmit(event) {
  event.preventDefault();
  searchQuery = event.target.searchQuery.value.trim();
  currentPage = 1;
  clearGallery();
  searchImages();
}

const lightbox = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
  animationSlide: false,
  history: false
});

async function searchImages() {
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`;

  try {
    const response = await axios.get(url);
    const data = response.data;

    if (data.hits.length === 0) {
      showNotification('Sorry, there are no images matching your search query. Please try again.');
      return;
    } else {
      if (currentPage === 1) {
        showNotification(`Hooray! We found ${data.totalHits} images.`);
      }
      renderImages(data.hits);
      showLoadMoreBtn();

      if (data.totalHits <= currentPage * 40) {
        hideLoadMoreBtn();
        showNotification("We're sorry, but you've reached the end of search results.");
      }

      scrollToNextGroup();
    }
  } catch (error) {
    showNotification('An error occurred while fetching images. Please try again later.');
  }
}

function renderImages(images) {
  const fragment = document.createDocumentFragment();

  images.forEach(image => {
    const card = createImageCard(image);
    fragment.appendChild(card);
  });

  gallery.appendChild(fragment);
  lightbox.refresh();
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.className = 'photo-card';

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';

  const info = document.createElement('div');
  info.className = 'info';

  const likes = createInfoItem('Likes', image.likes);
  const views = createInfoItem('Views', image.views);
  const comments = createInfoItem('Comments', image.comments);
  const downloads = createInfoItem('Downloads', image.downloads);

  info.appendChild(likes);
  info.appendChild(views);
  info.appendChild(comments);
  info.appendChild(downloads);

  card.appendChild(img);
  card.appendChild(info);

  return card;
}

function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.className = 'info-item';
  item.textContent = `${label}: ${value}`;
  return item;
}

function clearGallery() {
  gallery.innerHTML = '';
}

function showLoadMoreBtn() {
  loadMoreBtn.style.display = 'block';
}

function hideLoadMoreBtn() {
  loadMoreBtn.style.display = 'none';
}

function loadMoreImages() {
  currentPage++;
  searchImages();
}

function scrollToNextGroup() {
  const { height: cardHeight } = document
    .querySelector(".gallery")
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: "smooth",
  });
}

function showNotification(message) {
  Notiflix.Notify.info(message);
  setTimeout(() => {
    Notiflix.Notify.remove();
  }, 4000);
}