import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/procurements/';

const initialState = {
  procurements: [],
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

export const getProcurements = createAsyncThunk('procurements/getAll', async (_, thunkAPI) => {
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

export const createProcurement = createAsyncThunk('procurements/create', async (procurementData, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL, procurementData, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const fulfillProcurement = createAsyncThunk('procurements/fulfill', async ({ id, data }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + id + '/fulfill', data, config);
    return response.data.procurement;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const rejectProcurement = createAsyncThunk('procurements/reject', async ({ id, reason }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.post(API_URL + id + '/reject', { reason }, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const updateProcurementStatus = createAsyncThunk('procurements/updateStatus', async ({ id, status }, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = { headers: { Authorization: `Bearer ${token}` } };
    const response = await axios.put(API_URL + id, { status }, config);
    return response.data;
  } catch (error) {
    const message = (error.response?.data?.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const procurementSlice = createSlice({
  name: 'procurement',
  initialState,
  reducers: {
    reset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(getProcurements.pending, (state) => { state.isLoading = true; })
      .addCase(getProcurements.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.procurements = action.payload;
      })
      .addCase(getProcurements.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(createProcurement.fulfilled, (state, action) => {
        if (Array.isArray(action.payload)) {
          state.procurements.unshift(...action.payload);
        } else {
          state.procurements.unshift(action.payload);
        }
      })
      .addCase(fulfillProcurement.fulfilled, (state, action) => {
        const index = state.procurements.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.procurements[index] = action.payload;
        }
      })
      .addCase(rejectProcurement.fulfilled, (state, action) => {
        const index = state.procurements.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.procurements[index] = action.payload;
        }
      })
      .addCase(updateProcurementStatus.fulfilled, (state, action) => {
        const index = state.procurements.findIndex(p => p._id === action.payload._id);
        if (index !== -1) {
          state.procurements[index] = action.payload;
        }
      });
  },
});

export const { reset } = procurementSlice.actions;
export default procurementSlice.reducer;
