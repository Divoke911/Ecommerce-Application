import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  selectWishlistItems,
  selectIsInWishlist,
  setWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../store/slices/wishlistSlice';
import { wishlistApi } from '../api';

export const useWishlist = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectWishlistItems);

  const fetchWishlist = async () => {
    try {
      const res = await wishlistApi.getWishlist();
      dispatch(setWishlist(res.data.data));
    } catch (err) {
      // Silent fail
    }
  };

  const toggleWishlist = async (product) => {
    const isInList = items.some(
      (item) => item.productId === product.id
    );

    try {
      if (isInList) {
        await wishlistApi.removeFromWishlist(product.id);
        dispatch(removeFromWishlist(product.id));
        toast.success('Removed from wishlist');
      } else {
        await wishlistApi.addToWishlist(product.id);
        dispatch(addToWishlist({
          productId: product.id,
          productName: product.name,
          price: product.price,
          imageUrl: product.imageUrls?.[0] || null,
        }));
        toast.success('Added to wishlist!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update wishlist');
    }
  };

  const isInWishlist = (productId) =>
    items.some((item) => item.productId === productId);

  return {
    items,
    fetchWishlist,
    toggleWishlist,
    isInWishlist,
  };
};