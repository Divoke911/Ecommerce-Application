import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { ChevronLeft, Eye, EyeOff } from 'lucide-react';
import { adminApi } from '../../api';
import { Layout } from '../../components/layout';
import { Spinner, Pagination, Badge } from '../../components/ui';
import { formatPrice } from '../../utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const AdminProductsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'products', page],
    queryFn: () => adminApi.getProducts(page, 20),
  });

  const pageData = data?.data?.data;
  const products = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  const handleToggleProduct = async (product) => {
    try {
      if (product.isActive) {
        await adminApi.deactivateProduct(product.id);
        toast.success('Product deactivated');
      } else {
        await adminApi.activateProduct(product.id);
        toast.success('Product activated');
      }
      queryClient.invalidateQueries(['admin', 'products']);
    } catch (err) {
      toast.error('Failed to update product status');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700">
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Manage Products</h1>
        </div>

        {isLoading ? (
          <Spinner className="py-20" size="lg" />
        ) : (
          <>
            <div className="bg-white rounded shadow-sm overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Product</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Category</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Price</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Stock</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b hover:bg-gray-50 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={product.imageUrls?.[0] ||
                              'https://via.placeholder.com/40x40?text=Img'}
                            alt={product.name}
                            className="w-10 h-10 object-contain rounded border border-gray-100"
                            onError={(e) => {
                              e.target.src =
                                'https://via.placeholder.com/40x40?text=Img';
                            }}
                          />
                          <div>
                            <p className="font-medium text-gray-900 line-clamp-1">
                              {product.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              by {product.sellerName}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.category?.name}
                      </td>
                      <td className="px-4 py-3 font-semibold">
                        {formatPrice(product.price)}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {product.stock}
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant={product.isActive ? 'success' : 'danger'}>
                          {product.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <button
                          onClick={() => handleToggleProduct(product)}
                          className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${
                            product.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                        >
                          {product.isActive ? (
                            <><EyeOff size={14} /> Deactivate</>
                          ) : (
                            <><Eye size={14} /> Activate</>
                          )}
                        </button>
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

export default AdminProductsPage;