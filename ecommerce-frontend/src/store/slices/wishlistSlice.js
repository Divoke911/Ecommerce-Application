import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  items: [],
  loading: false,
};

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState,
  reducers: {
    setWishlist: (state, action) => {
      state.items = action.payload;
    },
    addToWishlist: (state, action) => {
      state.items.push(action.payload);
    },
    removeFromWishlist: (state, action) => {
      state.items = state.items.filter(
        (item) => item.productId !== action.payload
      );
    },
    setWishlistLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setWishlist,
  addToWishlist,
  removeFromWishlist,
  setWishlistLoading,
} = wishlistSlice.actions;

export default wishlistSlice.reducer;

export const selectWishlistItems = (state) => state.wishlist.items;
export const selectIsInWishlist = (productId) => (state) =>
  state.wishlist.items.some((item) => item.productId === productId);