import axiosInstance from './axiosInstance';

export const authApi = {
  register: (data) =>
    axiosInstance.post('/api/auth/register', data),

  verifyEmail: (data) =>
    axiosInstance.post('/api/auth/verify-email', data),

  resendOtp: (email) =>
    axiosInstance.post(`/api/auth/resend-otp?email=${email}`),

  login: (data) =>
    axiosInstance.post('/api/auth/login', data),

  verifyLoginOtp: (data) =>
    axiosInstance.post('/api/auth/verify-login-otp', data),

  forgotPassword: (email) =>
    axiosInstance.post(`/api/auth/forgot-password?email=${email}`),

  resetPassword: (data) =>
    axiosInstance.post('/api/auth/reset-password', data),

  logout: (userId) =>
    axiosInstance.post(`/api/auth/logout?userId=${userId}`),

  refreshToken: (data) =>
    axiosInstance.post('/api/auth/refresh', data),
};