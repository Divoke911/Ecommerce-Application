import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Store, ChevronLeft } from 'lucide-react';
import { sellerApi } from '../../api';
import { Layout } from '../../components/layout';
import { Button, Input, Spinner, Badge } from '../../components/ui';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const SellerProfilePage = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    storeName: '', gstNumber: '',
    bankAccount: '', ifscCode: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['seller', 'profile'],
    queryFn: () => sellerApi.getProfile(),
  });

  const profile = data?.data?.data;

  useEffect(() => {
    if (profile) {
      setForm({
        storeName: profile.storeName || '',
        gstNumber: profile.gstNumber || '',
        bankAccount: profile.bankAccount || '',
        ifscCode: profile.ifscCode || '',
      });
    }
  }, [profile]);

  const handleSave = async () => {
    if (!form.storeName.trim()) {
      toast.error('Store name is required');
      return;
    }
    try {
      setSaving(true);
      if (profile) {
        await sellerApi.updateProfile(form);
      } else {
        await sellerApi.createProfile(form);
      }
      queryClient.invalidateQueries(['seller', 'profile']);
      toast.success('Profile saved!');
      setEditing(false);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return (
    <Layout><Spinner className="py-32" size="lg" /></Layout>
  );

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate('/seller')}
            className="text-gray-500 hover:text-gray-700"
          >
            <ChevronLeft size={20} />
          </button>
          <h1 className="text-xl font-bold text-gray-900">Seller Profile</h1>
        </div>

        <div className="bg-white rounded shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-[#2874f0] rounded-full flex items-center justify-center">
                <Store size={20} className="text-white" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  {profile?.storeName || 'Your Store'}
                </p>
                <Badge variant={profile?.isVerified ? 'success' : 'warning'}>
                  {profile?.isVerified ? '✓ Verified Seller' : 'Pending Verification'}
                </Badge>
              </div>
            </div>
            {!editing && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(true)}
              >
                {profile ? 'Edit' : 'Create Profile'}
              </Button>
            )}
          </div>

          {editing ? (
            <div className="space-y-4">
              <Input
                label="Store Name"
                value={form.storeName}
                onChange={(e) => setForm({ ...form, storeName: e.target.value })}
                required
              />
              <Input
                label="GST Number"
                value={form.gstNumber}
                onChange={(e) => setForm({ ...form, gstNumber: e.target.value })}
                placeholder="27AAPFU0939F1ZV"
              />
              <Input
                label="Bank Account Number"
                value={form.bankAccount}
                onChange={(e) => setForm({ ...form, bankAccount: e.target.value })}
              />
              <Input
                label="IFSC Code"
                value={form.ifscCode}
                onChange={(e) => setForm({ ...form, ifscCode: e.target.value })}
                placeholder="HDFC0001234"
              />
              <div className="flex gap-3 pt-2">
                <Button fullWidth onClick={handleSave} loading={saving}>
                  Save Profile
                </Button>
                <Button
                  fullWidth
                  variant="ghost"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-sm">
              {[
                { label: 'Store Name', value: profile?.storeName },
                { label: 'GST Number', value: profile?.gstNumber },
                { label: 'Bank Account', value: profile?.bankAccount },
                { label: 'IFSC Code', value: profile?.ifscCode },
                { label: 'Rating', value: profile?.sellerRating ? `${profile.sellerRating} ★` : 'No ratings yet' },
              ].map(item => (
                <div key={item.label} className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-gray-500">{item.label}</span>
                  <span className="font-medium text-gray-900">
                    {item.value || 'Not provided'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SellerProfilePage;