import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectPendingEmail } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ResetPasswordPage = () => {
  const { resetPassword, loading } = useAuth();
  const pendingEmail = useSelector(selectPendingEmail);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ otp: '', newPassword: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.otp || form.otp.length !== 6) errs.otp = 'Enter valid 6-digit OTP';
    if (!form.newPassword) errs.newPassword = 'Password is required';
    else if (form.newPassword.length < 8) errs.newPassword = 'Minimum 8 characters';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    await resetPassword({ email: pendingEmail, ...form });
  };

  return (
    <div className="min-h-screen bg-[#2874f0] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔒</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">Reset Password</h2>
          <p className="text-gray-500 text-sm mt-1">
            Enter the OTP sent to <span className="text-[#2874f0]">{pendingEmail}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="OTP"
            type="text"
            placeholder="Enter 6-digit OTP"
            maxLength={6}
            value={form.otp}
            onChange={(e) => setForm({ ...form, otp: e.target.value })}
            error={errors.otp}
            required
          />

          <Input
            label="New Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="Minimum 8 characters"
            value={form.newPassword}
            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
            error={errors.newPassword}
            leftIcon={<Lock size={16} />}
            rightIcon={
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            }
            required
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;