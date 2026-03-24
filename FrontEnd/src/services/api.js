import axios from 'axios';

const API = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('brewmap_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses globally — clear stale tokens
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is expired or invalid — clean up
      const token = localStorage.getItem('brewmap_token');
      if (token) {
        localStorage.removeItem('brewmap_token');
        localStorage.removeItem('brewmap_user');
        // Redirect to login (non-React redirect as a fallback)
        if (window.location.pathname !== '/login' && window.location.pathname !== '/register') {
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────────────────────────────
export const register = (email, password) =>
  API.post('/auth/register', { email, password });

export const login = (email, password) =>
  API.post('/auth/login', { email, password });

// ── Shops ─────────────────────────────────────────────────────────────────────
export const getRecommendations = (lat, lng, radius = 5000) =>
  API.get('/shops/recommend', { params: { lat, lng, radius } });

export const getShopDetail = (placeId) =>
  API.get(`/shops/${placeId}`);

export const getShopPhotos = (placeId) =>
  API.get(`/shops/${placeId}/photos`);

export const getShopReviews = (placeId, page = 1, pageSize = 10) =>
  API.get(`/shops/${placeId}/reviews`, { params: { page, page_size: pageSize } });

export const getDirections = (placeId, originLat, originLng) =>
  API.get(`/shops/${placeId}/directions`, {
    params: { origin_lat: originLat, origin_lng: originLng },
  });

export const logInteraction = (placeId, interactionType) =>
  API.post(`/shops/${placeId}/interact`, { interaction_type: interactionType });

export default API;
