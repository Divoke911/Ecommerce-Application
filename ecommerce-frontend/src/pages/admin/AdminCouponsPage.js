import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, ChevronLeft } from 'lucide-react';
import { adminApi } from '../../api';
import { Layout } from '../../components/layout';
import { Button, Input, Modal, Spinner, Badge } from '../../components/ui';
import { formatPrice, formatDate } from '../../utils';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const emptyForm = {
  code: '', discountType: 'PERCENT',
  discountValue: '', minOrderValue: '',
  maxUses: '', expiresAt: '',
};

const AdminCouponsPage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'coupons'],
    queryFn: () => adminApi.getCoupons(0, 20),
  });

  const coupons = data?.data?.data?.content || [];

  const handleCreate = async () => {
    if (!form.code || !form.discountValue) {
      toast.error('Code and discount value are required');
      return;
    }
    try {
      setSaving(true);
      await adminApi.createCoupon({
        ...form,
        discountValue: parseFloat(form.discountValue),
        minOrderValue: parseFloat(form.minOrderValue) || 0,
        maxUses: parseInt(form.maxUses) || null,
        expiresAt: form.expiresAt ? `${form.expiresAt}T23:59:59` : null,
      });
      queryClient.invalidateQueries(['admin', 'coupons']);
      toast.success('Coupon created!');
      setShowModal(false);
      setForm(emptyForm);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create coupon');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await adminApi.deleteCoupon(id);
      queryClient.invalidateQueries(['admin', 'coupons']);
      toast.success('Coupon deleted!');
    } catch (err) {
      toast.error('Failed to delete coupon');
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate('/admin')} className="text-gray-500 hover:text-gray-700">
              <ChevronLeft size={20} />
            </button>
            <h1 className="text-xl font-bold text-gray-900">Manage Coupons</h1>
          </div>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Create Coupon
          </Button>
        </div>

        {isLoading ? (
          <Spinner className="py-20" size="lg" />
        ) : (
          <div className="bg-white rounded shadow-sm overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50 border-b">
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Code</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Discount</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Min Order</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Uses</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Expires</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Status</th>
                  <th className="text-left px-4 py-3 text-gray-600 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="border-b hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono font-bold text-[#2874f0] bg-blue-50 px-2 py-0.5 rounded">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {coupon.discountType === 'PERCENT'
                        ? `${coupon.discountValue}%`
                        : formatPrice(coupon.discountValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {formatPrice(coupon.minOrderValue)}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.usedCount}/{coupon.maxUses || '∞'}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : 'Never'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant={coupon.isActive ? 'success' : 'danger'}>
                        {coupon.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => handleDelete(coupon.id)}
                        className="text-red-500 hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Create Coupon Modal */}
        <Modal
          isOpen={showModal}
          onClose={() => { setShowModal(false); setForm(emptyForm); }}
          title="Create New Coupon"
          size="lg"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Coupon Code"
                placeholder="e.g. SAVE10"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Discount Type <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.discountType}
                  onChange={(e) => setForm({ ...form, discountType: e.target.value })}
                  className="w-full border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#2874f0]"
                >
                  <option value="PERCENT">Percentage (%)</option>
                  <option value="FLAT">Flat Amount (₹)</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label={form.discountType === 'PERCENT' ? 'Discount %' : 'Discount Amount (₹)'}
                type="number"
                placeholder={form.discountType === 'PERCENT' ? '10' : '200'}
                value={form.discountValue}
                onChange={(e) => setForm({ ...form, discountValue: e.target.value })}
                required
              />
              <Input
                label="Min Order Value (₹)"
                type="number"
                placeholder="500"
                value={form.minOrderValue}
                onChange={(e) => setForm({ ...form, minOrderValue: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Max Uses"
                type="number"
                placeholder="100"
                value={form.maxUses}
                onChange={(e) => setForm({ ...form, maxUses: e.target.value })}
              />
              <Input
                label="Expires On"
                type="date"
                value={form.expiresAt}
                onChange={(e) => setForm({ ...form, expiresAt: e.target.value })}
              />
            </div>
            <div className="flex gap-3 pt-2">
              <Button fullWidth onClick={handleCreate} loading={saving}>
                Create Coupon
              </Button>
              <Button
                fullWidth variant="ghost"
                onClick={() => { setShowModal(false); setForm(emptyForm); }}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  );
};

export default AdminCouponsPage;