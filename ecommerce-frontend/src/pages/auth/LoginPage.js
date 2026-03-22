import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../constants';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

const LoginPage = () => {
  const { login, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    await login(form);
  };

  return (
    <div className="min-h-screen bg-[#2874f0] flex items-center justify-center p-4">
      <div className="w-full max-w-3xl flex rounded-lg overflow-hidden shadow-2xl">

        {/* Left Panel */}
        <div className="hidden md:flex flex-col justify-between bg-[#2874f0] p-10 w-2/5">
          <div>
            <h1 className="text-white text-3xl font-bold italic mb-2">Flipkart</h1>
            <p className="text-blue-200 text-lg font-light leading-relaxed">
              Login to access your account, track orders and explore millions of products.
            </p>
          </div>
          <img
            src="https://static-assets-web.flixcart.com/www/linchpin/fk-cp-zion/img/login_img_c4a81e.png"
            alt="login"
            className="w-48 self-center"
            onError={(e) => e.target.style.display = 'none'}
          />
        </div>

        {/* Right Panel */}
        <div className="flex-1 bg-white p-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-1">Login</h2>
          <p className="text-gray-500 text-sm mb-6">
            Get access to your Orders, Wishlist and Recommendations
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email"
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              leftIcon={<Mail size={16} />}
              required
            />

            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              leftIcon={<Lock size={16} />}
              rightIcon={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="cursor-pointer"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
              required
            />

            <div className="flex justify-end">
              <Link
                to={ROUTES.FORGOT_PASSWORD}
                className="text-sm text-[#2874f0] hover:underline"
              >
                Forgot Password?
              </Link>
            </div>

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={loading}
            >
              Login
            </Button>

            <p className="text-center text-xs text-gray-500">
              By continuing, you agree to Flipkart's Terms of Use and Privacy Policy.
            </p>

            <div className="text-center pt-2">
              <span className="text-gray-600 text-sm">New to Flipkart? </span>
              <Link
                to={ROUTES.REGISTER}
                className="text-[#2874f0] font-medium text-sm hover:underline"
              >
                Create an account
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;