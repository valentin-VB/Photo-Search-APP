import axios from 'axios';

const API_KEY = '30519885-13d533e53ec26923d7aa1bf0b';
const BASE_URL = `https://pixabay.com/api/`;

export class PhotosApiService {
  constructor() {
    this.searchQuery = '';
    this.page = 1;
    this.maxImagesQuantity = null;
    this.imagesArray = [];
    this.totalFoundImages = null;
  }

  async fetchImagesViaAxios(pageCount) {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: this.searchQuery,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: 'true',
        page: this.page,
        per_page: 42,
      },
    });
    this.page += 1;
    return {
      imagesArray: response.data.hits,
      maxImagesQuantity: response.data.totalHits,
    };
  }

  get query() {
    return this.searchQuery;
  }

  set query(newQuery) {
    this.searchQuery = newQuery;
  }

  resetPage() {
    this.page = 1;
  }
}
