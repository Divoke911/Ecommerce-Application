import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  Search, ShoppingCart, Heart, Bell, User,
  ChevronDown, LogOut, Package, Settings,
  LayoutDashboard, Store
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useCart } from '../../hooks/useCart';
import { notificationApi } from '../../api';
import { setUnreadCount } from '../../store/slices/notificationSlice';
import { useDispatch } from 'react-redux';
import { selectUnreadCount } from '../../store/slices/notificationSlice';
import { ROUTES } from '../../constants';
import { getInitials } from '../../utils';
import { debounce } from '../../utils';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, isAuthenticated, isAdmin, isSeller, handleLogout } = useAuth();
  const { totalItems, fetchCart } = useCart();
  const unreadCount = useSelector(selectUnreadCount);
  const [searchQuery, setSearchQuery] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
      fetchUnreadCount();
    }
  }, [isAuthenticated]);

  const fetchUnreadCount = async () => {
    try {
      const res = await notificationApi.getUnreadCount();
      dispatch(setUnreadCount(res.data.data.count));
    } catch (err) {}
  };

  const handleSearch = debounce((query) => {
    if (query.trim()) {
      navigate(`/products?search=${query}`);
    }
  }, 500);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    handleSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${searchQuery}`);
    }
  };

  return (
    <nav className="bg-[#2874f0] sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-4 h-16">

          {/* Logo */}
          <Link to={ROUTES.HOME} className="flex-shrink-0">
            <div className="text-white">
              <span className="text-xl font-bold italic">Flipkart</span>
              <div className="flex items-center gap-1 text-xs">
                <span className="text-[#ffe500]">Explore</span>
                <span className="text-white">Plus</span>
                <span className="text-[#ffe500]">✦</span>
              </div>
            </div>
          </Link>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="flex-1 max-w-2xl">
            <div className="flex items-center bg-white rounded overflow-hidden">
              <input
                type="text"
                placeholder="Search for products, brands and more"
                value={searchQuery}
                onChange={handleSearchChange}
                className="flex-1 px-4 py-2 text-sm outline-none text-gray-700"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-white text-[#2874f0] hover:bg-gray-50"
              >
                <Search size={18} />
              </button>
            </div>
          </form>

          {/* Actions */}
          <div className="flex items-center gap-2">

            {/* User Menu */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 text-white hover:bg-[#1a5dc8] px-3 py-2 rounded transition-colors"
                >
                  <div className="w-7 h-7 rounded-full bg-white text-[#2874f0] flex items-center justify-center text-xs font-bold">
                    {getInitials(user?.name)}
                  </div>
                  <span className="text-sm font-medium hidden md:block">
                    {user?.name?.split(' ')[0]}
                  </span>
                  <ChevronDown size={14} />
                </button>

                {showUserMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowUserMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded shadow-xl z-20 py-1">
                      <div className="px-4 py-3 border-b">
                        <p className="font-semibold text-gray-900">{user?.name}</p>
                        <p className="text-xs text-gray-500">{user?.email}</p>
                      </div>

                      <Link
                        to={ROUTES.PROFILE}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <User size={16} /> My Profile
                      </Link>

                      <Link
                        to={ROUTES.ORDERS}
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Package size={16} /> My Orders
                      </Link>

                      {isSeller && (
                        <Link
                          to={ROUTES.SELLER}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Store size={16} /> Seller Dashboard
                        </Link>
                      )}

                      {isAdmin && (
                        <Link
                          to={ROUTES.ADMIN}
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <LayoutDashboard size={16} /> Admin Panel
                        </Link>
                      )}

                      <div className="border-t mt-1">
                        <button
                          onClick={() => { setShowUserMenu(false); handleLogout(); }}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full"
                        >
                          <LogOut size={16} /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <Link
                to={ROUTES.LOGIN}
                className="text-white hover:bg-[#1a5dc8] px-4 py-2 rounded text-sm font-medium transition-colors"
              >
                Login
              </Link>
            )}

            {/* Wishlist */}
            {isAuthenticated && (
              <Link
                to="/wishlist"
                className="flex items-center gap-1 text-white hover:bg-[#1a5dc8] px-3 py-2 rounded transition-colors"
              >
                <Heart size={20} />
                <span className="text-sm font-medium hidden md:block">Wishlist</span>
              </Link>
            )}

            {/* Cart */}
            <Link
              to={ROUTES.CART}
              className="flex items-center gap-1 text-white hover:bg-[#1a5dc8] px-3 py-2 rounded transition-colors relative"
            >
              <ShoppingCart size={20} />
              <span className="text-sm font-medium hidden md:block">Cart</span>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#fb641b] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                  {totalItems > 9 ? '9+' : totalItems}
                </span>
              )}
            </Link>

            {/* Notifications */}
            {isAuthenticated && (
              <Link
                to="/notifications"
                className="relative text-white hover:bg-[#1a5dc8] p-2 rounded transition-colors"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Category Bar */}
      <div className="bg-[#1a5dc8] hidden md:block">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center gap-6 h-10 text-white text-sm overflow-x-auto">
            <Link to="/products?category=6" className="hover:text-[#ffe500] whitespace-nowrap transition-colors">Mobiles</Link>
            <Link to="/products?category=7" className="hover:text-[#ffe500] whitespace-nowrap transition-colors">Laptops</Link>
            <Link to="/products?category=8" className="hover:text-[#ffe500] whitespace-nowrap transition-colors">Earbuds</Link>
            <Link to="/products?category=2" className="hover:text-[#ffe500] whitespace-nowrap transition-colors">Fashion</Link>
            <Link to="/products?category=3" className="hover:text-[#ffe500] whitespace-nowrap transition-colors">Home & Kitchen</Link>
            <Link to="/products?category=4" className="hover:text-[#ffe500] whitespace-nowrap transition-colors">Books</Link>
            <Link to="/products?category=5" className="hover:text-[#ffe500] whitespace-nowrap transition-colors">Sports</Link>
            <Link to="/products?category=9" className="hover:text-[#ffe500] whitespace-nowrap transition-colors">Cameras</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;