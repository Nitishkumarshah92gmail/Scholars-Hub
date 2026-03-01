import axios from 'axios';
import { supabase } from './lib/supabase';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL || '/api' });

// Cache the session to avoid calling getSession() on every single API request
let _cachedSession = null;
let _sessionFetchedAt = 0;
const SESSION_CACHE_MS = 30_000; // refresh cached session every 30s

async function getCachedSession() {
  const now = Date.now();
  if (_cachedSession && now - _sessionFetchedAt < SESSION_CACHE_MS) {
    return _cachedSession;
  }
  const { data: { session } } = await supabase.auth.getSession();
  _cachedSession = session;
  _sessionFetchedAt = now;
  return session;
}

// Keep cache in sync when auth state changes
supabase.auth.onAuthStateChange((_event, session) => {
  _cachedSession = session;
  _sessionFetchedAt = Date.now();
});

// Attach Supabase access token to every request
API.interceptors.request.use(async (config) => {
  const session = await getCachedSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

// Handle 401 responses
API.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth (only GET /me — signup/login handled by Supabase Auth)
export const getMe = () => API.get('/auth/me');

// Posts
export const getFeed = (page = 1) => API.get(`/posts?page=${page}`);
export const getExplore = (params) => API.get('/posts/explore', { params });
export const getPost = (id) => API.get(`/posts/${id}`);
export const createPost = (data) => API.post('/posts', data);
export const likePost = (id) => API.post(`/posts/${id}/like`);
export const commentPost = (id, text) => API.post(`/posts/${id}/comment`, { text });
export const reportPost = (id, reason) => API.post(`/posts/${id}/report`, { reason });
export const deletePost = (id) => API.delete(`/posts/${id}`);
export const validateYoutubeUrl = (url) => API.get('/posts/youtube/validate', { params: { url } });

// Users
export const getUser = (id) => API.get(`/users/${id}`);
export const updateUser = (id, data) => API.put(`/users/${id}`, data);
export const followUser = (id) => API.post(`/users/${id}/follow`);
export const getTotalUsers = () => API.get('/users/stats/count');
export const getScholars = () => API.get('/users/scholars');
export const bookmarkPost = (postId) => API.post(`/users/bookmark/${postId}`);
export const getBookmarks = (id) => API.get(`/users/${id}/bookmarks`);
export const searchUsers = (q) => API.get(`/users/search/find?q=${q}`);

// Notifications
export const getNotifications = () => API.get('/notifications');
export const markNotificationsRead = () => API.put('/notifications/read');

// Google Drive Uploads
export const uploadFiles = (formData) =>
  API.post('/upload/files', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const uploadAvatar = (formData) =>
  API.post('/upload/avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

export default API;
