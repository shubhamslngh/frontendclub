import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";
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

const getAccessToken = () => localStorage.getItem('club_token');
const getRefreshToken = () => localStorage.getItem('club_refresh_token');
const setAccessToken = (token) => localStorage.setItem('club_token', token);

// Interceptor to automatically add the Bearer token to every request
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

let refreshPromise = null;
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (!originalRequest || originalRequest._retry) {
      return Promise.reject(error);
    }
    if (originalRequest.url?.includes('/api/auth/token/refresh/')) {
      return Promise.reject(error);
    }
    if (error.response?.status !== 401) {
      return Promise.reject(error);
    }

    const refreshToken = getRefreshToken();
    if (!refreshToken) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;
    try {
      if (!refreshPromise) {
        refreshPromise = apiClient.post('/api/auth/token/refresh/', { refresh: refreshToken });
      }
      const refreshResponse = await refreshPromise;
      const newAccess = refreshResponse.data?.access;
      if (!newAccess) {
        refreshPromise = null;
        return Promise.reject(error);
      }
      setAccessToken(newAccess);
      refreshPromise = null;
      originalRequest.headers.Authorization = `Bearer ${newAccess}`;
      return apiClient(originalRequest);
    } catch (refreshError) {
      refreshPromise = null;
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;
