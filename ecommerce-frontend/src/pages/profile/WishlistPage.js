import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart } from 'lucide-react';
import { Layout } from '../../components/layout';
import { EmptyState, Spinner } from '../../components/ui';
import { useWishlist } from '../../hooks/useWishlist';
import { useSelector } from 'react-redux';
import { selectWishlistItems } from '../../store/slices/wishlistSlice';
import { formatPrice } from '../../utils';
import { ROUTES } from '../../constants';

const WishlistPage = () => {
  const navigate = useNavigate();
  const { fetchWishlist, toggleWishlist } = useWishlist();
  const items = useSelector(selectWishlistItems);

  useEffect(() => { fetchWishlist(); }, []);

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 py-6">
        <h1 className="text-xl font-bold text-gray-900 mb-6">
          My Wishlist {items.length > 0 && `(${items.length})`}
        </h1>

        {items.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save items you love to your wishlist"
            actionLabel="Start Shopping"
            onAction={() => navigate(ROUTES.PRODUCTS)}
          />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {items.map(item => (
              <div
                key={item.productId}
                className="bg-white rounded shadow-sm p-4 hover:shadow-md transition-shadow"
              >
                <div
                  className="cursor-pointer"
                  onClick={() => navigate(`/products/${item.productId}`)}
                >
                  <img
                    src={item.imageUrl ||
                      'https://via.placeholder.com/200x200?text=No+Image'}
                    alt={item.productName}
                    className="w-full h-40 object-contain mb-3"
                    onError={(e) => {
                      e.target.src =
                        'https://via.placeholder.com/200x200?text=No+Image';
                    }}
                  />
                  <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {item.productName}
                  </h3>
                  <p className="text-base font-bold text-gray-900">
                    {formatPrice(item.price)}
                  </p>
                </div>
                <button
                  onClick={() => toggleWishlist({ id: item.productId })}
                  className="mt-3 w-full flex items-center justify-center gap-2 py-1.5 text-sm text-red-500 border border-red-200 rounded hover:bg-red-50 transition-colors"
                >
                  <Heart size={14} className="fill-red-500" />
                  Remove from Wishlist
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default WishlistPage;