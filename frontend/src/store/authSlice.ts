import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

let parsedUser = null;
try {
  const savedUser = localStorage.getItem('user');
  parsedUser = savedUser ? JSON.parse(savedUser) : null;
} catch (e) {
  console.error("Error parsing user from localStorage", e);
  localStorage.removeItem('user');
}

const savedToken = localStorage.getItem('accessToken');

const initialState: AuthState = {
  user: parsedUser,
  token: savedToken || null,
  isAuthenticated: !!savedToken,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    authStart: (state) => {
      state.loading = true;
      state.error = null;
    },
    authSuccess: (
      state,
      action: PayloadAction<{ user: User; accessToken: string }>
    ) => {
      state.loading = false;
      state.user = action.payload.user;
      state.token = action.payload.accessToken;
      state.isAuthenticated = true;
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      localStorage.setItem('accessToken', action.payload.accessToken);
    },
    authFailure: (state, action: PayloadAction<string>) => {
      state.loading = false;
      state.error = action.payload;
    },
    updateUserSuccess: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      localStorage.setItem('user', JSON.stringify(action.payload));
    },
    logoutSuccess: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      state.loading = false;
      localStorage.removeItem('user');
      localStorage.removeItem('accessToken');
    },
    clearError: (state) => {
      state.error = null;
    },
  },
});

export const {
  authStart,
  authSuccess,
  authFailure,
  updateUserSuccess,
  logoutSuccess,
  clearError,
} = authSlice.actions;

export default authSlice.reducer;
