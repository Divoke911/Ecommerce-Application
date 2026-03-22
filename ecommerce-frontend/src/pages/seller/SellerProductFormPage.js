import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft } from 'lucide-react';
import { productApi, categoryApi } from '../../api';
import { Layout } from '../../components/layout';
import { Button, Input, Spinner } from '../../components/ui';
import toast from 'react-hot-toast';

const SellerProductFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', price: '',
    stock: '', categoryId: '',
  });
  const [errors, setErrors] = useState({});

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
    enabled: isEditing,
  });

  const categories = categoriesData?.data?.data || [];
  const leafCategories = categories.filter(c => c.parentId !== null);

  useEffect(() => {
    if (productData?.data?.data) {
      const p = productData.data.data;
      setForm({
        name: p.name || '',
        description: p.description || '',
        price: p.price || '',
        stock: p.stock || '',
        categoryId: p.category?.id || '',
      });
    }
  }, [productData]);

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.price || form.price <= 0) errs.price = 'Valid price is required';
    if (!form.stock || form.stock < 0) errs.stock = 'Valid stock is required';
    if (!form.categoryId) errs.categoryId = 'Category is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setSaving(true);
      const payload = {
        ...form,
        price: parseFloat(form.price),
        stock: parseInt(form.stock),
        categoryId: parseInt(form.categoryId),
      };
      if (isEditing) {
        await productApi.update(id, payload);
        toast.success('Product updated!');
      } else {
        await productApi.create(payload);
        toast.success('Product created!');
      }
      navigate('/seller/products');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  if (isEditing && isLoading) return (
    <Layout><Spinner className="py-32" size="lg" /></Layout>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/seller/products')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">
            {isEditing ? 'Edit Product' : 'Add New Product'}
          </h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded shadow-sm p-6 space-y-4">
          <Input
            label="Product Name"
            placeholder="Enter product name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            error={errors.name}
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              placeholder="Enter product description"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={4}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Price (₹)"
              type="number"
              placeholder="0.00"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              error={errors.price}
              required
            />
            <Input
              label="Stock"
              type="number"
              placeholder="0"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
              error={errors.stock}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
              className={`w-full border rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0] ${
                errors.categoryId ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Select category</option>
              {leafCategories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {errors.categoryId && (
              <p className="mt-1 text-xs text-red-500">{errors.categoryId}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" fullWidth size="lg" loading={saving}>
              {isEditing ? 'Update Product' : 'Create Product'}
            </Button>
            <Button
              type="button"
              fullWidth
              variant="ghost"
              size="lg"
              onClick={() => navigate('/seller/products')}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </Layout>
  );
};

export default SellerProductFormPage;