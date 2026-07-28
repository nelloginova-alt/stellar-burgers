import { expect, test, describe } from '@jest/globals';

import constructorReducer, {
  initialState,
  addIngredient,
  removeIngredient,
  clearIngredient,
  moveIngredientUp,
  moveIngredientDown
} from '../constructorSlice';

import { TConstructorIngredient } from '@utils-types';

const mockBun: TConstructorIngredient = {
  id: 'bun-1',
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

const mockIngredient1: TConstructorIngredient = {
  ...mockBun,
  id: 'ingr-1',
  _id: '222',
  name: 'Начинка',
  type: 'main'
};

const mockIngredient2: TConstructorIngredient = {
  ...mockBun,
  id: 'ingr-2',
  _id: '333',
  name: 'Соус',
  type: 'sauce'
};

describe('тесты синхронных экшенов contructorSlice', () => {
  test('добавление булки в конструктор', () => {
    const newState = constructorReducer(
      { ...initialState },
      addIngredient(mockBun)
    );
    expect(newState).toEqual({ ...initialState, bun: mockBun });
  });

  test('добавление начинки в конструктор', () => {
    const newState = constructorReducer(
      { ...initialState },
      addIngredient(mockIngredient1)
    );
    expect(newState).toEqual({
      ...initialState,
      ingredients: [mockIngredient1]
    });
  });

  test('удаление ингредиента из конструктора', () => {
    const startingState = {
      ...initialState,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const newState = constructorReducer(
      startingState,
      removeIngredient(mockIngredient1.id)
    );
    expect(newState).toEqual({
      ...initialState,
      ingredients: [mockIngredient2]
    });
  });

  test('полная очистка конструктора', () => {
    const startingState = {
      ...initialState,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const newState = constructorReducer(startingState, clearIngredient());
    expect(newState).toEqual(initialState);
  });

  test('перемещение ингредиента вверх', () => {
    const startingState = {
      ...initialState,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const newState = constructorReducer(startingState, moveIngredientUp(1));
    expect(newState).toEqual({
      ...initialState,
      ingredients: [mockIngredient2, mockIngredient1]
    });
  });

  test('перемещение ингредиента вниз', () => {
    const startingState = {
      ...initialState,
      ingredients: [mockIngredient1, mockIngredient2]
    };
    const newState = constructorReducer(startingState, moveIngredientDown(0));
    expect(newState).toEqual({
      ...initialState,
      ingredients: [mockIngredient2, mockIngredient1]
    });
  });

  test('обработка неизвестного экшена', () => {
    const action = { type: 'unknown' };
    const newState = constructorReducer(undefined, action);
    expect(newState).toEqual(initialState);
  });
});
