import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart } from 'lucide-react';
import { formatPrice } from '../../utils';
import { StarRating } from '../ui';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const inWishlist = isInWishlist(product.id);

  const imageUrl = product.imageUrls?.[0] ||
    'https://via.placeholder.com/200x200?text=No+Image';

  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : null;

  return (
    <div className="bg-white rounded shadow-sm hover:shadow-md transition-shadow duration-200 group relative">

      {/* Wishlist Button */}
      {isAuthenticated && (
        <button
          onClick={(e) => { e.preventDefault(); toggleWishlist(product); }}
          className="absolute top-2 right-2 z-10 p-1.5 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Heart
            size={16}
            className={inWishlist ? 'fill-red-500 text-red-500' : 'text-gray-400'}
          />
        </button>
      )}

      <Link to={`/products/${product.id}`}>
        {/* Image */}
        <div className="p-4 flex items-center justify-center h-48 bg-gray-50">
          <img
            src={imageUrl}
            alt={product.name}
            className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-200"
            onError={(e) => {
              e.target.src = 'https://via.placeholder.com/200x200?text=No+Image';
            }}
          />
        </div>

        {/* Details */}
        <div className="p-3">
          <h3 className="text-sm text-gray-800 font-medium line-clamp-2 mb-1">
            {product.name}
          </h3>

          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1 mb-1">
              <div className="flex items-center gap-1 bg-green-600 text-white text-xs px-1.5 py-0.5 rounded">
                <span>{product.averageRating?.toFixed(1)}</span>
                <span>★</span>
              </div>
            </div>
          )}

          {/* Price */}
          <div className="flex items-center gap-2 mt-1">
            <span className="text-base font-bold text-gray-900">
              {formatPrice(product.price)}
            </span>
            {discount && (
              <span className="text-xs text-green-600 font-medium">
                {discount}% off
              </span>
            )}
          </div>

          {/* Category */}
          <p className="text-xs text-gray-400 mt-1">
            {product.category?.name}
          </p>
        </div>
      </Link>

      {/* Add to Cart */}
      {isAuthenticated && (
        <div className="px-3 pb-3">
          <button
            onClick={() => addToCart(product.id, 1)}
            className="w-full flex items-center justify-center gap-2 py-1.5 border-2 border-[#2874f0] text-[#2874f0] text-sm font-medium rounded hover:bg-[#2874f0] hover:text-white transition-colors"
          >
            <ShoppingCart size={14} />
            Add to Cart
          </button>
        </div>
      )}
    </div>
  );
};

export default ProductCard;