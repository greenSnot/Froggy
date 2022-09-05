import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import brickReducer from '../brick/brickSlice';

export const store = configureStore({
  reducer: {
    brick: brickReducer,
  },
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
