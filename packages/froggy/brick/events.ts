import { createListenerMiddleware } from "@reduxjs/toolkit";
import React, { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { AppThunk } from "../app/store";
import { Brick, BrickOutput, DragData, Offset } from "../types";
import { clone, deep_clone, distance_2d, for_each_brick, get_global_offset, get_id, is_container, to_id } from "../util";
import { BrickState, detach, move, selectAll, selectBlocksOffset, selectBricks, setBlocksOffset, setBrickOffset, setBricks } from "./brickSlice";

export interface DragState {
  bricks?: Brick[];
  bricks_offset_x?: number;
  bricks_offset_y?: number;
  brick_offset_x?: number;
  brick_offset_y?: number;
  brick_path?: string[];
  tail_relative_path?: string[];
  drag_start_global_x?: number;
  drag_start_global_y?: number;
  workspace_global_x?: number;
  workspace_global_y?: number;
  is_dragging?: boolean;
  is_removing?: boolean;
  inserting_candidates?: {path: string[], offset?: Offset}[];
}

const detach_distance = 15;
const drag_state: DragState = {};

const updateInsertingCandidates = (bricks: Brick[], path: string[]) => {
  const current: Brick = path.reduce((m, i) => m[i], bricks);
  drag_state.inserting_candidates = [];
  if (current.ui.show_hat) {
    return;
  }
  if (current.output) {
    bricks.forEach((i) =>
      for_each_brick(i, undefined, (brick) => {
        if (brick === current || brick.is_static) {
          return;
        }
        if (
          is_container(brick) &&
          (brick.output === current.output ||
            brick.output === BrickOutput.any ||
            current.output === BrickOutput.any)
        ) {
          const offset = get_global_offset(
            document.getElementById(to_id(brick.path, "workspace"))
          );

          drag_state.inserting_candidates.push({
            path: brick.path,
            offset,
          });
        }
      })
    );
    return;
  }
  bricks.forEach((i) =>
    for_each_brick(
      i,
      undefined,
      (brick) => {
        if (
          (brick.inputs || (brick.parts && brick.parts.length > 1)) &&
          brick !== current &&
          (current.is_root ? brick.path[0] !== current.path[0] : true) &&
          brick.next !== undefined
        ) {
          const ele = document.getElementById(to_id(brick.path, "workspace"));
          const offset = get_global_offset(ele);
          if (brick.path[brick.path.length - 2] == "parts") {
            offset.x += 15;
          }
          if (brick.inputs && brick.inputs.length) {
            offset.y += document.querySelector(
              `#${to_id(brick.path, "workspace")} > .inputs`
            ).clientHeight;
          } else if (brick.parts) {
            offset.y += document.querySelector(
              `#${to_id(brick.path, "workspace")} > .parts`
            ).clientHeight;
          }

          drag_state.inserting_candidates.push({
            path: brick.path,
            offset,
          });
        }
      },
      {
        inputs: false,
        parts: true,
        next: true,
      }
    )
  );
};

export function useBrickEvents(
  workspace_ref: React.RefObject<HTMLDivElement>,
  froggy_ref: React.RefObject<HTMLDivElement>,
  toolbox_bricks_ref: React.RefObject<HTMLDivElement>
) {

  const dispatch = useAppDispatch();
  const bricks = useAppSelector(selectBricks);

  useEffect(() => {
    drag_state.bricks = deep_clone(bricks);
  }, [bricks]);

  /**
   * drag_data 与 dom 同步
   * onDragMove 依赖 getGlobalOffset
   * store 无法与 drag_data 同步
   * 
   * dragstart clone(state)
   * dragmove/end 修改cloned_state dispatch setstate
   */
  const brick_on_drag_move = useCallback(
    (e) => {
      const toolbox_bricks_scroll_top = toolbox_bricks_ref.current.scrollTop;
      const x1 = e.touches ? e.touches[0].pageX : e.pageX;
      const y1 = e.touches ? e.touches[0].pageY : e.pageY;
      const x2 = drag_state.drag_start_global_x;
      const y2 = drag_state.drag_start_global_y;
      const bricks = drag_state.bricks;
      const brick: Brick = drag_state.brick_path.reduce((m, i) => m[i], bricks);
      if (!drag_state.is_dragging) {
        if (brick.ui.is_toolbox_brick) {
          drag_state.is_dragging = true;
          const global_offset = get_global_offset(
            document.getElementById(get_id(brick))
          );
          const offset: Offset = {
            x: global_offset.x + x1 - x2 - drag_state.bricks_offset_x,
            y:
              global_offset.y +
              y1 -
              y2 -
              drag_state.bricks_offset_y -
              toolbox_bricks_scroll_top,
          };
          const new_brick = clone(brick);
          new_brick.ui.offset = offset;
          drag_state.brick_offset_x = offset.x;
          drag_state.brick_offset_y = offset.y;
          drag_state.brick_path = move(bricks, { path: [], source: new_brick });
        } else if (brick.is_root) {
          drag_state.is_dragging = true;
        } else if (distance_2d(x1, y1, x2, y2) >= detach_distance) {
          drag_state.is_dragging = true;
          const global_offset = get_global_offset(
            document.getElementById(get_id(brick))
          );
          const offset: Offset = {
            x: global_offset.x + x1 - x2 - drag_state.bricks_offset_x,
            y: global_offset.y + y1 - y2 - drag_state.bricks_offset_y,
          };
          drag_state.brick_offset_x = offset.x;
          drag_state.brick_offset_y = offset.y;
          console.log('detach')
          drag_state.brick_path = detach(bricks, { path: brick.path!, offset });
        }
        updateInsertingCandidates(bricks, drag_state.brick_path);
      } else {
        const new_offset: Offset = {
          x: drag_state.brick_offset_x + x1 - x2,
          y: drag_state.brick_offset_y + y1 - y2,
        };
        setBrickOffset(bricks, {
          path: drag_state.brick_path,
          offset: new_offset,
        });
        const insert_target = drag_state.inserting_candidates.filter(
          (i) =>
            distance_2d(
              i.offset.x - drag_state.bricks_offset_x,
              i.offset.y - drag_state.bricks_offset_y,
              new_offset.x,
              new_offset.y
            ) < detach_distance
        )[0];
        // console.log(state.drag_state.inserting_candidates.map(i => ({path: [...i.path], offset: {...i.offset}})));
        if (insert_target) {
          const target = insert_target.path.reduce((m, i) => m[i], bricks);
          const new_brick = clone(brick);
          new_brick.is_root = false;
          new_brick.ui.offset = { x: 0, y: 0 };
          const new_path = move(bricks, {
            path: target.path,
            source: new_brick,
          });
          drag_state.brick_path = new_path;
          drag_state.is_dragging = false;

          // drag_state.drag_start_global_x = insert_target.offset.x - drag_state.bricks_offset_x;
          // drag_state.drag_start_global_y = insert_target.offset.y - drag_state.bricks_offset_y;

          const tail: Brick = drag_state.brick_path
            .concat(drag_state.tail_relative_path)
            .reduce((m, i) => m[i], bricks);
          for_each_brick(new_brick, tail, (b) => (b.ui.is_ghost = true));
        }
      }
      dispatch(setBricks(bricks));
    },
    [dispatch]
  );

  const toolbox_bricks_on_move = useCallback((e) => {
    drag_state.is_removing = true;
  }, []);

  const brick_on_drag_start = useCallback((data: DragData) => {
    const global_offset = get_global_offset(workspace_ref.current);
    let tail = data.brick;
    while (tail.next) tail = tail.next;
    Object.assign(drag_state, {
      drag_start_global_x: data.drag_start_global_x,
      drag_start_global_y: data.drag_start_global_y,
      is_dragging: false,
      is_removing: false,
      bricks_offset_x: parseFloat(froggy_ref.current.style.left),
      bricks_offset_y: parseFloat(froggy_ref.current.style.top),
      brick_path: [...data.brick.path],
      tail_relative_path: [...tail.path.slice(data.brick.path.length)],
      brick_offset_x: data.brick.ui.offset?.x,
      brick_offset_y: data.brick.ui.offset?.y,
      workspace_global_x: global_offset.x,
      workspace_global_y: global_offset.y,
    });
    toolbox_bricks_ref.current.addEventListener(
      "mousemove",
      toolbox_bricks_on_move
    );
    workspace_ref.current.addEventListener("mousemove", brick_on_drag_move);
    workspace_ref.current.addEventListener("mouseup", brick_on_drag_end);
  }, []);

  const brick_on_drag_end = useCallback(
    (e) => {
      const brick = drag_state.brick_path.reduce(
        (m, i) => m[i],
        drag_state.bricks
      );
      const tail: Brick = drag_state.brick_path
        .concat(drag_state.tail_relative_path)
        .reduce((m, i) => m[i], drag_state.bricks);
      for_each_brick(brick, tail, (b) => (b.ui.is_ghost = false));
      dispatch(setBricks(drag_state.bricks));
      workspace_ref.current.removeEventListener(
        "mousemove",
        brick_on_drag_move
      );
      workspace_ref.current.removeEventListener("mouseup", brick_on_drag_end);
      toolbox_bricks_ref.current.removeEventListener(
        "mousemove",
        toolbox_bricks_on_move
      );
    },
    [workspace_ref]
  );

  const brick_on_context_menu = useCallback((e: DragData) => {
    /*
    const id = active_brick_id;
    mask_data = {
      visibility: true,
      brick_id: id,
      content: (
        <ContextMenu
          blank_on_click={() => {
            mask_data.visibility = false;
          }}
          menu={{
            copy: () => {
              const brick = brick_id_to_data[id];
              const new_brick = clone(brick);
              new_brick.ui.offset = get_global_offset(
                brick_refs[id].current,
                froggy_ref.current
              );
              new_brick.ui.offset.x += 20;
              new_brick.ui.offset.y += 20;
              root_bricks.push(new_brick);
              mask_data.visibility = false;
            },
          }}
          offset={{
            x: e.mouse_global_x - global_offset.x,
            y: e.mouse_global_y - global_offset.y,
          }}
        />
      ),
    };
    */
  }, []);

  return {
    brick_on_drag_start,
    brick_on_context_menu,
  };
}