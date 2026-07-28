import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { getFeedsApi } from '@api';
import { TOrder, TOrdersData } from '../../utils/types';

type TFeedSlice = {
  orders: TOrder[];
  total: number;
  totalToday: number;
  isFeedLoading: boolean;
  error: string | null;
};

export const initialState: TFeedSlice = {
  orders: [],
  total: 0,
  totalToday: 0,
  isFeedLoading: false,
  error: null
};

export const getFeeds = createAsyncThunk('feed/getFeeds', async () => {
  const data = await getFeedsApi();
  return data;
});

export const feedSlice = createSlice({
  name: 'feed',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getFeeds.pending, (state) => {
        state.isFeedLoading = true;
        state.error = null;
      })
      .addCase(getFeeds.fulfilled, (state, action) => {
        state.isFeedLoading = false;
        state.orders = action.payload.orders;
        state.total = action.payload.total;
        state.totalToday = action.payload.totalToday;
      })
      .addCase(getFeeds.rejected, (state, action) => {
        state.isFeedLoading = false;
        state.error = action.error.message || 'Ошибка загрузки ленты';
      });
  }
});

export default feedSlice.reducer;
