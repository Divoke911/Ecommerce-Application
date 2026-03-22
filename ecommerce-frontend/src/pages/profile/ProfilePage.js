import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { User, Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { userApi } from '../../api';
import { Layout } from '../../components/layout';
import { Button, Input, Spinner } from '../../components/ui';
import { useDispatch } from 'react-redux';
import { updateUser } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const dispatch = useDispatch();
  const [editing, setEditing] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '' });
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '', newPassword: '',
  });
  const [errors, setErrors] = useState({});

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile(),
  });

  const profile = data?.data?.data;

  useEffect(() => {
    if (profile) {
      setForm({ name: profile.name || '', phone: profile.phone || '' });
    }
  }, [profile]);

  const handleSaveProfile = async () => {
    if (!form.name.trim()) {
      setErrors({ name: 'Name is required' });
      return;
    }
    try {
      setSaving(true);
      const res = await userApi.updateProfile(form);
      dispatch(updateUser(res.data.data));
      toast.success('Profile updated successfully!');
      setEditing(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    const errs = {};
    if (!passwordForm.oldPassword) errs.oldPassword = 'Required';
    if (!passwordForm.newPassword) errs.newPassword = 'Required';
    else if (passwordForm.newPassword.length < 8)
      errs.newPassword = 'Minimum 8 characters';
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      setSaving(true);
      await userApi.changePassword(passwordForm);
      toast.success('Password changed successfully!');
      setChangingPassword(false);
      setPasswordForm({ oldPassword: '', newPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) return (
    <Layout><Spinner className="py-32" size="lg" /></Layout>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">My Profile</h1>

        <div className="space-y-4">

          {/* Profile Info */}
          <div className="bg-white rounded shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900">
                Personal Information
              </h2>
              {!editing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditing(true)}
                >
                  Edit
                </Button>
              )}
            </div>

            {editing ? (
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  error={errors.name}
                  leftIcon={<User size={16} />}
                />
                <Input
                  label="Phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  leftIcon={<Phone size={16} />}
                />
                <div className="flex gap-3">
                  <Button onClick={handleSaveProfile} loading={saving}>
                    Save Changes
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => { setEditing(false); setErrors({}); }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-[#2874f0] text-white flex items-center justify-center text-2xl font-bold">
                    {profile?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-lg">
                      {profile?.name}
                    </p>
                    <p className="text-sm text-gray-500">{profile?.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail size={14} className="text-[#2874f0]" />
                    <span>{profile?.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone size={14} className="text-[#2874f0]" />
                    <span>{profile?.phone || 'Not provided'}</span>
                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {profile?.roles?.map(role => (
                    <span
                      key={role}
                      className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full"
                    >
                      {role}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Change Password */}
          <div className="bg-white rounded shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Lock size={16} className="text-[#2874f0]" />
                Change Password
              </h2>
              {!changingPassword && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setChangingPassword(true)}
                >
                  Change
                </Button>
              )}
            </div>

            {changingPassword && (
              <div className="space-y-4">
                <Input
                  label="Current Password"
                  type={showOld ? 'text' : 'password'}
                  value={passwordForm.oldPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm, oldPassword: e.target.value
                  })}
                  error={errors.oldPassword}
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowOld(!showOld)}>
                      {showOld ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <Input
                  label="New Password"
                  type={showNew ? 'text' : 'password'}
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({
                    ...passwordForm, newPassword: e.target.value
                  })}
                  error={errors.newPassword}
                  leftIcon={<Lock size={16} />}
                  rightIcon={
                    <button type="button" onClick={() => setShowNew(!showNew)}>
                      {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  }
                />
                <div className="flex gap-3">
                  <Button onClick={handleChangePassword} loading={saving}>
                    Update Password
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setChangingPassword(false);
                      setPasswordForm({ oldPassword: '', newPassword: '' });
                      setErrors({});
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}

            {!changingPassword && (
              <p className="text-sm text-gray-500">
                Keep your account secure with a strong password.
              </p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProfilePage;