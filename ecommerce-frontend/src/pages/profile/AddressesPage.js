import React, { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, MapPin } from 'lucide-react';
import { userApi } from '../../api';
import { Layout } from '../../components/layout';
import { Button, Input, Modal, Spinner, EmptyState } from '../../components/ui';
import { AddressCard } from '../../components/common';
import toast from 'react-hot-toast';

const emptyForm = {
  label: '', street: '', city: '',
  state: '', zipCode: '', country: 'India',
};

const AddressesPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userApi.getAddresses(),
  });

  const addresses = data?.data?.data || [];

  const validate = () => {
    const errs = {};
    if (!form.label.trim()) errs.label = 'Label is required';
    if (!form.street.trim()) errs.street = 'Street is required';
    if (!form.city.trim()) errs.city = 'City is required';
    if (!form.state.trim()) errs.state = 'State is required';
    if (!form.zipCode.trim()) errs.zipCode = 'ZIP code is required';
    return errs;
  };

  const handleSave = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setSaving(true);
      if (editingAddress) {
        await userApi.updateAddress(editingAddress.id, form);
        toast.success('Address updated!');
      } else {
        await userApi.addAddress(form);
        toast.success('Address added!');
      }
      queryClient.invalidateQueries(['addresses']);
      setShowModal(false);
      setForm(emptyForm);
      setEditingAddress(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save address');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (address) => {
    setEditingAddress(address);
    setForm({
      label: address.label,
      street: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this address?')) return;
    try {
      await userApi.deleteAddress(id);
      queryClient.invalidateQueries(['addresses']);
      toast.success('Address deleted!');
    } catch (err) {
      toast.error('Failed to delete address');
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setForm(emptyForm);
    setEditingAddress(null);
    setErrors({});
  };

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl font-bold text-gray-900">My Addresses</h1>
          <Button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2"
          >
            <Plus size={16} /> Add Address
          </Button>
        </div>

        {isLoading ? (
          <Spinner className="py-20" size="lg" />
        ) : addresses.length === 0 ? (
          <EmptyState
            icon={MapPin}
            title="No addresses saved"
            description="Add a delivery address to get started"
            actionLabel="Add Address"
            onAction={() => setShowModal(true)}
          />
        ) : (
          <div className="space-y-3">
            {addresses.map(address => (
              <AddressCard
                key={address.id}
                address={address}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title={editingAddress ? 'Edit Address' : 'Add New Address'}
          size="lg"
        >
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="Label"
                placeholder="Home / Office / Other"
                value={form.label}
                onChange={(e) => setForm({ ...form, label: e.target.value })}
                error={errors.label}
                required
              />
              <Input
                label="ZIP Code"
                placeholder="411001"
                value={form.zipCode}
                onChange={(e) => setForm({ ...form, zipCode: e.target.value })}
                error={errors.zipCode}
                required
              />
            </div>
            <Input
              label="Street Address"
              placeholder="House no, Street, Area"
              value={form.street}
              onChange={(e) => setForm({ ...form, street: e.target.value })}
              error={errors.street}
              required
            />
            <div className="grid grid-cols-2 gap-3">
              <Input
                label="City"
                placeholder="City"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                error={errors.city}
                required
              />
              <Input
                label="State"
                placeholder="State"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                error={errors.state}
                required
              />
            </div>
            <Input
              label="Country"
              value={form.country}
              onChange={(e) => setForm({ ...form, country: e.target.value })}
            />
            <div className="flex gap-3 pt-2">
              <Button
                fullWidth
                onClick={handleSave}
                loading={saving}
              >
                {editingAddress ? 'Update Address' : 'Save Address'}
              </Button>
              <Button
                fullWidth
                variant="ghost"
                onClick={handleCloseModal}
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

export default AddressesPage;