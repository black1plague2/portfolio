import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchBuyerOrders = createAsyncThunk('orders/fetchBuyer', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/orders', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const placeOrder = createAsyncThunk('orders/place', async (orderData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/orders', orderData);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchOrderTracking = createAsyncThunk('orders/track', async (orderId, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/orders/${orderId}/track`);
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchWeaverSubOrders = createAsyncThunk('orders/weaverSubOrders', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/weaver/sub-orders', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const updateSubOrderStage = createAsyncThunk('orders/updateStage', async ({ id, stage, note }, { rejectWithValue }) => {
  try {
    const { data } = await api.patch(`/weaver/sub-orders/${id}/stage`, { stage, note });
    return data.data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    subOrders: [],
    currentOrder: null,
    tracking: null,
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearOrderError: (state) => { state.error = null; },
    updateOrderFromSocket: (state, action) => {
      const idx = state.orders.findIndex((o) => o._id === action.payload.orderId);
      if (idx !== -1) state.orders[idx].status = action.payload.status;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBuyerOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchBuyerOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBuyerOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(placeOrder.pending, (state) => { state.isLoading = true; })
      .addCase(placeOrder.fulfilled, (state, action) => {
        state.isLoading = false;
        toast.success('Order placed successfully!');
      })
      .addCase(placeOrder.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        toast.error(action.payload || 'Failed to place order');
      })
      .addCase(fetchOrderTracking.fulfilled, (state, action) => {
        state.tracking = action.payload;
      })
      .addCase(fetchWeaverSubOrders.pending, (state) => { state.isLoading = true; })
      .addCase(fetchWeaverSubOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.subOrders = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(updateSubOrderStage.fulfilled, (state, action) => {
        const idx = state.subOrders.findIndex((s) => s._id === action.payload.subOrder._id);
        if (idx !== -1) state.subOrders[idx] = action.payload.subOrder;
        toast.success('Production stage updated!');
      });
  },
});

export const { clearOrderError, updateOrderFromSocket } = orderSlice.actions;
export default orderSlice.reducer;
