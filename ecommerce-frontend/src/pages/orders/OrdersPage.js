import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package } from 'lucide-react';
import { orderApi } from '../../api';
import { Layout } from '../../components/layout';
import { Spinner, Pagination, EmptyState } from '../../components/ui';
import { OrderCard } from '../../components/common';
import { ROUTES } from '../../constants';
import { useNavigate } from 'react-router-dom';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['orders', page],
    queryFn: () => orderApi.getMyOrders(page, 10),
  });

  const pageData = data?.data?.data;
  const orders = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 mb-4">My Orders</h1>

        {isLoading ? (
          <Spinner className="py-20" size="lg" />
        ) : orders.length === 0 ? (
          <EmptyState
            icon={Package}
            title="No orders yet"
            description="Start shopping to place your first order"
            actionLabel="Shop Now"
            onAction={() => navigate(ROUTES.PRODUCTS)}
          />
        ) : (
          <>
            <div className="space-y-3">
              {orders.map(order => (
                <OrderCard key={order.id} order={order} />
              ))}
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

export default OrdersPage;