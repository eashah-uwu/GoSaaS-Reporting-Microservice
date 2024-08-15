import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  token: string | null;
  userId: string | null;
}

const initialState: AuthState = {
  token: null,
  userId: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action: PayloadAction<string | null>) => {
      state.token = action.payload;
    },
    setUserId: (state, action: PayloadAction<string | null>) => {
      state.userId = action.payload;
    },
    clearToken: (state) => {
      state.token = null;
    },
    clearAuth: (state) => {
      state.token = null;
      state.userId = null;
    },
  },
});

export const { setToken, setUserId, clearToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;
