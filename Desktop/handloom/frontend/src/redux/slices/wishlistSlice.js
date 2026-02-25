import { createSlice } from '@reduxjs/toolkit';

const saved = (() => { try { return JSON.parse(localStorage.getItem('wishlist') || '[]'); } catch { return []; } })();

const wishlistSlice = createSlice({
  name: 'wishlist',
  initialState: { items: saved },
  reducers: {
    toggleWishlist: (state, action) => {
      const product = action.payload;
      const idx = state.items.findIndex((p) => p._id === product._id);
      if (idx === -1) {
        state.items.push(product);
      } else {
        state.items.splice(idx, 1);
      }
      localStorage.setItem('wishlist', JSON.stringify(state.items));
    },
    clearWishlist: (state) => {
      state.items = [];
      localStorage.removeItem('wishlist');
    },
  },
});

export const { toggleWishlist, clearWishlist } = wishlistSlice.actions;
export default wishlistSlice.reducer;
