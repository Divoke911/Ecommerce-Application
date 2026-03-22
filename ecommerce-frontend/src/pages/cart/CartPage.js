import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { Layout } from '../../components/layout';
import { Button, EmptyState, Spinner } from '../../components/ui';
import { useCart } from '../../hooks/useCart';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { selectCartLoading } from '../../store/slices/cartSlice';
import { formatPrice } from '../../utils';
import { ROUTES } from '../../constants';

const CartPage = () => {
  const navigate = useNavigate();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const loading = useSelector(selectCartLoading);
  const { items, totalAmount, totalItems, fetchCart, updateCartItem, removeFromCart } = useCart();

  useEffect(() => {
    if (isAuthenticated) fetchCart();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="max-w-7xl mx-auto px-4 py-16 text-center">
          <ShoppingBag size={64} className="text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Your cart is empty</h2>
          <p className="text-gray-500 mb-6">Login to view your cart</p>
          <Button onClick={() => navigate(ROUTES.LOGIN)}>Login</Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 mb-4">
          My Cart {totalItems > 0 && `(${totalItems})`}
        </h1>

        {loading && items.length === 0 ? (
          <Spinner className="py-20" size="lg" />
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingBag}
            title="Your cart is empty"
            description="Add items to your cart to checkout"
            actionLabel="Shop Now"
            onAction={() => navigate(ROUTES.PRODUCTS)}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {items.map(item => (
                <div key={item.id} className="bg-white rounded shadow-sm p-4">
                  <div className="flex gap-4">
                    <img
                      src={item.productImage || 'https://via.placeholder.com/80x80?text=Img'}
                      alt={item.productName}
                      className="w-20 h-20 object-contain rounded border border-gray-100"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=Img';
                      }}
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {item.productName}
                      </h3>
                      <p className="text-lg font-bold text-gray-900 mb-3">
                        {formatPrice(item.unitPrice)}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center border border-gray-300 rounded">
                          <button
                            onClick={() => updateCartItem(item.productId, item.quantity - 1)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="px-4 py-1 border-x border-gray-300 text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateCartItem(item.productId, item.quantity + 1)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 transition-colors"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.productId)}
                          className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                        >
                          <Trash2 size={14} /> Remove
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100 flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-semibold">{formatPrice(item.subtotal)}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded shadow-sm p-4 sticky top-20">
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                  Price Details
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price ({totalItems} items)</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Charges</span>
                    <span className="text-green-600">FREE</span>
                  </div>
                  <div className="border-t pt-3 flex justify-between font-bold text-base">
                    <span>Total Amount</span>
                    <span>{formatPrice(totalAmount)}</span>
                  </div>
                  <p className="text-xs text-green-600">
                    You will save on this order!
                  </p>
                </div>
                <Button
                  fullWidth
                  size="lg"
                  className="mt-4"
                  onClick={() => navigate(ROUTES.CHECKOUT)}
                >
                  Place Order
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default CartPage;