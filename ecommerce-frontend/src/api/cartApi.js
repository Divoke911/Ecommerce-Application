import axiosInstance from './axiosInstance';

export const cartApi = {
  getCart: () =>
    axiosInstance.get('/api/cart'),

  addItem: (data) =>
    axiosInstance.post('/api/cart/items', data),

  updateItem: (productId, quantity) =>
    axiosInstance.put(`/api/cart/items/${productId}?quantity=${quantity}`),

  removeItem: (productId) =>
    axiosInstance.delete(`/api/cart/items/${productId}`),
};