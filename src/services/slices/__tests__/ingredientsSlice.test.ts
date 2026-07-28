import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';

import ingredientReducer, {
  fetchIngredients,
  initialState
} from '../ingredientSlice';
import { TIngredient } from '@utils-types';
import * as burgerAPI from '@api';

const mockIngredient: TIngredient = {
  _id: '111',
  name: 'Булка',
  type: 'bun',
  proteins: 12,
  fat: 33,
  carbohydrates: 22,
  calories: 33,
  price: 123,
  image: 'url',
  image_large: 'url',
  image_mobile: 'url'
};

describe('тесты асинхронных экшенов ingredientSlice', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });
  test('успешная загрузка ингредиентов', async () => {
    const store = configureStore({
      reducer: { ingredients: ingredientReducer }
    });
    const getIngredientsSpy = jest
      .spyOn(burgerAPI, 'getIngredientsApi')
      .mockResolvedValue([mockIngredient]);

    await store.dispatch(fetchIngredients());

    const state = store.getState().ingredients;

    expect(state.ingredients).toEqual([mockIngredient]);
    expect(getIngredientsSpy).toHaveBeenCalledTimes(1);
    expect(state.isIngredientsLoading).toBe(false);
  });

  test('обработка ошибки при запросе', async () => {
    const store = configureStore({
      reducer: { ingredients: ingredientReducer }
    });
    const errorMessage = 'Ошибка загрузки';
    const getIngredientsSpy = jest
      .spyOn(burgerAPI, 'getIngredientsApi')
      .mockRejectedValue(new Error(errorMessage));

    await store.dispatch(fetchIngredients());

    const state = store.getState().ingredients;

    expect(state.error).toBe(errorMessage);
    expect(getIngredientsSpy).toHaveBeenCalledTimes(1);
    expect(state.isIngredientsLoading).toBe(false);
  });

  test('обработка неизвестного экшена', () => {
    const action = { type: 'unknown' };
    const newState = ingredientReducer(undefined, action);
    expect(newState).toEqual(initialState);
  });
});
