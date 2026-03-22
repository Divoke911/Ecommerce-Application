import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Package, MapPin, CreditCard, Truck,
  ChevronLeft, X
} from 'lucide-react';
import { orderApi } from '../../api';
import { Layout } from '../../components/layout';
import { Spinner, Badge, Button } from '../../components/ui';
import { formatPrice, formatDate, formatDateTime } from '../../utils';
import { ORDER_STATUS_COLORS, ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const statusVariant = {
  PLACED: 'primary',
  PROCESSING: 'warning',
  SHIPPED: 'purple',
  DELIVERED: 'success',
  CANCELLED: 'danger',
};

const OrderDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: orderData, isLoading, refetch } = useQuery({
    queryKey: ['order', id],
    queryFn: () => orderApi.getById(id),
  });

  const { data: deliveryData } = useQuery({
    queryKey: ['delivery', id],
    queryFn: () => orderApi.getDelivery(id),
    enabled: !!id,
    retry: false,
  });

  const { data: transactionData } = useQuery({
    queryKey: ['transaction', id],
    queryFn: () => orderApi.getTransaction(id),
    enabled: !!id,
    retry: false,
  });

  const order = orderData?.data?.data;
  const delivery = deliveryData?.data?.data;
  const transaction = transactionData?.data?.data;

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;
    try {
      await orderApi.cancelOrder(id);
      toast.success('Order cancelled successfully');
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  if (isLoading) return (
    <Layout><Spinner className="py-32" size="lg" /></Layout>
  );

  if (!order) return (
    <Layout>
      <div className="text-center py-32 text-gray-500">Order not found</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-4">

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(ROUTES.ORDERS)}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            Order #{order.id}
          </h1>
          <Badge variant={statusVariant[order.status]}>
            {order.status}
          </Badge>
        </div>

        <div className="space-y-4">

          {/* Order Items */}
          <div className="bg-white rounded shadow-sm p-4">
            <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <Package size={18} className="text-[#2874f0]" />
              Order Items
            </h2>
            <div className="space-y-3">
              {order.items?.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Qty: {item.quantity} × {formatPrice(item.unitPrice)}
                    </p>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {formatPrice(item.subtotal)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price Summary */}
            <div className="mt-4 pt-3 border-t space-y-2 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatPrice(order.totalAmount)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>− {formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Delivery</span>
                <span className="text-green-600">FREE</span>
              </div>
              <div className="flex justify-between font-bold text-base border-t pt-2">
                <span>Total</span>
                <span>{formatPrice(order.finalAmount)}</span>
              </div>
            </div>
          </div>

          {/* Delivery Info */}
          {delivery && (
            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Truck size={18} className="text-[#2874f0]" />
                Delivery Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge variant={
                    delivery.deliveryStatus === 'DELIVERED' ? 'success' :
                    delivery.deliveryStatus === 'IN_TRANSIT' ? 'warning' : 'primary'
                  } className="mt-1">
                    {delivery.deliveryStatus}
                  </Badge>
                </div>
                {delivery.trackingId && (
                  <div>
                    <p className="text-gray-500">Tracking ID</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {delivery.trackingId}
                    </p>
                  </div>
                )}
                {delivery.courierPartner && (
                  <div>
                    <p className="text-gray-500">Courier</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {delivery.courierPartner}
                    </p>
                  </div>
                )}
                {delivery.scheduledDate && (
                  <div>
                    <p className="text-gray-500">Expected Delivery</p>
                    <p className="font-medium text-gray-900 mt-1">
                      {formatDate(delivery.scheduledDate)}
                    </p>
                  </div>
                )}
                {delivery.deliveredDate && (
                  <div>
                    <p className="text-gray-500">Delivered On</p>
                    <p className="font-medium text-green-600 mt-1">
                      {formatDate(delivery.deliveredDate)}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Transaction Info */}
          {transaction && (
            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-[#2874f0]" />
                Payment Information
              </h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Payment Method</p>
                  <p className="font-medium text-gray-900 mt-1">
                    {transaction.paymentMethod?.replace('_', ' ')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Status</p>
                  <Badge variant={
                    transaction.transactionStatus === 'SUCCESS' ? 'success' :
                    transaction.transactionStatus === 'PENDING' ? 'warning' : 'danger'
                  } className="mt-1">
                    {transaction.transactionStatus}
                  </Badge>
                </div>
                <div>
                  <p className="text-gray-500">Amount Paid</p>
                  <p className="font-bold text-gray-900 mt-1">
                    {formatPrice(transaction.amount)}
                  </p>
                </div>
                {transaction.gatewayRefId && (
                  <div>
                    <p className="text-gray-500">Reference ID</p>
                    <p className="font-medium text-gray-900 mt-1 text-xs">
                      {transaction.gatewayRefId}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Order Meta */}
          <div className="bg-white rounded shadow-sm p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-gray-500">Order Placed</p>
                <p className="font-medium text-gray-900 mt-1">
                  {formatDateTime(order.createdAt)}
                </p>
              </div>
              <div>
                <p className="text-gray-500">Order ID</p>
                <p className="font-medium text-gray-900 mt-1">#{order.id}</p>
              </div>
            </div>
          </div>

          {/* Cancel Button */}
          {(order.status === 'PLACED' || order.status === 'PROCESSING') && (
            <Button
              variant="danger"
              fullWidth
              onClick={handleCancel}
              className="flex items-center justify-center gap-2"
            >
              <X size={16} /> Cancel Order
            </Button>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default OrderDetailPage;