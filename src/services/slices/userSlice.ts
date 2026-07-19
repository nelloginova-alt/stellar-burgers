import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  registerUserApi,
  loginUserApi,
  getUserApi,
  updateUserApi,
  logoutApi,
  TRegisterData,
  TLoginData
} from '@api';
import { TUser } from '@utils-types';
import { setCookie, deleteCookie } from '../../utils/cookie';

type TUserState = {
  user: TUser | null;
  isUserLoading: boolean;
  isAuthChecked: boolean;
  error: string | null;
};

const initialState: TUserState = {
  user: null,
  isUserLoading: false,
  isAuthChecked: false,
  error: null
};

export const loginUser = createAsyncThunk(
  'user/login',
  async (data: TLoginData) => {
    const responce = await loginUserApi(data);
    localStorage.setItem('refreshToken', responce.refreshToken);
    setCookie('accessToken', responce.accessToken);
    return responce.user;
  }
);

export const registerUser = createAsyncThunk(
  'user/register',
  async (data: TRegisterData) => {
    const responce = await registerUserApi(data);
    localStorage.setItem('refreshToken', responce.refreshToken);
    setCookie('accessToken', responce.accessToken);
    return responce.user;
  }
);

export const getUser = createAsyncThunk('user/getUser', async () => {
  const responce = await getUserApi();
  return responce.user;
});

export const updateUser = createAsyncThunk(
  'user/updateUser',
  async (data: Partial<TRegisterData>) => {
    const responce = await updateUserApi(data);
    return responce.user;
  }
);

export const logoutUser = createAsyncThunk('user/logout', async () => {
  await logoutApi();
  localStorage.removeItem('refreshToken');
  deleteCookie('accessToken');
  return null;
});

export const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    clearUser: (state) => {
      state.user = null;
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.isUserLoading = true;
        state.error = null;
      })
      .addCase(registerUser.pending, (state) => {
        state.isUserLoading = true;
        state.error = null;
      })
      .addCase(getUser.pending, (state) => {
        state.isUserLoading = true;
        state.error = null;
      })
      .addCase(updateUser.pending, (state) => {
        state.isUserLoading = true;
        state.error = null;
      })
      .addCase(logoutUser.pending, (state) => {
        state.isUserLoading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.isUserLoading = false;
        state.isAuthChecked = true;
        state.user = action.payload;
      })
      .addCase(registerUser.fulfilled, (state, action) => {
        state.isUserLoading = false;
        state.isAuthChecked = true;
        state.user = action.payload;
      })
      .addCase(getUser.fulfilled, (state, action) => {
        state.isUserLoading = false;
        state.isAuthChecked = true;
        state.user = action.payload;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.isUserLoading = false;
        state.user = action.payload;
      })
      .addCase(logoutUser.fulfilled, (state, action) => {
        state.isUserLoading = false;
        state.user = null;
      })

      .addCase(loginUser.rejected, (state, action) => {
        state.isUserLoading = false;
        state.error = action.error.message || 'Ошибка входа';
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.isUserLoading = false;
        state.error = action.error.message || 'Ошибка регистрации';
      })
      .addCase(getUser.rejected, (state, action) => {
        state.isUserLoading = false;
        state.error = action.error.message || 'Ошибка получения данных';
        state.isAuthChecked = true;
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.isUserLoading = false;
        state.error = action.error.message || 'Ошибка обновления данных';
      })
      .addCase(logoutUser.rejected, (state, action) => {
        state.isUserLoading = false;
        state.error = action.error.message || 'Ошибка выхода';
      });
  }
});

export const { clearUser } = userSlice.actions;
export default userSlice.reducer;
