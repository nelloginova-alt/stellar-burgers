import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { orderBurgerApi, getOrderByNumberApi } from '@api';
import { TOrder } from '../../utils/types';

type TOrderState = {
  order: TOrder | null;
  isOrderLoading: boolean;
  error: string | null;
};

const initialState: TOrderState = {
  order: null,
  isOrderLoading: false,
  error: null
};

export const createOrder = createAsyncThunk(
  'order/createOrder',
  async (ingredients: string[]) => {
    const data = await orderBurgerApi(ingredients);
    return {
      ...data.order,
      ingredients: ingredients
    };
  }
);

export const getOrderByNumber = createAsyncThunk(
  'order/getOrderByNumber',
  async (number: number) => {
    const data = await getOrderByNumberApi(number);
    return data.orders[0];
  }
);

export const orderSlice = createSlice({
  name: 'order',
  initialState,
  reducers: {
    clearOrder: (state) => {
      (state.order = null), (state.error = null);
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(createOrder.pending, (state) => {
        state.isOrderLoading = true;
        state.error = null;
      })
      .addCase(getOrderByNumber.pending, (state) => {
        state.isOrderLoading = true;
        state.error = null;
      })

      .addCase(createOrder.fulfilled, (state, action) => {
        state.isOrderLoading = false;
        state.order = action.payload;
      })
      .addCase(getOrderByNumber.fulfilled, (state, action) => {
        state.isOrderLoading = false;
        state.order = action.payload;
      })

      .addCase(createOrder.rejected, (state, action) => {
        state.isOrderLoading = false;
        state.error = action.error.message || 'Ошибка создания заказа';
      })
      .addCase(getOrderByNumber.rejected, (state, action) => {
        state.isOrderLoading = false;
        state.error = action.error.message || 'Ошибка получения заказа';
      });
  }
});

export const { clearOrder } = orderSlice.actions;
export default orderSlice.reducer;
