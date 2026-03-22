import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Package, Plus, ChevronRight } from 'lucide-react';
import { productApi, sellerApi } from '../../api';
import { Layout } from '../../components/layout';
import { Spinner, Button, Badge } from '../../components/ui';
import { formatPrice } from '../../utils';

const SellerDashboard = () => {
  const navigate = useNavigate();

  const { data: productsData, isLoading } = useQuery({
    queryKey: ['seller', 'products'],
    queryFn: () => productApi.getMyProducts(0, 10),
  });

  const { data: profileData } = useQuery({
    queryKey: ['seller', 'profile'],
    queryFn: () => sellerApi.getProfile(),
  });

  const products = productsData?.data?.data?.content || [];
  const profile = profileData?.data?.data;

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
            {profile && (
              <p className="text-gray-500 text-sm mt-1">
                {profile.storeName} •{' '}
                <Badge variant={profile.isVerified ? 'success' : 'warning'}>
                  {profile.isVerified ? 'Verified' : 'Pending Verification'}
                </Badge>
              </p>
            )}
          </div>
          <Button
            onClick={() => navigate('/seller/products/new')}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Add Product
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {[
            {
              title: 'My Products',
              desc: 'Manage your product listings',
              path: '/seller/products',
              icon: Package,
              color: 'text-blue-500',
            },
            {
              title: 'Store Profile',
              desc: 'Update your store information',
              path: '/seller/profile',
              icon: Package,
              color: 'text-green-500',
            },
          ].map(action => (
            <div
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-white rounded shadow-sm p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <action.icon size={24} className={action.color} />
                <div>
                  <p className="font-semibold text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          ))}
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-gray-900">Recent Products</h2>
            <button
              onClick={() => navigate('/seller/products')}
              className="text-sm text-[#2874f0] hover:underline flex items-center gap-1"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>

          {isLoading ? (
            <Spinner className="py-10" />
          ) : products.length === 0 ? (
            <div className="text-center py-10">
              <Package size={40} className="text-gray-300 mx-auto mb-2" />
              <p className="text-gray-500 text-sm mb-3">No products yet</p>
              <Button
                size="sm"
                onClick={() => navigate('/seller/products/new')}
              >
                Add Your First Product
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {products.map(product => (
                <div
                  key={product.id}
                  className="flex items-center gap-3 p-3 border border-gray-100 rounded hover:bg-gray-50 transition-colors"
                >
                  <img
                    src={product.imageUrls?.[0] ||
                      'https://via.placeholder.com/48x48?text=Img'}
                    alt={product.name}
                    className="w-12 h-12 object-contain rounded border border-gray-100"
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/48x48?text=Img';
                    }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 line-clamp-1">
                      {product.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      Stock: {product.stock} •{' '}
                      {product.category?.name}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-semibold text-gray-900">
                      {formatPrice(product.price)}
                    </p>
                    <Badge variant={product.isActive ? 'success' : 'danger'}>
                      {product.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SellerDashboard;