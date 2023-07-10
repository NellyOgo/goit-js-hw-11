const API_KEY = '38183263-7b55f24cf30c776edf1c7da27';

const form = document.getElementById('search-form');
const gallery = document.querySelector('.gallery');
const loadMoreBtn = document.querySelector('.load-more');
const notification = document.querySelector('.notification');

let currentPage = 1;
let searchQuery = '';

form.addEventListener('submit', handleFormSubmit);
loadMoreBtn.addEventListener('click', loadMoreImages);

function handleFormSubmit(event) {
  event.preventDefault();
  searchQuery = event.target.searchQuery.value.trim();
  currentPage = 1;
  clearGallery();
  searchImages();
}

async function searchImages() {
  const url = `https://pixabay.com/api/?key=${API_KEY}&q=${searchQuery}&image_type=photo&orientation=horizontal&safesearch=true&page=${currentPage}&per_page=40`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.hits.length > 0) {
      renderImages(data.hits);
      showLoadMoreBtn();
      showNotification(`Hooray! We found ${data.totalHits} images.`);
      scrollToNextGroup();
    } else {
      showNotification('Sorry, there are no images matching your search query. Please try again.');
    }

    if (data.totalHits <= currentPage * 40) {
      hideLoadMoreBtn();
      showNotification("We're sorry, but you've reached the end of search results.");
    }
  } catch (error) {
    console.log(error);
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

  const lightbox = new SimpleLightbox('.gallery a', {
    captionsData: 'alt',
    captionPosition: 'bottom',
    captionDelay: 250,
    animationSlide: false,
    history: false
  });

  lightbox.refresh();
}

function createImageCard(image) {
  const card = document.createElement('div');
  card.className = 'photo-card';

  const imageLink = document.createElement('a');
  imageLink.href = image.largeImageURL;
  imageLink.setAttribute('data-lightbox', 'image');
  card.appendChild(imageLink);

  const img = document.createElement('img');
  img.src = image.webformatURL;
  img.alt = image.tags;
  img.loading = 'lazy';
  imageLink.appendChild(img);

  const info = document.createElement('div');
  info.className = 'info';
  card.appendChild(info);

  const likes = createInfoItem('Likes', image.likes);
  info.appendChild(likes);

  const views = createInfoItem('Views', image.views);
  info.appendChild(views);

  const comments = createInfoItem('Comments', image.comments);
  info.appendChild(comments);

  const downloads = createInfoItem('Downloads', image.downloads);
  info.appendChild(downloads);

  return card;
}

function createInfoItem(label, value) {
  const item = document.createElement('p');
  item.className = 'info-item';
  item.innerHTML = `<b>${label}:</b> ${value}`;
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
  notification.textContent = message;
  notification.style.display = 'block';
  setTimeout(() => {
    notification.style.display = 'none';
  }, 3000);
}
