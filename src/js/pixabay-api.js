import axios from 'axios';

const API_KEY = '47567407-25ef3519c02546aa2529f6321';
const BASE_URL = 'https://pixabay.com/api/';
const PER_PAGE = 15;

export async function fetchImages(query, page = 1) {
  try {
    const response = await axios.get(BASE_URL, {
      params: {
        key: API_KEY,
        q: query,
        image_type: 'photo',
        orientation: 'horizontal',
        safesearch: true,
        page,
        per_page: PER_PAGE,
      },
    });
    return response.data;
  } catch (error) {
    iziToast.error({
      title: 'Fetch Error',
      message: `Something went wrong: ${error.message}`,
      position: 'topRight',
      theme: 'dark',
      backgroundColor: 'red',
    });
    throw error;
  }
}
