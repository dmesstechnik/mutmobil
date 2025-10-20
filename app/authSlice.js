import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  authenticated: null,
  email: '',
  userId: '',
  token: '',
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthData: (state, action) => {
      state.authenticated = action.payload.token;
      state.email = action.payload.email;
      state.userId = action.payload.userId;
      state.token = action.payload.token;
      state.textPassword = action.payload.textPassword;
    },
    clearAuthData: (state) => {
      state.authenticated = null;
      state.email = '';
      state.userId = '';
      state.token = '';
      state.textPassword = '';
    },
  },
});

export const { setAuthData, clearAuthData } = authSlice.actions;
export default authSlice.reducer;
