import { expect, test, describe } from '@jest/globals';
import { configureStore } from '@reduxjs/toolkit';

import userReducer, {
  initialState,
  clearUser,
  loginUser,
  registerUser,
  getUser,
  updateUser,
  logoutUser
} from '../userSlice';
import { TUser } from '@utils-types';
import * as burgerAPI from '@api';

jest.mock('../../../utils/cookie', () => ({
  setCookie: jest.fn(),
  deleteCookie: jest.fn()
}));

const mockUser: TUser = {
  email: 'test@yandex.ru',
  name: 'Тесовый пользователь'
};

describe('тесты userSlice', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  beforeEach(() => {
    Object.defineProperty(global, 'localStorage', {
      value: {
        setItem: jest.fn(),
        getItem: jest.fn(),
        removeItem: jest.fn()
      },
      writable: true
    });
  });

  describe('синхронные редьюсеры', () => {
    test('полная очистка пользователя - clearUser', () => {
      const stateUser = {
        user: mockUser,
        isUserLoading: false,
        isAuthChecked: false,
        error: 'Ошибка'
      };

      const newState = userReducer(stateUser, clearUser());
      expect(newState.user).toBeNull();
      expect(newState.error).toBeNull();
    });
  });

  describe('асинхронные экшены', () => {
    describe('проверка loginUser', () => {
      test('успешный вход пользователя', async () => {
        const store = configureStore({
          reducer: { user: userReducer }
        });
        const loginData = {
          email: 'test@yandex.ru',
          password: 'password'
        };
        const apiResponse = {
          success: true,
          refreshToken: 'mock refresh token',
          accessToken: 'mock access token',
          user: mockUser
        };

        const loginSpy = jest
          .spyOn(burgerAPI, 'loginUserApi')
          .mockResolvedValue(apiResponse);

        await store.dispatch(loginUser(loginData));

        const state = store.getState().user;

        expect(state.user).toEqual(mockUser);
        expect(loginSpy).toHaveBeenCalledWith(loginData);
        expect(state.isAuthChecked).toBe(true);
        expect(state.isUserLoading).toBe(false);
        expect(loginSpy).toHaveBeenCalledTimes(1);
      });

      test('ошибка при входе пользователя', async () => {
        const store = configureStore({
          reducer: { user: userReducer }
        });
        const loginData = {
          email: 'wrong@yandex.ru',
          password: 'wrong'
        };
        const errorMessage = 'Неверный логин или пароль';

        const loginSpy = jest
          .spyOn(burgerAPI, 'loginUserApi')
          .mockRejectedValue(new Error(errorMessage));

        await store.dispatch(loginUser(loginData));

        const state = store.getState().user;

        expect(state.error).toBe(errorMessage);
        expect(state.isUserLoading).toBe(false);
        expect(loginSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('проверка registerUser', () => {
      test('успешная регистрация пользователся', async () => {
        const store = configureStore({
          reducer: { user: userReducer }
        });
        const registerData = {
          email: 'test@yandex.ru',
          name: 'Пользователь',
          password: 'password'
        };
        const apiResponse = {
          success: true,
          refreshToken: 'mock refresh token',
          accessToken: 'mock access token',
          user: mockUser
        };

        const registerSpy = jest
          .spyOn(burgerAPI, 'registerUserApi')
          .mockResolvedValue(apiResponse);

        await store.dispatch(registerUser(registerData));

        const state = store.getState().user;

        expect(state.user).toEqual(mockUser);
        expect(registerSpy).toHaveBeenCalledWith(registerData);
        expect(state.isAuthChecked).toBe(true);
        expect(state.isUserLoading).toBe(false);
        expect(registerSpy).toHaveBeenCalledTimes(1);
      });

      test('ошибка при регистрации пользователя', async () => {
        const store = configureStore({
          reducer: { user: userReducer }
        });
        const registerData = {
          email: 'test@yandex.ru',
          name: 'Пользователь',
          password: 'password'
        };
        const errorMessage = 'Такой пользователь уже существует';

        const registerSpy = jest
          .spyOn(burgerAPI, 'registerUserApi')
          .mockRejectedValue(new Error(errorMessage));

        await store.dispatch(registerUser(registerData));

        const state = store.getState().user;

        expect(state.error).toBe(errorMessage);
        expect(state.isUserLoading).toBe(false);
        expect(registerSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('проверка getUser', () => {
      test('успешное получение данных пользователя', async () => {
        const store = configureStore({
          reducer: { user: userReducer }
        });
        const apiResponse = {
          success: true,
          user: mockUser
        };
        const getUserSpy = jest
          .spyOn(burgerAPI, 'getUserApi')
          .mockResolvedValue(apiResponse);

        await store.dispatch(getUser());

        const state = store.getState().user;

        expect(state.user).toEqual(mockUser);
        expect(state.isAuthChecked).toBe(true);
        expect(state.isUserLoading).toBe(false);
        expect(getUserSpy).toHaveBeenCalledTimes(1);
      });

      test('ошибка при получении данных пользователя', async () => {
        const store = configureStore({
          reducer: { user: userReducer }
        });
        const errorMessage = 'Пользователь не зарегестрирован';

        const getUserSpy = jest
          .spyOn(burgerAPI, 'getUserApi')
          .mockRejectedValue(new Error(errorMessage));

        await store.dispatch(getUser());

        const state = store.getState().user;

        expect(state.error).toBe(errorMessage);
        expect(state.isAuthChecked).toBe(true);
        expect(state.isUserLoading).toBe(false);
        expect(getUserSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('проверка updateUser', () => {
      test('успешное обновление данных пользователя', async () => {
        const store = configureStore({
          reducer: { user: userReducer }
        });
        const updateData = { name: 'Новое имя' };
        const updateMockUser = { ...mockUser, ...updateData };
        const apiResponse = {
          success: true,
          user: updateMockUser
        };

        const updateUserSpy = jest
          .spyOn(burgerAPI, 'updateUserApi')
          .mockResolvedValue(apiResponse);

        await store.dispatch(updateUser(updateData));

        const state = store.getState().user;

        expect(state.user).toEqual(updateMockUser);
        expect(updateUserSpy).toHaveBeenCalledWith(updateData);
        expect(state.isUserLoading).toBe(false);
        expect(updateUserSpy).toHaveBeenCalledTimes(1);
      });

      test('ошибка при обновлении данных пользователя', async () => {
        const store = configureStore({
          reducer: { user: userReducer }
        });
        const updateData = { email: 'update@yandex.ru' };
        const errorMessage = 'Ошибка обновления данных';

        const updateUserSpy = jest
          .spyOn(burgerAPI, 'updateUserApi')
          .mockRejectedValue(new Error(errorMessage));

        await store.dispatch(updateUser(updateData));

        const state = store.getState().user;

        expect(state.error).toBe(errorMessage);
        expect(state.isUserLoading).toBe(false);
        expect(updateUserSpy).toHaveBeenCalledTimes(1);
      });
    });

    describe('проверка logoutUser', () => {
      test('успешный выход пользователя из системы', async () => {
        const store = configureStore({
          reducer: { user: userReducer },
          preloadedState: {
            user: {
              ...initialState,
              user: mockUser,
              isAuthChecked: true
            }
          }
        });
        const logoutSpy = jest
          .spyOn(burgerAPI, 'logoutApi')
          .mockResolvedValue({ success: true });

        await store.dispatch(logoutUser());

        const state = store.getState().user;

        expect(state.user).toBeNull();
        expect(state.isUserLoading).toBe(false);
        expect(logoutSpy).toHaveBeenCalledTimes(1);
      });

      test('ошибка при выходе пользователя из системы', async () => {
        const store = configureStore({
          reducer: { user: userReducer }
        });
        const errorMessage = 'Ошибка выхода';
        const logoutSpy = jest
          .spyOn(burgerAPI, 'logoutApi')
          .mockRejectedValue(new Error(errorMessage));

        await store.dispatch(logoutUser());

        const state = store.getState().user;

        expect(state.error).toBe(errorMessage);
        expect(state.isUserLoading).toBe(false);
        expect(logoutSpy).toHaveBeenCalledTimes(1);
      });
    });
  });
});
