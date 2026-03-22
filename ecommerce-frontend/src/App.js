import React from 'react';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';
import VerifyLoginOtpPage from './pages/auth/VerifyLoginOtpPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Product Pages
import HomePage from './pages/products/HomePage';
import ProductListPage from './pages/products/ProductListPage';
import ProductDetailPage from './pages/products/ProductDetailPage';

// Cart Pages
import CartPage from './pages/cart/CartPage';
import CheckoutPage from './pages/cart/CheckoutPage';

// Order Pages
import OrdersPage from './pages/orders/OrdersPage';
import OrderDetailPage from './pages/orders/OrderDetailPage';

// Profile Pages
import ProfilePage from './pages/profile/ProfilePage';
import AddressesPage from './pages/profile/AddressesPage';
import WishlistPage from './pages/profile/WishlistPage';
import NotificationsPage from './pages/profile/NotificationsPage';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminProductsPage from './pages/admin/AdminProductsPage';
import AdminCouponsPage from './pages/admin/AdminCouponsPage';

// Seller Pages
import SellerDashboard from './pages/seller/SellerDashboard';
import SellerProductsPage from './pages/seller/SellerProductsPage';
import SellerProductFormPage from './pages/seller/SellerProductFormPage';
import SellerProfilePage from './pages/seller/SellerProfilePage';

// Layout
import { ProtectedRoute } from './components/layout';

// Clear default CRA styles
import './App.css';

const App = () => {
  return (
    <BrowserRouter>
      <Routes>

        {/* ── Public Routes ─────────────────────────── */}
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />

        {/* ── Auth Routes ───────────────────────────── */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/verify-login-otp" element={<VerifyLoginOtpPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ── Protected Routes ──────────────────────── */}
        <Route path="/cart" element={
          <ProtectedRoute><CartPage /></ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute><CheckoutPage /></ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute><OrdersPage /></ProtectedRoute>
        } />
        <Route path="/orders/:id" element={
          <ProtectedRoute><OrderDetailPage /></ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute><ProfilePage /></ProtectedRoute>
        } />
        <Route path="/profile/addresses" element={
          <ProtectedRoute><AddressesPage /></ProtectedRoute>
        } />
        <Route path="/wishlist" element={
          <ProtectedRoute><WishlistPage /></ProtectedRoute>
        } />
        <Route path="/notifications" element={
          <ProtectedRoute><NotificationsPage /></ProtectedRoute>
        } />

        {/* ── Seller Routes ─────────────────────────── */}
        <Route path="/seller" element={
          <ProtectedRoute requireSeller><SellerDashboard /></ProtectedRoute>
        } />
        <Route path="/seller/products" element={
          <ProtectedRoute requireSeller><SellerProductsPage /></ProtectedRoute>
        } />
        <Route path="/seller/products/new" element={
          <ProtectedRoute requireSeller><SellerProductFormPage /></ProtectedRoute>
        } />
        <Route path="/seller/products/edit/:id" element={
          <ProtectedRoute requireSeller><SellerProductFormPage /></ProtectedRoute>
        } />
        <Route path="/seller/profile" element={
          <ProtectedRoute requireSeller><SellerProfilePage /></ProtectedRoute>
        } />

        {/* ── Admin Routes ──────────────────────────── */}
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requireAdmin><AdminUsersPage /></ProtectedRoute>
        } />
        <Route path="/admin/orders" element={
          <ProtectedRoute requireAdmin><AdminOrdersPage /></ProtectedRoute>
        } />
        <Route path="/admin/products" element={
          <ProtectedRoute requireAdmin><AdminProductsPage /></ProtectedRoute>
        } />
        <Route path="/admin/coupons" element={
          <ProtectedRoute requireAdmin><AdminCouponsPage /></ProtectedRoute>
        } />

        {/* ── Fallback ──────────────────────────────── */}
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </BrowserRouter>
  );
};

export default App;