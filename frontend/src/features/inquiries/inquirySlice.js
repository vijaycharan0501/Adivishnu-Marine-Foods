import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/inquiries/';

const initialState = {
  inquiries: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getInquiries = createAsyncThunk('inquiries/getAll', async (_, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.get(API_URL, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const createInquiry = createAsyncThunk('inquiries/create', async (inquiryData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, inquiryData, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateInquiryStatus = createAsyncThunk('inquiries/updateStatus', async ({ id, status, adminReply }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(API_URL + id + '/status', { status, adminReply }, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const inquirySlice = createSlice({
  name: 'inquiry',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getInquiries.pending, (state) => { state.isLoading = true; })
      .addCase(getInquiries.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.inquiries = action.payload;
      })
      .addCase(getInquiries.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createInquiry.fulfilled, (state, action) => {
        state.inquiries.unshift(action.payload);
      })
      .addCase(updateInquiryStatus.fulfilled, (state, action) => {
        const index = state.inquiries.findIndex(i => i._id === action.payload._id);
        if (index !== -1) {
          state.inquiries[index] = action.payload;
        }
      });
  },
});

export const { reset } = inquirySlice.actions;
export default inquirySlice.reducer;
