import axiosInstance from './axiosInstance';

export const productApi = {
  getAll: (page = 0, size = 12, sort = 'price') =>
    axiosInstance.get(`/api/products?page=${page}&size=${size}&sort=${sort}`),

  getById: (id) =>
    axiosInstance.get(`/api/products/${id}`),

  search: (name, page = 0, size = 12) =>
    axiosInstance.get(`/api/products/search?name=${name}&page=${page}&size=${size}`),

  getByCategory: (categoryId, page = 0, size = 12) =>
    axiosInstance.get(`/api/products/category/${categoryId}?page=${page}&size=${size}`),

  getMyProducts: (page = 0, size = 12) =>
    axiosInstance.get(`/api/products/my?page=${page}&size=${size}`),

  create: (data) =>
    axiosInstance.post('/api/products', data),

  update: (id, data) =>
    axiosInstance.put(`/api/products/${id}`, data),

  delete: (id) =>
    axiosInstance.delete(`/api/products/${id}`),

  addImage: (id, url, isPrimary = false) =>
    axiosInstance.post(`/api/products/${id}/images?url=${url}&isPrimary=${isPrimary}`),

  deleteImage: (id, imageId) =>
    axiosInstance.delete(`/api/products/${id}/images/${imageId}`),
};