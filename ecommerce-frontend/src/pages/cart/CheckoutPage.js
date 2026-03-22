import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { MapPin, Tag, CreditCard } from 'lucide-react';
import { userApi, orderApi } from '../../api';
import { Layout } from '../../components/layout';
import { Button, Input, Spinner } from '../../components/ui';
import { AddressCard } from '../../components/common';
import { useCart } from '../../hooks/useCart';
import { formatPrice } from '../../utils';
import { PAYMENT_METHODS, ROUTES } from '../../constants';
import toast from 'react-hot-toast';

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totalAmount, fetchCart } = useCart();
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('UPI');
  const [couponCode, setCouponCode] = useState('');
  const [placing, setPlacing] = useState(false);

  useEffect(() => { fetchCart(); }, []);

  const { data: addressesData, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userApi.getAddresses(),
  });

  const addresses = addressesData?.data?.data || [];

  useEffect(() => {
    if (addresses.length > 0 && !selectedAddress) {
      setSelectedAddress(addresses[0]);
    }
  }, [addresses]);

  const handlePlaceOrder = async () => {
    if (!selectedAddress) {
      toast.error('Please select a delivery address');
      return;
    }
    if (items.length === 0) {
      toast.error('Your cart is empty');
      return;
    }
    try {
      setPlacing(true);
      const res = await orderApi.placeOrder({
        shippingAddressId: selectedAddress.id,
        billingAddressId: selectedAddress.id,
        paymentMethod,
        couponCode: couponCode || null,
      });
      toast.success('Order placed successfully!');
      navigate(`/orders/${res.data.data.id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  if (isLoading) return <Layout><Spinner className="py-32" size="lg" /></Layout>;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <h1 className="text-xl font-bold text-gray-900 mb-4">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">

            {/* Delivery Address */}
            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <MapPin size={18} className="text-[#2874f0]" />
                Delivery Address
              </h2>
              {addresses.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">No addresses found</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate(ROUTES.ADDRESSES)}
                  >
                    Add Address
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {addresses.map(address => (
                    <AddressCard
                      key={address.id}
                      address={address}
                      selectable
                      selected={selectedAddress?.id === address.id}
                      onSelect={setSelectedAddress}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <CreditCard size={18} className="text-[#2874f0]" />
                Payment Method
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {PAYMENT_METHODS.map(method => (
                  <button
                    key={method.value}
                    onClick={() => setPaymentMethod(method.value)}
                    className={`border-2 rounded-lg p-3 text-sm font-medium transition-all ${
                      paymentMethod === method.value
                        ? 'border-[#2874f0] bg-blue-50 text-[#2874f0]'
                        : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                  >
                    {method.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded shadow-sm p-4">
              <h2 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Tag size={18} className="text-[#2874f0]" />
                Apply Coupon
              </h2>
              <div className="flex gap-2">
                <Input
                  placeholder="Enter coupon code (e.g. SAVE10)"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1"
                />
                <Button variant="outline" size="md">
                  Apply
                </Button>
              </div>
              <div className="flex gap-2 mt-2">
                {['SAVE10', 'FLAT200', 'WELCOME50'].map(code => (
                  <button
                    key={code}
                    onClick={() => setCouponCode(code)}
                    className="text-xs bg-green-50 text-green-700 border border-green-200 px-2 py-1 rounded hover:bg-green-100 transition-colors"
                  >
                    {code}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded shadow-sm p-4 sticky top-20">
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                Order Summary
              </h2>

              <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
                {items.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600 line-clamp-1 flex-1 mr-2">
                      {item.productName} × {item.quantity}
                    </span>
                    <span className="font-medium flex-shrink-0">
                      {formatPrice(item.subtotal)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Delivery</span>
                  <span className="text-green-600">FREE</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-base">
                  <span>Total</span>
                  <span>{formatPrice(totalAmount)}</span>
                </div>
              </div>

              <Button
                fullWidth
                size="lg"
                className="mt-4"
                onClick={handlePlaceOrder}
                loading={placing}
                disabled={!selectedAddress || items.length === 0}
              >
                Place Order
              </Button>

              <p className="text-xs text-gray-400 text-center mt-2">
                Safe and Secure Payments
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CheckoutPage;