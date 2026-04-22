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
export const register = (username, email, password) =>
  API.post('/auth/register', { username, email, password });

export const login = (username, password) =>
  API.post('/auth/login', { username, password });

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

// ── Admin ─────────────────────────────────────────────────────────────────────
export const adminGetUsers = () => API.get('/admin/users');
export const adminUpdateUser = (id, data) => API.put(`/admin/users/${id}`, data);
export const adminDeleteUser = (id) => API.delete(`/admin/users/${id}`);

export const adminGetShops = () => API.get('/admin/shops');
export const adminAddShop = (data) => API.post('/admin/shops', data);
export const adminUpdateShop = (id, data) => API.put(`/admin/shops/${id}`, data);
export const adminDeleteShop = (id) => API.delete(`/admin/shops/${id}`);

export const adminGetReviews = () => API.get('/admin/reviews');
export const adminUpdateReview = (id, data) => API.put(`/admin/reviews/${id}`, data);
export const adminDeleteReview = (id) => API.delete(`/admin/reviews/${id}`);

export const adminGetConfig = () => API.get('/admin/config');
export const adminUpdateConfig = (key, data) => API.put(`/admin/config/${key}`, data);

export const adminGetAnalytics = () => API.get('/admin/analytics');

export default API;
