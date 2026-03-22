import axios from 'axios';
import { API_BASE_URL } from '../constants';

const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach JWT token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle 401
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Token expired — try refresh
    if (error.response?.status === 401 &&
        !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const userId = localStorage.getItem('userId');
        const refreshToken = localStorage.getItem('refreshToken');

        if (userId && refreshToken) {
          const response = await axios.post(
            `${API_BASE_URL}/api/auth/refresh`,
            { userId: parseInt(userId), refreshToken }
          );

          const newToken = response.data.data.accessToken;
          localStorage.setItem('accessToken', newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return axiosInstance(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed — clear storage and redirect to login
        localStorage.clear();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;