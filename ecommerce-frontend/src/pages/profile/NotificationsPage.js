import React from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, Check } from 'lucide-react';
import { notificationApi } from '../../api';
import { Layout } from '../../components/layout';
import { Button, Spinner, EmptyState } from '../../components/ui';
import { formatDateTime } from '../../utils';
import { useDispatch } from 'react-redux';
import { resetUnreadCount } from '../../store/slices/notificationSlice';
import toast from 'react-hot-toast';

const NotificationsPage = () => {
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationApi.getNotifications(0, 20),
  });

  const notifications = data?.data?.data?.content || [];

  const handleMarkAllRead = async () => {
    try {
      await notificationApi.markAllAsRead();
      dispatch(resetUnreadCount());
      queryClient.invalidateQueries(['notifications']);
      toast.success('All notifications marked as read');
    } catch (err) {
      toast.error('Failed to mark notifications as read');
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await notificationApi.markAsRead(id);
      queryClient.invalidateQueries(['notifications']);
    } catch (err) {}
  };

  const typeColors = {
    ORDER_UPDATE: 'bg-blue-100 text-blue-600',
    PROMO: 'bg-orange-100 text-orange-600',
    SYSTEM: 'bg-gray-100 text-gray-600',
  };

  const typeEmoji = {
    ORDER_UPDATE: '📦',
    PROMO: '🎉',
    SYSTEM: '⚙️',
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">Notifications</h1>
          {notifications.some(n => !n.isRead) && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleMarkAllRead}
              className="flex items-center gap-2"
            >
              <Check size={14} /> Mark All Read
            </Button>
          )}
        </div>

        {isLoading ? (
          <Spinner className="py-20" size="lg" />
        ) : notifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications"
            description="You're all caught up!"
          />
        ) : (
          <div className="space-y-2">
            {notifications.map(notification => (
              <div
                key={notification.id}
                onClick={() => !notification.isRead && handleMarkRead(notification.id)}
                className={`bg-white rounded shadow-sm p-4 flex items-start gap-3 cursor-pointer hover:shadow-md transition-shadow ${
                  !notification.isRead ? 'border-l-4 border-[#2874f0]' : ''
                }`}
              >
                <span className="text-2xl flex-shrink-0">
                  {typeEmoji[notification.type] || '🔔'}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className={`text-sm font-medium ${
                      !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {notification.title}
                    </p>
                    {!notification.isRead && (
                      <span className="w-2 h-2 bg-[#2874f0] rounded-full flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDateTime(notification.createdAt)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default NotificationsPage;