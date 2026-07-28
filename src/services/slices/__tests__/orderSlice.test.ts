import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';

import orderReducer, {
  initialState,
  clearOrder,
  createOrder,
  getOrderByNumber
} from '../orderSlice';
import { TOrder } from '@utils-types';
import * as burgerAPI from '@api';

const mockOrder: TOrder = {
  _id: '233',
  status: 'ready',
  name: 'Order',
  createdAt: '',
  updatedAt: '',
  number: 2,
  ingredients: ['ingredient1', 'ingredient2']
};

describe('тесты orderSlice', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('синхронные редьюсеры', () => {
    test('полная очистка заказа и ошибки', () => {
      const stateOrder = {
        order: mockOrder,
        isOrderLoading: false,
        error: 'Ошибка'
      };

      const newState = orderReducer(stateOrder, clearOrder());

      expect(newState.order).toBeNull();
      expect(newState.error).toBeNull();
    });
  });

  describe('асинхронные экшены', () => {
    describe('проверка createOrder', () => {
      test('успешное создание заказа', async () => {
        const store = configureStore({
          reducer: { order: orderReducer }
        });
        const ingredients = ['ingredient1', 'ingredient2'];
        const apiResponce = {
          success: true,
          name: 'Бургер',
          order: { ...mockOrder, ingredients: [] }
        };

        const createOrderSpy = jest
          .spyOn(burgerAPI, 'orderBurgerApi')
          .mockResolvedValue(apiResponce as any);

        await store.dispatch(createOrder(ingredients));

        const state = store.getState().order;

        expect(state.order).toEqual(mockOrder);
        expect(createOrderSpy).toHaveBeenLastCalledWith(ingredients);
        expect(state.isOrderLoading).toBe(false);
        expect(createOrderSpy).toHaveBeenCalledTimes(1);
      });

      test('ошибка при создании заказа', async () => {
        const store = configureStore({
          reducer: { order: orderReducer }
        });
        const ingredients = ['ingredient1'];
        const errorMessage = 'Ошибка создания заказа';

        const createOrderSpy = jest
          .spyOn(burgerAPI, 'orderBurgerApi')
          .mockRejectedValue(new Error(errorMessage));

        await store.dispatch(createOrder(ingredients));

        const state = store.getState().order;

        expect(state.error).toBe(errorMessage);
        expect(state.isOrderLoading).toBe(false);
        expect(createOrderSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('проверка getOrderByNumber', () => {
      test('успешное получение заказа по номеру', async () => {
        const store = configureStore({
          reducer: { order: orderReducer }
        });
        const orderNumber = 2;
        const apiResponce = {
          success: true,
          orders: [mockOrder]
        };

        const getOrderSpy = jest
          .spyOn(burgerAPI, 'getOrderByNumberApi')
          .mockResolvedValue(apiResponce);

        await store.dispatch(getOrderByNumber(orderNumber));

        const state = store.getState().order;

        expect(state.order).toEqual(mockOrder);
        expect(getOrderSpy).toHaveBeenLastCalledWith(orderNumber);
        expect(state.isOrderLoading).toBe(false);
        expect(getOrderSpy).toHaveBeenCalledTimes(1);
      });

      test('ошибка при получении заказа по номеру', async () => {
        const store = configureStore({
          reducer: { order: orderReducer }
        });
        const orderNumber = 3;
        const errorMessage = 'Заказ не найден';

        const getOrderSpy = jest
          .spyOn(burgerAPI, 'getOrderByNumberApi')
          .mockRejectedValue(new Error(errorMessage));

        await store.dispatch(getOrderByNumber(orderNumber));

        const state = store.getState().order;

        expect(state.error).toEqual(errorMessage);
        expect(state.isOrderLoading).toBe(false);
        expect(getOrderSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
