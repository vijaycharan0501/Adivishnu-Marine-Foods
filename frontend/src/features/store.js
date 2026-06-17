import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/authSlice';
import productReducer from './products/productSlice';
import negotiationReducer from './negotiations/negotiationSlice';
import orderReducer from './orders/orderSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    products: productReducer,
    negotiation: negotiationReducer,
    orders: orderReducer,
  },
});
