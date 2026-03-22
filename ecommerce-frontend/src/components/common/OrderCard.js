import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { formatPrice, formatDate } from '../../utils';
import { ORDER_STATUS_COLORS } from '../../constants';
import Badge from '../ui/Badge';

const OrderCard = ({ order }) => {
  const statusVariant = {
    PLACED: 'primary',
    PROCESSING: 'warning',
    SHIPPED: 'purple',
    DELIVERED: 'success',
    CANCELLED: 'danger',
  };

  return (
    <Link to={`/orders/${order.id}`}>
      <div className="bg-white rounded shadow-sm hover:shadow-md transition-shadow p-4 border border-gray-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Package size={18} className="text-[#2874f0]" />
            <span className="font-semibold text-gray-900">
              Order #{order.id}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={statusVariant[order.status]}>
              {order.status}
            </Badge>
            <ChevronRight size={16} className="text-gray-400" />
          </div>
        </div>

        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>{formatDate(order.createdAt)}</span>
          <span className="font-semibold text-gray-900">
            {formatPrice(order.finalAmount)}
          </span>
        </div>

        {order.items && order.items.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              {order.items.length} item{order.items.length > 1 ? 's' : ''}: {' '}
              {order.items.slice(0, 2).map(item => item.productName).join(', ')}
              {order.items.length > 2 && ` +${order.items.length - 2} more`}
            </p>
          </div>
        )}
      </div>
    </Link>
  );
};

export default OrderCard;