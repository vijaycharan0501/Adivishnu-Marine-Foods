import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import axios from 'axios';

const API_URL = 'https://adivishnu-marine-foods.onrender.com/api/negotiations/';

const initialState = {
  negotiation: null,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};

// Start or get negotiation
export const startNegotiation = createAsyncThunk('negotiations/start', async (productId, thunkAPI) => {
  try {
    const token = thunkAPI.getState().auth.user.token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.post(API_URL, { productId }, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Add offer
export const addOffer = createAsyncThunk('negotiations/addOffer', async (offerData, thunkAPI) => {
  try {
    const { negotiationId, price } = offerData;
    const token = thunkAPI.getState().auth.user.token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.post(API_URL + negotiationId + '/offer', { price }, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Update negotiation status
export const updateNegotiationStatus = createAsyncThunk('negotiations/updateStatus', async (statusData, thunkAPI) => {
  try {
    const { negotiationId, status } = statusData;
    const token = thunkAPI.getState().auth.user.token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.put(API_URL + negotiationId + '/status', { status }, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

// Update contact details
export const updateContactDetails = createAsyncThunk('negotiations/updateContact', async (contactData, thunkAPI) => {
  try {
    const { negotiationId, contactDetails } = contactData;
    const token = thunkAPI.getState().auth.user.token;
    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };
    const response = await axios.put(API_URL + negotiationId + '/contact', { contactDetails }, config);
    return response.data;
  } catch (error) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const negotiationSlice = createSlice({
  name: 'negotiation',
  initialState,
  reducers: {
    reset: () => initialState,
    updateNegotiationData: (state, action) => {
      state.negotiation = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(startNegotiation.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(startNegotiation.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.negotiation = action.payload;
      })
      .addCase(startNegotiation.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload;
      })
      .addCase(addOffer.fulfilled, (state, action) => {
        state.negotiation = action.payload;
      })
      .addCase(updateNegotiationStatus.fulfilled, (state, action) => {
        state.negotiation = action.payload;
      })
      .addCase(updateContactDetails.fulfilled, (state, action) => {
        state.negotiation = action.payload;
      });
  },
});

export const { reset, updateNegotiationData } = negotiationSlice.actions;
export default negotiationSlice.reducer;
