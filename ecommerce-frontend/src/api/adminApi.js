import axiosInstance from './axiosInstance';

export const adminApi = {
  getDashboard: () =>
    axiosInstance.get('/api/admin/dashboard'),

  getUsers: (page = 0, size = 20) =>
    axiosInstance.get(`/api/admin/users?page=${page}&size=${size}`),

  activateUser: (id) =>
    axiosInstance.put(`/api/admin/users/${id}/activate`),

  deactivateUser: (id) =>
    axiosInstance.put(`/api/admin/users/${id}/deactivate`),

  getOrders: (page = 0, size = 20) =>
    axiosInstance.get(`/api/admin/orders?page=${page}&size=${size}`),

  updateOrderStatus: (id, status) =>
    axiosInstance.put(`/api/admin/orders/${id}/status?status=${status}`),

  getProducts: (page = 0, size = 20) =>
    axiosInstance.get(`/api/admin/products?page=${page}&size=${size}`),

  activateProduct: (id) =>
    axiosInstance.put(`/api/admin/products/${id}/activate`),

  deactivateProduct: (id) =>
    axiosInstance.put(`/api/admin/products/${id}/deactivate`),

  getCoupons: (page = 0, size = 20) =>
    axiosInstance.get(`/api/admin/coupons?page=${page}&size=${size}`),

  createCoupon: (data) =>
    axiosInstance.post('/api/admin/coupons', data),

  updateCoupon: (id, data) =>
    axiosInstance.put(`/api/admin/coupons/${id}`, data),

  deleteCoupon: (id) =>
    axiosInstance.delete(`/api/admin/coupons/${id}`),

  verifySeller: (userId) =>
    axiosInstance.put(`/api/admin/sellers/${userId}/verify`),
};