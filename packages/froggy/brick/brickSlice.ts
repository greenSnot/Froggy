import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../app/store';
import { Brick, BrickOutput, DragData, Offset } from '../types';
import { clone, deep_clone, distance_2d, for_each_brick, get_global_offset, get_id, is_container, to_id, update_path } from '../util';

export interface BrickState {
  blocks_offset: Offset,
  bricks: Brick[],
  toolbox: {
    categories: {[name: string]: Brick[]},
    activeCategory: string,
  },
  atomic_dropdown_menu: {[id: string]: {[name: string]: any}},
};

const initialState: BrickState = {
  bricks: [],
  blocks_offset: { x: 0, y: 0 },
  toolbox: {
    categories: {},
    activeCategory: "",
  },
  atomic_dropdown_menu: {},
};

export const brickSlice = createSlice({
  name: "brick",
  initialState,
  reducers: {
    setActiveToolbox: (state, action: PayloadAction<string>) => {
      state.toolbox.activeCategory = action.payload;
    },
    setBricks: (state, action: PayloadAction<Brick[]>) => {
      state.bricks = action.payload;
    },
    reset: (state, action: PayloadAction<BrickState>) => {
      return {
        ...action.payload,
        toolbox: {
          categories: Object.keys(action.payload.toolbox.categories).reduce(
            (m, i) => {
              m[i] = action.payload.toolbox.categories[i].map((j, idx) =>
                update_path(clone(j, true, false), [idx])
              );
              return m;
            },
            {}
          ),
          activeCategory: action.payload.toolbox.activeCategory,
        },
        bricks: action.payload.bricks
          .map((i) => clone(i))
          .map((i, idx) => update_path(i, [idx])),
      };
    },
    setBlocksOffset: (state, action: PayloadAction<Offset>) => {
      state.blocks_offset = action.payload;
    },
    changeBlocksOffsetBy: (state, action: PayloadAction<Offset>) => {
      state.blocks_offset.x += action.payload.x;
      state.blocks_offset.y += action.payload.y;
    },
  },
  extraReducers: (builder) => {
  },
});

export const {
  setBlocksOffset,
  changeBlocksOffsetBy,
  reset,
  setActiveToolbox,
  setBricks,
} = brickSlice.actions;

export const selectBlocksOffset = (state: RootState) => {
  return state.brick.blocks_offset;
}

export const setBrickOffset = (
  bricks: Brick[],
  payload: { path: string[]; offset: Offset }
) => {
  const brick: Brick = payload.path.reduce((m, i) => m[i], bricks);
  brick.ui.offset = payload.offset;
};

export const move = (
  bricks: Brick[],
  payload: { path: string[]; source: Brick; }
): string[] => {
  const brick = payload.source;
  if (!payload.path.length) {
    bricks.push(brick);
    return [(bricks.length - 1).toString()];
  } else {
    const parent: Brick = payload.path.reduce((m, i) => m[i], bricks);
    const t = parent.next;
    parent.next = brick;
    let tail = brick;
    while (tail.next) tail = tail.next;
    tail.next = t;

    const source_idx = parseInt(payload.source.path[0]);
    bricks.splice(source_idx, 1);
    bricks.forEach((i, idx) => update_path(i, [idx]));
    if (parseInt(payload.path[0]) > source_idx) {
      return [
        (parseInt(payload.path[0]) - 1).toString(),
        ...payload.path.slice(1),
        "next",
      ];
    }

    return [...payload.path, "next"];
  }
  // TODO
};

export const detach = (
  bricks: Brick[],
  payload: { path: string[]; offset: Offset },
): string[] => {
  const parent: Brick = payload.path
    .slice(0, -1)
    .reduce((m, i) => m[i], bricks);
  const brick: Brick = payload.path.reduce(
    (m, i) => m[i],
    bricks
  );
  const type = payload.path[payload.path.length - 1];
  if (type === "next") {
    parent.next = null;
    const new_brick = update_path(clone(brick), [bricks.length]);
    new_brick.ui.offset = payload.offset;
    bricks.push(new_brick);
  } else {
    // TODO
  }
  return [(bricks.length - 1).toString()];
};

export const selectAll = (state: RootState) => {
  return state.brick;
}

export const selectBricks = (state: RootState) => {
  return state.brick.bricks;
}

export default brickSlice.reducer;