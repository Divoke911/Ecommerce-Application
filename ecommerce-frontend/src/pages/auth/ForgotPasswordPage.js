import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const ForgotPasswordPage = () => {
  const { forgotPassword, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email'); return; }
    await forgotPassword(email);
  };

  return (
    <div className="min-h-screen bg-[#2874f0] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔑</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Forgot Password?
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            Enter your email and we'll send you an OTP to reset your password.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="Enter your registered email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            error={error}
            leftIcon={<Mail size={16} />}
            required
          />

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Send OTP
          </Button>

          <div className="text-center">
            <Link
              to={ROUTES.LOGIN}
              className="text-[#2874f0] text-sm hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;