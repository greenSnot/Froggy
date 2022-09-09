import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../app/store';
import { Brick, BrickOutput, DragData, Offset } from '../types';
import { clone_brick, deep_clone, distance_2d, for_each_brick, get_global_offset, get_id, is_container, to_id, update_path } from '../util';

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
                update_path(
                  clone_brick(j, {
                    remove_toolbox_flag: false,
                    tail_relative_path: [],
                  }),
                  [idx]
                )
              );
              return m;
            },
            {}
          ),
          activeCategory: action.payload.toolbox.activeCategory,
        },
        bricks: action.payload.bricks
          .map((i) => clone_brick(i))
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
  payload: {
    target_path: string[];
    source_path: string[];
    tail_relative_path: string[];
  }
): string[] => {
  const target = payload.target_path.reduce((m, i) => m[i], bricks);
  const brick = payload.source_path.reduce((m, i) => m[i], bricks);
  const tail = payload.source_path
    .concat(payload.tail_relative_path)
    .reduce((m, i) => m[i], bricks);
  brick.is_root = false;
  brick.ui.offset = { x: 0, y: 0 };

  const next = target.next;
  target.next = brick;
  tail.next = next;

  const source_idx = parseInt(payload.source_path[0]);
  bricks.splice(source_idx, 1);
  bricks.forEach((i, idx) => update_path(i, [idx]));
  if (parseInt(payload.target_path[0]) > source_idx) {
    return [
      (parseInt(payload.target_path[0]) - 1).toString(),
      ...payload.target_path.slice(1),
      "next",
    ];
  }

  return [...payload.target_path, "next"];
  // TODO
};

export const detach = (
  bricks: Brick[],
  payload: { path: string[]; offset: Offset; tail_relative_path: string[] }
): string[] => {
  const parent: Brick = payload.path
    .slice(0, -1)
    .reduce((m, i) => m[i], bricks);
  const brick: Brick = payload.path.reduce((m, i) => m[i], bricks);
  const tail: Brick = payload.path
    .concat(payload.tail_relative_path)
    .reduce((m, i) => m[i], bricks);
  const type = payload.path[payload.path.length - 1];
  if (payload.path[payload.path.length - 1] === "next") {
    parent.next = tail.next;
    const new_brick = clone_brick(brick, {
      remove_toolbox_flag: true,
      tail_relative_path: payload.tail_relative_path,
    });
    new_brick.ui.offset = payload.offset;
    update_path(new_brick, [bricks.length]);
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