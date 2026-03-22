import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { productApi, categoryApi } from '../../api';
import { Layout } from '../../components/layout';
import { ProductCard } from '../../components/common';
import { Spinner, Pagination, EmptyState } from '../../components/ui';

const SORT_OPTIONS = [
  { label: 'Relevance', value: 'id' },
  { label: 'Price: Low to High', value: 'price' },
  { label: 'Price: High to Low', value: 'price,desc' },
  { label: 'Newest First', value: 'createdAt,desc' },
];

const ProductListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState('id');

  const searchQuery = searchParams.get('search') || '';
  const categoryId = searchParams.get('category') || '';

  const { data, isLoading } = useQuery({
    queryKey: ['products', searchQuery, categoryId, page, sort],
    queryFn: () => {
      if (searchQuery) return productApi.search(searchQuery, page, 12);
      if (categoryId) return productApi.getByCategory(categoryId, page, 12);
      return productApi.getAll(page, 12, sort);
    },
  });

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryApi.getAll(),
  });

  const pageData = data?.data?.data;
  const products = pageData?.content || [];
  const totalPages = pageData?.totalPages || 0;
  const totalElements = pageData?.totalElements || 0;
  const categories = categoriesData?.data?.data || [];
  const topCategories = categories.filter(c => !c.parentId);

  const handleCategoryClick = (id) => {
    setSearchParams({ category: id });
    setPage(0);
  };

  const handleSortChange = (value) => {
    setSort(value);
    setPage(0);
  };

  const pageTitle = searchQuery
    ? `Results for "${searchQuery}"`
    : categoryId
    ? categories.find(c => c.id === parseInt(categoryId))?.name || 'Products'
    : 'All Products';

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex gap-4">

          {/* Sidebar */}
          <div className="hidden md:block w-56 flex-shrink-0">
            <div className="bg-white rounded shadow-sm p-4 sticky top-20">
              <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <SlidersHorizontal size={16} /> Filters
              </h3>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">
                  Categories
                </p>
                <ul className="space-y-1">
                  <li>
                    <button
                      onClick={() => { setSearchParams({}); setPage(0); }}
                      className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                        !categoryId && !searchQuery
                          ? 'text-[#2874f0] font-medium bg-blue-50'
                          : 'text-gray-600 hover:bg-gray-50'
                      }`}
                    >
                      All Products
                    </button>
                  </li>
                  {topCategories.map(cat => (
                    <li key={cat.id}>
                      <button
                        onClick={() => handleCategoryClick(cat.id)}
                        className={`w-full text-left text-sm px-2 py-1.5 rounded transition-colors ${
                          categoryId === String(cat.id)
                            ? 'text-[#2874f0] font-medium bg-blue-50'
                            : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        {cat.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">

            {/* Header */}
            <div className="bg-white rounded shadow-sm px-4 py-3 mb-4 flex items-center justify-between">
              <div>
                <h1 className="font-semibold text-gray-900">{pageTitle}</h1>
                {!isLoading && (
                  <p className="text-xs text-gray-500 mt-0.5">
                    {totalElements} results found
                  </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500 hidden md:block">Sort by:</span>
                <div className="relative">
                  <select
                    value={sort}
                    onChange={(e) => handleSortChange(e.target.value)}
                    className="text-sm border border-gray-300 rounded px-3 py-1.5 pr-8 focus:outline-none focus:border-[#2874f0] appearance-none bg-white cursor-pointer"
                  >
                    {SORT_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown size={14} className="absolute right-2 top-2 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Products */}
            {isLoading ? (
              <Spinner className="py-20" size="lg" />
            ) : products.length === 0 ? (
              <EmptyState
                title="No products found"
                description="Try adjusting your search or filters"
              />
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                  onPageChange={setPage}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductListPage;