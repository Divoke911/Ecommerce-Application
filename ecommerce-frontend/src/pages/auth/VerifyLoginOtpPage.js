import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectPendingEmail } from '../../store/slices/authSlice';
import { useAuth } from '../../hooks/useAuth';
import { authApi } from '../../api';
import Button from '../../components/ui/Button';
import toast from 'react-hot-toast';

const VerifyLoginOtpPage = () => {
  const { verifyLoginOtp, loading } = useAuth();
  const pendingEmail = useSelector(selectPendingEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resending, setResending] = useState(false);

  const handleChange = (value, index) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-login-${index + 1}`)?.focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-login-${index - 1}`)?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpString = otp.join('');
    if (otpString.length !== 6) {
      toast.error('Please enter complete OTP');
      return;
    }
    await verifyLoginOtp({ email: pendingEmail, otp: otpString });
  };

  const handleResend = async () => {
    try {
      setResending(true);
      await authApi.resendOtp(pendingEmail);
      toast.success('OTP resent!');
    } catch (err) {
      toast.error('Failed to resend OTP');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2874f0] flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">🔐</span>
          </div>
          <h2 className="text-2xl font-semibold text-gray-800">
            Enter Login OTP
          </h2>
          <p className="text-gray-500 text-sm mt-2">
            We sent a 6-digit OTP to
          </p>
          <p className="text-[#2874f0] font-medium">{pendingEmail}</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, index) => (
              <input
                key={index}
                id={`otp-login-${index}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                className="w-12 h-12 text-center text-xl font-bold border-2 rounded-lg focus:outline-none focus:border-[#2874f0] transition-colors"
              />
            ))}
          </div>

          <Button type="submit" fullWidth size="lg" loading={loading}>
            Verify & Login
          </Button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-500 text-sm">
            Didn't receive the OTP?{' '}
            <button
              onClick={handleResend}
              disabled={resending}
              className="text-[#2874f0] font-medium hover:underline disabled:opacity-50"
            >
              {resending ? 'Resending...' : 'Resend OTP'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default VerifyLoginOtpPage;