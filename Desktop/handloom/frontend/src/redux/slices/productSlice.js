import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';
import toast from 'react-hot-toast';

export const fetchProducts = createAsyncThunk('products/fetchAll', async (params, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products', { params });
    return data;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchProduct = createAsyncThunk('products/fetchOne', async (id, { rejectWithValue }) => {
  try {
    const { data } = await api.get(`/products/${id}`);
    return data.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const fetchMyProducts = createAsyncThunk('products/fetchMy', async (_, { rejectWithValue }) => {
  try {
    const { data } = await api.get('/products/my/products');
    return data.data.products;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

export const createProduct = createAsyncThunk('products/create', async (formData, { rejectWithValue }) => {
  try {
    const { data } = await api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    return data.data.product;
  } catch (err) {
    return rejectWithValue(err.response?.data?.message);
  }
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    currentProduct: null,
    myProducts: [],
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearProductError: (state) => { state.error = null; },
    setCurrentProduct: (state, action) => { state.currentProduct = action.payload; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => { state.isLoading = true; })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.currentProduct = action.payload;
      })
      .addCase(fetchMyProducts.fulfilled, (state, action) => {
        state.myProducts = action.payload;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.myProducts.unshift(action.payload);
        toast.success('Product created!');
      })
      .addCase(createProduct.rejected, (state, action) => {
        toast.error(action.payload || 'Failed to create product');
      });
  },
});

export const { clearProductError, setCurrentProduct } = productSlice.actions;
export default productSlice.reducer;
