import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
  Users, ShoppingBag, Package, DollarSign,
  TrendingUp, ChevronRight
} from 'lucide-react';
import { adminApi } from '../../api';
import { Layout } from '../../components/layout';
import { Spinner } from '../../components/ui';
import { formatPrice } from '../../utils';

const StatCard = ({ title, value, icon: Icon, color, onClick }) => (
  <div
    onClick={onClick}
    className={`bg-white rounded shadow-sm p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow ${onClick ? 'cursor-pointer' : ''}`}
  >
    <div>
      <p className="text-sm text-gray-500 mb-1">{title}</p>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
    </div>
    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
      <Icon size={24} className="text-white" />
    </div>
  </div>
);

const AdminDashboard = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: () => adminApi.getDashboard(),
  });

  const stats = data?.data?.data;

  if (isLoading) return (
    <Layout><Spinner className="py-32" size="lg" /></Layout>
  );

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Admin Dashboard
        </h1>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <StatCard
            title="Total Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="bg-blue-500"
            onClick={() => navigate('/admin/users')}
          />
          <StatCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingBag}
            color="bg-orange-500"
            onClick={() => navigate('/admin/orders')}
          />
          <StatCard
            title="Total Products"
            value={stats?.totalProducts || 0}
            icon={Package}
            color="bg-green-500"
            onClick={() => navigate('/admin/products')}
          />
          <StatCard
            title="Total Revenue"
            value={formatPrice(stats?.totalRevenue || 0)}
            icon={DollarSign}
            color="bg-purple-500"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'Manage Users',
              desc: 'View, activate and deactivate users',
              path: '/admin/users',
              icon: Users,
              color: 'text-blue-500',
            },
            {
              title: 'Manage Orders',
              desc: 'View and update order statuses',
              path: '/admin/orders',
              icon: ShoppingBag,
              color: 'text-orange-500',
            },
            {
              title: 'Manage Products',
              desc: 'Activate or deactivate products',
              path: '/admin/products',
              icon: Package,
              color: 'text-green-500',
            },
            {
              title: 'Manage Coupons',
              desc: 'Create and manage discount coupons',
              path: '/admin/coupons',
              icon: TrendingUp,
              color: 'text-purple-500',
            },
          ].map(action => (
            <div
              key={action.path}
              onClick={() => navigate(action.path)}
              className="bg-white rounded shadow-sm p-5 flex items-center justify-between cursor-pointer hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-4">
                <action.icon size={24} className={action.color} />
                <div>
                  <p className="font-semibold text-gray-900">{action.title}</p>
                  <p className="text-sm text-gray-500">{action.desc}</p>
                </div>
              </div>
              <ChevronRight size={18} className="text-gray-400" />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AdminDashboard;