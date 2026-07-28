import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';

import feedReducer, { initialState, getFeeds } from '../feedSlice';
import { TOrder } from '@utils-types';
import * as burgerAPI from '@api';

const mockFeed: TOrder = {
  _id: '233',
  status: 'ready',
  name: 'Order',
  createdAt: '',
  updatedAt: '',
  number: 2,
  ingredients: ['ingredient1', 'ingredient2']
};

describe('тесты feedSlice', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('асинхронные экшены', () => {
    test('успешное получение ленты заказов', async () => {
      const store = configureStore({
        reducer: { feed: feedReducer }
      });
      const apiResponce = {
        success: true,
        orders: [mockFeed],
        total: 1000,
        totalToday: 10
      };

      const getFeedSpy = jest
        .spyOn(burgerAPI, 'getFeedsApi')
        .mockResolvedValue(apiResponce);

      await store.dispatch(getFeeds());

      const state = store.getState().feed;

      expect(state.orders).toEqual([mockFeed]);
      expect(state.total).toBe(1000);
      expect(state.totalToday).toBe(10);
      expect(state.isFeedLoading).toBe(false);
      expect(getFeedSpy).toHaveBeenCalledTimes(1);
    });

    test('ошибка при получении ленты заказов', async () => {
      const store = configureStore({
        reducer: { feed: feedReducer }
      });
      const errorMessage = 'Не удалось загрузить ленту заказов';

      const getFeedSpy = jest
        .spyOn(burgerAPI, 'getFeedsApi')
        .mockRejectedValue(new Error(errorMessage));

      await store.dispatch(getFeeds());

      const state = store.getState().feed;

      expect(state.error).toEqual(errorMessage);
      expect(state.isFeedLoading).toBe(false);
      expect(getFeedSpy).toHaveBeenCalledTimes(1);
    });
  });
});
