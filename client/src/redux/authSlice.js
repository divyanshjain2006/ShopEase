import { createSlice } from '@reduxjs/toolkit';

const loadFromStorage = () => {
  try {
    const stored = localStorage.getItem('shoppease_auth');
    return stored ? JSON.parse(stored) : null;
  } catch {
    return null;
  }
};

const initialState = loadFromStorage() || {
  token: null,
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth(state, action) {
      state.token = action.payload.token;
      state.user = action.payload.user;
      state.isAuthenticated = true;
      state.loading = false;
      state.error = null;
    },
    clearError(state) {
      state.error = null;
    },
    logout(state) {
      state.token = null;
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
      localStorage.removeItem('shoppease_auth');
    },
    setLoading(state, action) {
      state.loading = action.payload;
    },
    setError(state, action) {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setAuth, clearError, logout, setLoading, setError } = authSlice.actions;

export default authSlice.reducer;
