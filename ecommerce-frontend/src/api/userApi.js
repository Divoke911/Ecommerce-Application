import axiosInstance from './axiosInstance';

export const userApi = {
  getProfile: () =>
    axiosInstance.get('/api/users/me'),

  updateProfile: (data) =>
    axiosInstance.put('/api/users/me', data),

  changePassword: (data) =>
    axiosInstance.put('/api/users/me/change-password', data),

  getAddresses: () =>
    axiosInstance.get('/api/addresses'),

  addAddress: (data) =>
    axiosInstance.post('/api/addresses', data),

  updateAddress: (id, data) =>
    axiosInstance.put(`/api/addresses/${id}`, data),

  deleteAddress: (id) =>
    axiosInstance.delete(`/api/addresses/${id}`),
};