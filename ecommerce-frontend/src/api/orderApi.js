import axiosInstance from './axiosInstance';

export const orderApi = {
  placeOrder: (data) =>
    axiosInstance.post('/api/orders', data),

  getMyOrders: (page = 0, size = 10) =>
    axiosInstance.get(`/api/orders?page=${page}&size=${size}`),

  getById: (id) =>
    axiosInstance.get(`/api/orders/${id}`),

  cancelOrder: (id) =>
    axiosInstance.put(`/api/orders/${id}/cancel`),

  getDelivery: (id) =>
    axiosInstance.get(`/api/orders/${id}/delivery`),

  getTransaction: (id) =>
    axiosInstance.get(`/api/orders/${id}/transaction`),
};