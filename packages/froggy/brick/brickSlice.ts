import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../app/store';
import { Brick } from '../types';

export interface BrickState {
  bricks: Brick[],
  toolbox: {
    categories: {[name: string]: Brick[]},
    activeCategory: string,
  },
  atomic_dropdown_menu: {[id: string]: {[name: string]: any}},
};

const initialState: BrickState = {
  bricks: [],
  toolbox: {
    categories: {},
    activeCategory: "",
  },
  atomic_dropdown_menu: {},
};

export const brickSlice = createSlice({
  name: "brick",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setActiveToolbox: (state, action: PayloadAction<string>) => {
      state.toolbox.activeCategory = action.payload;
    },
    reset: (
      state,
      action: PayloadAction<BrickState>
    ) => {
      return action.payload;
    },
    insert: (
      state,
      action: PayloadAction<{ path: string[]; source: Brick }>
    ) => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      // state.value += 1;
    },
    detach: (state, action: PayloadAction<{ path: string[] }>) => {},
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

export const { insert, detach, reset, setActiveToolbox } = brickSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.counter.value)`
export const selectBrick = (state: RootState, path: string[]) => {
  return path.reduce((m, i) => m[i], state.brick.bricks);
}

export const selectAll = (state: RootState) => {
  return state.brick;
}

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
//export const incrementIfOdd =
//  (amount: number): AppThunk =>
//  (dispatch, getState) => {
//    const currentValue = selectCount(getState());
//    if (currentValue % 2 === 1) {
//      dispatch(incrementByAmount(amount));
//    }
//  };

export default brickSlice.reducer;
