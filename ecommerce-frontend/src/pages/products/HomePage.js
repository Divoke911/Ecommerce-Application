import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { productApi, categoryApi } from '../../api';
import { Layout } from '../../components/layout';
import { ProductCard, CategoryCard } from '../../components/common';
import { Spinner } from '../../components/ui';

const banners = [
  { id: 1, bg: '#2874f0', title: 'Big Billion Days', subtitle: 'Up to 80% off on Electronics', emoji: '⚡' },
  { id: 2, bg: '#ff6b6b', title: 'Fashion Sale', subtitle: 'Minimum 50% off on top brands', emoji: '👗' },
  { id: 3, bg: '#51cf66', title: 'Home Essentials', subtitle: 'Upgrade your home today', emoji: '🏠' },
];

const HomePage = () => {
  const navigate = useNavigate();

  const { data: productsData, isLoading: productsLoading } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => productApi.getAll(0, 8, 'price'),
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const products = productsData?.data?.data?.content || [];
  const categories = categoriesData?.data?.data || [];
  const topCategories = categories.filter(c => !c.parentId).slice(0, 8);

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">

        {/* Hero Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`rounded-lg p-6 text-white cursor-pointer hover:opacity-95 transition-opacity ${
                index === 0 ? 'md:col-span-2' : ''
              }`}
              style={{ backgroundColor: banner.bg }}
              onClick={() => navigate('/products')}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide opacity-80 mb-1">
                    Limited Time
                  </p>
                  <h2 className="text-2xl font-bold mb-1">{banner.title}</h2>
                  <p className="text-sm opacity-90">{banner.subtitle}</p>
                  <button className="mt-3 bg-white text-gray-800 text-xs font-semibold px-4 py-1.5 rounded hover:bg-gray-100 transition-colors">
                    Shop Now
                  </button>
                </div>
                <span className="text-6xl">{banner.emoji}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Categories */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Shop by Category</h2>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 text-[#2874f0] text-sm hover:underline"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          {categoriesLoading ? (
            <Spinner />
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {topCategories.map(category => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          )}
        </div>

        {/* Featured Products */}
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Featured Products</h2>
            <button
              onClick={() => navigate('/products')}
              className="flex items-center gap-1 text-[#2874f0] text-sm hover:underline"
            >
              View All <ChevronRight size={14} />
            </button>
          </div>
          {productsLoading ? (
            <Spinner className="py-12" />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {products.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>

        {/* Deals Banner */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Electronics', desc: 'Up to 40% off', color: '#2874f0', emoji: '📱' },
            { title: 'Fashion', desc: 'Min 50% off', color: '#ff6b6b', emoji: '👔' },
            { title: 'Books', desc: 'Starting ₹99', color: '#51cf66', emoji: '📚' },
          ].map((deal) => (
            <div
              key={deal.title}
              className="rounded-lg p-5 text-white cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-between"
              style={{ backgroundColor: deal.color }}
              onClick={() => navigate('/products')}
            >
              <div>
                <h3 className="font-bold text-lg">{deal.title}</h3>
                <p className="text-sm opacity-90">{deal.desc}</p>
              </div>
              <span className="text-4xl">{deal.emoji}</span>
            </div>
          ))}
        </div>

      </div>
    </Layout>
  );
};

export default HomePage;