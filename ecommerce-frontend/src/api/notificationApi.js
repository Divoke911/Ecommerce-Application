import axiosInstance from './axiosInstance';

export const notificationApi = {
  getNotifications: (page = 0, size = 20) =>
    axiosInstance.get(`/api/notifications?page=${page}&size=${size}`),

  getUnreadCount: () =>
    axiosInstance.get('/api/notifications/unread-count'),

  markAsRead: (id) =>
    axiosInstance.put(`/api/notifications/${id}/read`),

  markAllAsRead: () =>
    axiosInstance.put('/api/notifications/read-all'),
};