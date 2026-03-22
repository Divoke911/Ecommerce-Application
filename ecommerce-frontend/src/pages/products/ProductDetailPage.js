import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  ShoppingCart, Heart, Share2, Shield,
  Truck, RefreshCw, Star
} from 'lucide-react';
import { productApi, reviewApi } from '../../api';
import { Layout } from '../../components/layout';
import { Spinner, Button, StarRating, Badge } from '../../components/ui';
import { ReviewCard } from '../../components/common';
import { useCart } from '../../hooks/useCart';
import { useWishlist } from '../../hooks/useWishlist';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '../../store/slices/authSlice';
import { formatPrice } from '../../utils';

const ProductDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);

  const { data: productData, isLoading } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getById(id),
  });

  const { data: reviewsData } = useQuery({
    queryKey: ['reviews', id],
    queryFn: () => reviewApi.getProductReviews(id, 0, 5),
  });

  const product = productData?.data?.data;
  const reviews = reviewsData?.data?.data?.content || [];
  const inWishlist = product ? isInWishlist(product.id) : false;

  const handleAddToCart = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await addToCart(product.id, quantity);
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) { navigate('/login'); return; }
    await addToCart(product.id, quantity);
    navigate('/cart');
  };

  if (isLoading) return (
    <Layout><Spinner className="py-32" size="lg" /></Layout>
  );

  if (!product) return (
    <Layout>
      <div className="text-center py-32 text-gray-500">Product not found</div>
    </Layout>
  );

  const images = product.imageUrls?.length > 0
    ? product.imageUrls
    : ['https://via.placeholder.com/400x400?text=No+Image'];

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 py-4">

        {/* Breadcrumb */}
        <nav className="text-sm text-gray-500 mb-4">
          <span
            className="hover:text-[#2874f0] cursor-pointer"
            onClick={() => navigate('/')}
          >
            Home
          </span>
          <span className="mx-2">/</span>
          <span
            className="hover:text-[#2874f0] cursor-pointer"
            onClick={() => navigate(`/products?category=${product.category?.id}`)}
          >
            {product.category?.name}
          </span>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{product.name}</span>
        </nav>

        <div className="bg-white rounded shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

            {/* Images */}
            <div className="flex gap-4">
              <div className="flex flex-col gap-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(idx)}
                    className={`w-14 h-14 border-2 rounded p-1 transition-colors ${
                      selectedImage === idx
                        ? 'border-[#2874f0]'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${idx}`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/56x56?text=Img';
                      }}
                    />
                  </button>
                ))}
              </div>
              <div className="flex-1 flex items-center justify-center border rounded-lg p-4 bg-gray-50">
                <img
                  src={images[selectedImage]}
                  alt={product.name}
                  className="max-h-72 max-w-full object-contain"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x300?text=No+Image';
                  }}
                />
              </div>
            </div>

            {/* Details */}
            <div>
              <h1 className="text-xl font-medium text-gray-900 mb-2">
                {product.name}
              </h1>

              {/* Rating */}
              <div className="flex items-center gap-3 mb-3">
                {product.averageRating > 0 && (
                  <div className="flex items-center gap-1 bg-green-600 text-white text-sm px-2 py-0.5 rounded">
                    <span>{product.averageRating?.toFixed(1)}</span>
                    <Star size={12} fill="white" />
                  </div>
                )}
                <span className="text-sm text-gray-500">
                  {reviews.length} Reviews
                </span>
              </div>

              {/* Price */}
              <div className="mb-4">
                <span className="text-3xl font-bold text-gray-900">
                  {formatPrice(product.price)}
                </span>
              </div>

              {/* Stock */}
              <div className="mb-4">
                {product.stock > 0 ? (
                  <Badge variant="success">
                    In Stock ({product.stock} available)
                  </Badge>
                ) : (
                  <Badge variant="danger">Out of Stock</Badge>
                )}
              </div>

              {/* Seller */}
              <p className="text-sm text-gray-500 mb-4">
                Sold by: <span className="text-[#2874f0]">{product.sellerName}</span>
              </p>

              {/* Quantity */}
              {product.stock > 0 && (
                <div className="flex items-center gap-3 mb-6">
                  <span className="text-sm text-gray-700">Quantity:</span>
                  <div className="flex items-center border border-gray-300 rounded">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      −
                    </button>
                    <span className="px-4 py-1 border-x border-gray-300 font-medium">
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 mb-6">
                <Button
                  size="lg"
                  variant="secondary"
                  onClick={handleAddToCart}
                  disabled={product.stock === 0}
                  className="flex-1 flex items-center justify-center gap-2"
                >
                  <ShoppingCart size={18} /> Add to Cart
                </Button>
                <Button
                  size="lg"
                  onClick={handleBuyNow}
                  disabled={product.stock === 0}
                  className="flex-1"
                >
                  Buy Now
                </Button>
              </div>

              {/* Wishlist */}
              {isAuthenticated && (
                <button
                  onClick={() => toggleWishlist(product)}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-red-500 transition-colors mb-6"
                >
                  <Heart
                    size={16}
                    className={inWishlist ? 'fill-red-500 text-red-500' : ''}
                  />
                  {inWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
                </button>
              )}

              {/* Delivery Info */}
              <div className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Truck size={16} className="text-[#2874f0]" />
                  <span>Free delivery on orders above ₹500</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <RefreshCw size={16} className="text-[#2874f0]" />
                  <span>7 days easy return policy</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Shield size={16} className="text-[#2874f0]" />
                  <span>Secure payments & genuine products</span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">
                Product Description
              </h2>
              <p className="text-gray-600 text-sm leading-relaxed">
                {product.description}
              </p>
            </div>
          )}

          {/* Reviews */}
          <div className="mt-8 border-t pt-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Ratings & Reviews
            </h2>
            {reviews.length === 0 ? (
              <p className="text-gray-500 text-sm">
                No reviews yet. Be the first to review!
              </p>
            ) : (
              <div>
                {reviews.map(review => (
                  <ReviewCard key={review.id} review={review} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ProductDetailPage;