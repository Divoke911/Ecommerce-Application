import { useSelector, useDispatch } from 'react-redux';
import toast from 'react-hot-toast';
import {
  selectCartItems,
  selectCartTotal,
  selectCartItemCount,
  setCart,
  setCartLoading,
} from '../store/slices/cartSlice';
import { cartApi } from '../api';

export const useCart = () => {
  const dispatch = useDispatch();
  const items = useSelector(selectCartItems);
  const totalAmount = useSelector(selectCartTotal);
  const totalItems = useSelector(selectCartItemCount);

  const fetchCart = async () => {
    try {
      dispatch(setCartLoading(true));
      const res = await cartApi.getCart();
      dispatch(setCart(res.data.data));
    } catch (err) {
      // Silent fail
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  const addToCart = async (productId, quantity = 1) => {
    try {
      dispatch(setCartLoading(true));
      const res = await cartApi.addItem({ productId, quantity });
      dispatch(setCart(res.data.data));
      toast.success('Added to cart!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  const updateCartItem = async (productId, quantity) => {
    try {
      dispatch(setCartLoading(true));
      const res = await cartApi.updateItem(productId, quantity);
      dispatch(setCart(res.data.data));
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update cart');
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  const removeFromCart = async (productId) => {
    try {
      dispatch(setCartLoading(true));
      const res = await cartApi.removeItem(productId);
      dispatch(setCart(res.data.data));
      toast.success('Item removed from cart');
    } catch (err) {
      toast.error('Failed to remove item');
    } finally {
      dispatch(setCartLoading(false));
    }
  };

  return {
    items,
    totalAmount,
    totalItems,
    fetchCart,
    addToCart,
    updateCartItem,
    removeFromCart,
  };
};