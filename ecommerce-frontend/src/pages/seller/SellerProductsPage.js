import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit2, Trash2, ChevronLeft } from 'lucide-react';
import { productApi } from '../../api';
import { Layout } from '../../components/layout';
import { Button, Spinner, Pagination, Badge } from '../../components/ui';
import { formatPrice } from '../../utils';
import toast from 'react-hot-toast';

const SellerProductsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['seller', 'products', page],
    queryFn: () => productApi.getMyProducts(page, 20),
  });

  const pageData = data?.data?.data;
  const products = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productApi.delete(id);
      queryClient.invalidateQueries(['seller', 'products']);
      toast.success('Product deleted!');
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/seller')}
              className="text-gray-500 hover:text-gray-700"
            >
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">My Products</h1>
          </div>
          <Button
            onClick={() => navigate('/seller/products/new')}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Add Product
          </Button>
        </div>

        {isLoading ? (
          <Spinner className="py-20" size="lg" />
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-gray-500 mb-4">No products yet</p>
            <Button onClick={() => navigate('/seller/products/new')}>
              Add Your First Product
            </Button>
          </div>
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
                    <th className="text-left px-4 py-3 text-gray-600 font-semibold">Actions</th>
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
                          <p className="font-medium text-gray-900 line-clamp-1">
                            {product.name}
                          </p>
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
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => navigate(`/seller/products/edit/${product.id}`)}
                            className="text-[#2874f0] hover:text-blue-700 transition-colors"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-500 hover:text-red-600 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
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

export default SellerProductsPage;