export const API_BASE_URL = 'http://localhost:8080';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  VERIFY_EMAIL: '/verify-email',
  VERIFY_LOGIN_OTP: '/verify-login-otp',
  FORGOT_PASSWORD: '/forgot-password',
  RESET_PASSWORD: '/reset-password',
  PRODUCTS: '/products',
  PRODUCT_DETAIL: '/products/:id',
  CART: '/cart',
  CHECKOUT: '/checkout',
  ORDERS: '/orders',
  ORDER_DETAIL: '/orders/:id',
  PROFILE: '/profile',
  ADDRESSES: '/profile/addresses',
  ADMIN: '/admin',
  ADMIN_USERS: '/admin/users',
  ADMIN_ORDERS: '/admin/orders',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_COUPONS: '/admin/coupons',
  SELLER: '/seller',
  SELLER_PRODUCTS: '/seller/products',
  SELLER_ORDERS: '/seller/orders',
};

export const ORDER_STATUS = {
  PLACED: 'PLACED',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED',
  CANCELLED: 'CANCELLED',
};

export const ORDER_STATUS_COLORS = {
  PLACED: 'bg-blue-100 text-blue-800',
  PROCESSING: 'bg-yellow-100 text-yellow-800',
  SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800',
};

export const DELIVERY_STATUS_COLORS = {
  SCHEDULED: 'bg-blue-100 text-blue-800',
  IN_TRANSIT: 'bg-yellow-100 text-yellow-800',
  DELIVERED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export const PAYMENT_METHODS = [
  { value: 'UPI', label: 'UPI' },
  { value: 'NET_BANKING', label: 'Net Banking' },
  { value: 'CREDIT_CARD', label: 'Credit Card' },
  { value: 'DEBIT_CARD', label: 'Debit Card' },
  { value: 'COD', label: 'Cash on Delivery' },
];

export const FLIPKART_BLUE = '#2874f0';