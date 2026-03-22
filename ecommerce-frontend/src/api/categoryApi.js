import axiosInstance from './axiosInstance';

export const categoryApi = {
  getAll: () =>
    axiosInstance.get('/api/categories'),

  getById: (id) =>
    axiosInstance.get(`/api/categories/${id}`),

  getSubcategories: (id) =>
    axiosInstance.get(`/api/categories/${id}/subcategories`),

  create: (data) =>
    axiosInstance.post('/api/categories', data),

  update: (id, data) =>
    axiosInstance.put(`/api/categories/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/api/categories/${id}`),
};