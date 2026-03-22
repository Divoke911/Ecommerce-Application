import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { adminApi } from '../../api';
import { Layout } from '../../components/layout';
import { Spinner, Pagination, Badge } from '../../components/ui';
import { formatPrice, formatDate } from '../../utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const ORDER_STATUSES = [
  'PLACED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'
];

const statusVariant = {
  PLACED: 'primary',
  PROCESSING: 'warning',
  SHIPPED: 'purple',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const AdminOrdersPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'orders', page],
    queryFn: () => adminApi.getOrders(page, 20),
  });

  const pageData = data?.data?.data;
  const orders = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  const handleStatusChange = async (orderId, status) => {
    try {
      await adminApi.updateOrderStatus(orderId, status);
      queryClient.invalidateQueries(['admin', 'orders']);
      toast.success('Order status updated!');
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Manage Orders</h1>
        </div>

        {isLoading ? (
          <Spinner className="py-20" size="lg" />
        ) : (
          <>
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Order ID</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Amount</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Update Status</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map(order => (
                    <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3 font-medium text-[#2874f0]">
                        #{order.id}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {formatDate(order.createdAt)}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {formatPrice(order.finalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={statusVariant[order.status]}>
                          {order.status}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="text-xs border border-gray-300 rounded px-2 py-1 focus:outline-none focus:border-[#2874f0]"
                        >
                          {ORDER_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={setPage}
            />
          </>
        )}
      </div>
    </Layout>
  );
};

export default AdminOrdersPage;