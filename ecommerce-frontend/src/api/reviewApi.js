import axiosInstance from './axiosInstance';

export const reviewApi = {
  getProductReviews: (productId, page = 0, size = 10) =>
    axiosInstance.get(`/api/reviews/product/${productId}?page=${page}&size=${size}`),

  addReview: (data) =>
    axiosInstance.post('/api/reviews', data),

  deleteReview: (id) =>
    axiosInstance.delete(`/api/reviews/${id}`),
};