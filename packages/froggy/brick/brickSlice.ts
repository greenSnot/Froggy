import { createAsyncThunk, createListenerMiddleware, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RootState, AppThunk } from '../app/store';
import { Brick, BrickOutput, DragData, Offset } from '../types';
import { clone, distance_2d, for_each_brick, get_global_offset, get_id, is_container, to_id, update_path } from '../util';

export interface DragState {
  brick?: Brick;
  bricks_offset_x?: number;
  bricks_offset_y?: number;
  brick_offset_x?: number;
  brick_offset_y?: number;
  n_root_bricks?: number;
  brick_path?: string[];
  mouse_global_x?: number;
  mouse_global_y?: number;
  workspace_global_x?: number;
  workspace_global_y?: number;
  is_dragging?: boolean;
  is_removing?: boolean;
  inserting_candidates?: {path: string[], offset?: Offset}[];
}

export interface BrickState {
  blocks_offset: Offset,
  bricks: Brick[],
  toolbox: {
    categories: {[name: string]: Brick[]},
    activeCategory: string,
  },
  atomic_dropdown_menu: {[id: string]: {[name: string]: any}},
  drag_state: DragState;
};

const initialState: BrickState = {
  bricks: [],
  drag_state: {},
  blocks_offset: { x: 0, y: 0 },
  toolbox: {
    categories: {},
    activeCategory: "",
  },
  atomic_dropdown_menu: {},
};

const updateInsertingCandidates = (state: BrickState, path: string[]) => {
  const current: Brick = path.reduce((m, i) => m[i], state.bricks);
  const drag_state = state.drag_state;
    drag_state.inserting_candidates = [];
  if (current.ui.show_hat) {
  } else if (current.output) {
    state.bricks.forEach((i) =>
      for_each_brick(i, undefined, (brick) => {
        if (brick === current || is_container(brick) || brick.is_static) {
          return;
        }
        if (
          brick.output === current.output ||
          brick.output === BrickOutput.any ||
          current.output === BrickOutput.any
        ) {
          drag_state.inserting_candidates.push(brick.path);
        }
      })
    );
  } else {
    state.bricks.forEach((i) =>
      for_each_brick(i, undefined, (brick) => {
        if (
          brick !== current &&
          (brick.inputs || (brick.parts && brick.parts.length > 1)) &&
          brick.next !== undefined // ?
        ) {
          drag_state.inserting_candidates.push({
            path: brick.path,
          });
        }
      })
    );
  }
  drag_state.inserting_candidates.forEach(
    (i) =>
      (i.offset = get_global_offset(
        document.getElementById(to_id(i.path, "workspace"))
      ))
  );
};

export const brickSlice = createSlice({
  name: "brick",
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setActiveToolbox: (state, action: PayloadAction<string>) => {
      state.toolbox.activeCategory = action.payload;
    },
    brickOnDragStart: (state, action: PayloadAction<DragState>) => {
      state.drag_state = action.payload;
    },
    toolboxBricksOnMove: (state, action: PayloadAction) => {
      state.drag_state.is_removing = true;
    },
    brickOnDragEnd: (state, action: PayloadAction) => {},
    brickOnDragMove: (
      state,
      action: PayloadAction<{
        mouse_x: number;
        mouse_y: number;
        toolbox_bricks_scroll_top: number;
      }>
    ) => {
      const { mouse_x, mouse_y, toolbox_bricks_scroll_top } = action.payload;
      const data = state.drag_state;
      const x1 = mouse_x;
      const y1 = mouse_y;
      const x2 = data.mouse_global_x;
      const y2 = data.mouse_global_y;
      const brick: Brick = data.brick;
      if (!data.is_dragging) {
        if (brick.ui.is_toolbox_brick) {
          data.is_dragging = true;
          const global_offset = get_global_offset(
            document.getElementById(get_id(brick))
          );
          const offset: Offset = {
            x: global_offset.x + x1 - x2 - data.bricks_offset_x,
            y:
              global_offset.y +
              y1 -
              y2 -
              data.bricks_offset_y -
              toolbox_bricks_scroll_top,
          };
          const new_brick = clone(brick);
          new_brick.ui.offset = offset;
          data.brick_offset_x = offset.x;
          data.brick_offset_y = offset.y;
          data.brick_path = [data.n_root_bricks.toString()];
          data.n_root_bricks++;
          insert(state, { path: [], source: new_brick });
        } else if (brick.is_root) {
          data.is_dragging = true;
        } else if (distance_2d(x1, y1, x2, y2) >= 10) {
          data.is_dragging = true;
          const global_offset = get_global_offset(
            document.getElementById(get_id(brick))
          );
          const offset: Offset = {
            x: global_offset.x + x1 - x2 - data.bricks_offset_x,
            y: global_offset.y + y1 - y2 - data.bricks_offset_y,
          };
          data.brick_offset_x = offset.x;
          data.brick_offset_y = offset.y;
          data.brick_path = [data.n_root_bricks.toString()];
          data.n_root_bricks++;
          detach(state, { path: brick.path!, offset });
        }
        updateInsertingCandidates(state, data.brick_path);
      } else {
        const new_offset: Offset = {
          x: data.brick_offset_x + x1 - x2,
          y: data.brick_offset_y + y1 - y2,
        };
        setBrickOffset(state, {
          path: data.brick_path,
          offset: new_offset,
        });
        const insert_target = state.drag_state.inserting_candidates.filter(
          (i) => distance_2d(i.offset.x, i.offset.y, x1, y1) < 10
        )[0];
        if (insert_target) {
          const target = insert_target.path.reduce((m, i) => m[i], state.bricks);
          console.log(target);
        }
      }
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
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  extraReducers: (builder) => {},
});

export const {
  setBlocksOffset,
  changeBlocksOffsetBy,
  reset,
  brickOnDragMove,
  toolboxBricksOnMove,
  brickOnDragStart,
  brickOnDragEnd,
  setActiveToolbox,
} = brickSlice.actions;

export const selectBlocksOffset = (state: RootState) => {
  return state.brick.blocks_offset;
}

export const setBrickOffset = (
  state: BrickState,
  payload: { path: string[]; offset: Offset }
) => {
  const brick: Brick = payload.path.reduce((m, i) => m[i], state.bricks);
  brick.ui.offset = payload.offset;
};

export const insert = (
  state: BrickState,
  payload: { path: string[]; source: Brick }
) => {
  const brick = payload.source;
  const parent: Brick = payload.path
    .slice(0, -1)
    .reduce((m, i) => m[i], state.bricks);
  if (!payload.path.length) {
    state.bricks.push(brick);
  } else {
    const t = parent.next;
    parent.next = brick;
    brick.next = t;
  }
};

export const detach = (
  state: BrickState,
  payload: { path: string[]; offset: Offset },
) => {
  const parent: Brick = payload.path
    .slice(0, -1)
    .reduce((m, i) => m[i], state.bricks);
  const brick: Brick = payload.path.reduce(
    (m, i) => m[i],
    state.bricks
  );
  const type = payload.path[payload.path.length - 1];
  if (type === "next") {
    parent.next = null;
    const new_brick = update_path(clone(brick), [state.bricks.length]);
    new_brick.ui.offset = payload.offset;
    state.bricks.push(new_brick);
  } else {
    // TODO
  }
};

export const selectAll = (state: RootState) => {
  return state.brick;
}

export default brickSlice.reducer;
