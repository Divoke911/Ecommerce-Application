import axiosInstance from './axiosInstance';

export const sellerApi = {
  createProfile: (data) =>
    axiosInstance.post('/api/seller/profile', data),

  getProfile: () =>
    axiosInstance.get('/api/seller/profile'),

  updateProfile: (data) =>
    axiosInstance.put('/api/seller/profile', data),
};