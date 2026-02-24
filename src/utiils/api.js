import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
const normalizedBaseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;

const apiClient = axios.create({
  baseURL: normalizedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});
const apiData = axios.create({
  baseURL: `${normalizedBaseUrl}api/`,
  headers: {
    'Content-Type': 'application/json',
  },
});


// Interceptor to automatically add the Token to every request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('club_token'); // We will store it here after login
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default apiClient;
