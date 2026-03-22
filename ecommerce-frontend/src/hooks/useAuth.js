import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  selectCurrentUser,
  selectIsAuthenticated,
  selectIsAdmin,
  selectIsSeller,
  selectAuthLoading,
  selectAuthError,
  setCredentials,
  setPendingEmail,
  setLoading,
  setError,
  logout,
} from '../store/slices/authSlice';
import { clearCart } from '../store/slices/cartSlice';
import { authApi } from '../api';
import { ROUTES } from '../constants';

export const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector(selectCurrentUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isAdmin = useSelector(selectIsAdmin);
  const isSeller = useSelector(selectIsSeller);
  const loading = useSelector(selectAuthLoading);
  const error = useSelector(selectAuthError);

  const register = async (data) => {
    try {
      dispatch(setLoading(true));
      await authApi.register(data);
      dispatch(setPendingEmail(data.email));
      toast.success('OTP sent to your email!');
      navigate(ROUTES.VERIFY_EMAIL);
    } catch (err) {
      const msg = err.response?.data?.message || 'Registration failed';
      dispatch(setError(msg));
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const verifyEmail = async (data) => {
    try {
      dispatch(setLoading(true));
      const res = await authApi.verifyEmail(data);
      const { accessToken, refreshToken, user } = res.data.data;
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success('Email verified! Welcome to Flipkart!');
      navigate(ROUTES.HOME);
    } catch (err) {
      const msg = err.response?.data?.message || 'Verification failed';
      dispatch(setError(msg));
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const login = async (data) => {
    try {
      dispatch(setLoading(true));
      await authApi.login(data);
      dispatch(setPendingEmail(data.email));
      toast.success('OTP sent to your email!');
      navigate(ROUTES.VERIFY_LOGIN_OTP);
    } catch (err) {
      const msg = err.response?.data?.message || 'Login failed';
      dispatch(setError(msg));
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const verifyLoginOtp = async (data) => {
    try {
      dispatch(setLoading(true));
      const res = await authApi.verifyLoginOtp(data);
      const { accessToken, refreshToken, user } = res.data.data;
      dispatch(setCredentials({ user, accessToken, refreshToken }));
      toast.success(`Welcome back, ${user.name}!`);
      navigate(ROUTES.HOME);
    } catch (err) {
      const msg = err.response?.data?.message || 'OTP verification failed';
      dispatch(setError(msg));
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const forgotPassword = async (email) => {
    try {
      dispatch(setLoading(true));
      await authApi.forgotPassword(email);
      dispatch(setPendingEmail(email));
      toast.success('OTP sent to your email!');
      navigate(ROUTES.RESET_PASSWORD);
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to send OTP';
      dispatch(setError(msg));
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const resetPassword = async (data) => {
    try {
      dispatch(setLoading(true));
      await authApi.resetPassword(data);
      toast.success('Password reset successfully!');
      navigate(ROUTES.LOGIN);
    } catch (err) {
      const msg = err.response?.data?.message || 'Reset failed';
      dispatch(setError(msg));
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleLogout = async () => {
    try {
      const userId = localStorage.getItem('userId');
      if (userId) await authApi.logout(userId);
    } catch (err) {
      // Silent fail
    } finally {
      dispatch(logout());
      dispatch(clearCart());
      toast.success('Logged out successfully!');
      navigate(ROUTES.LOGIN);
    }
  };

  return {
    user,
    isAuthenticated,
    isAdmin,
    isSeller,
    loading,
    error,
    register,
    verifyEmail,
    login,
    verifyLoginOtp,
    forgotPassword,
    resetPassword,
    handleLogout,
  };
};