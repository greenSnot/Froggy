import { createListenerMiddleware } from "@reduxjs/toolkit";
import React, { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { DragData } from "../types";
import { clone, get_global_offset } from "../util";
import { detach, insert, selectBlocksOffset, setBlocksOffset, setBrickOffset } from "./brickSlice";

export function useBrickEvents(
  workspace_ref: React.RefObject<HTMLDivElement>,
  froggy_ref: React.RefObject<HTMLDivElement>,
  toolbox_bricks_ref: React.RefObject<HTMLDivElement>
) {
  const is_dragging_ref = useRef(false);
  const is_removing = useRef(false);

  const brick_drag_start_data_ref = useRef<
    DragData & {
      bricks_offset_x: number;
      bricks_offset_y: number;
      brick_offset_x: number;
      brick_offset_y: number;
      n_root_bricks: number;
      brick_path: string[];
      workspace_global_x: number;
      workspace_global_y: number;
    }
  >();

  const dispatch = useAppDispatch();

  const brick_on_drag_move = useCallback(
    async (e) => {
      const data = brick_drag_start_data_ref.current;
      const x1 = e.touches ? e.touches[0].pageX : e.pageX;
      const y1 = e.touches ? e.touches[0].pageY : e.pageY;
      const x2 = data.mouse_global_x;
      const y2 = data.mouse_global_y;
      const brick = data.brick;
      if (!is_dragging_ref.current) {
        if (brick.ui.is_toolbox_brick) {
          is_dragging_ref.current = true;
          data.brick_offset_x = data.bricks_offset_x + x1;
          data.brick_offset_y = data.bricks_offset_y + y1;
          data.brick_path = [data.n_root_bricks.toString()];
          data.n_root_bricks++;
          const new_brick = clone(brick);
          dispatch(insert({ path: [], source: new_brick }));
        } else if (brick.is_root) {
          is_dragging_ref.current = true;
        } else if ((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2) >= 10 * 10) {
          is_dragging_ref.current = true;
          data.brick_path = [data.n_root_bricks.toString()];
          data.n_root_bricks++;
          dispatch(detach({ path: brick.path! }));
        }
      } else {
        dispatch(
          setBrickOffset({
            path: data.brick_path,
            offset: {
              x: data.brick_offset_x + x1 - x2,
              y: data.brick_offset_y + y1 - y2,
            },
          })
        );
      }
    },
    [dispatch]
  );

  const toolbox_bricks_on_move = useCallback((e) => {
    is_removing.current = true;
  }, []);

  const brick_on_drag_start = useCallback((data: DragData) => {
    is_dragging_ref.current = false;
    is_removing.current = false;
    const global_offset = get_global_offset(workspace_ref.current);
    brick_drag_start_data_ref.current = {
      ...data,
      bricks_offset_x: parseFloat(froggy_ref.current.style.left),
      bricks_offset_y: parseFloat(froggy_ref.current.style.top),
      n_root_bricks:
        froggy_ref.current.querySelectorAll(".froggy > .wrap").length,
      brick_offset_x: data.brick.ui.offset?.x,
      brick_path: [...(data.brick.path || [])],
      brick_offset_y: data.brick.ui.offset?.y,
      workspace_global_x: global_offset.x,
      workspace_global_y: global_offset.y,
    };
    toolbox_bricks_ref.current.addEventListener(
      "mousemove",
      toolbox_bricks_on_move
    );
    workspace_ref.current.addEventListener("mousemove", brick_on_drag_move);
    workspace_ref.current.addEventListener("mouseup", brick_on_drag_end);
  }, []);

  const brick_on_drag = (e) => {
    /*
    const drag_data = brick_drag_start_data;
    const id = drag_data.id;
    const brick_data = brick_id_to_data[id];
    if (!brick_is_dragging) {
      brick_is_dragging = true;
      brick_on_first_drag(e);
      return;
    }

    const offset = {
      x: drag_data.local_offset.x + e.pageX - drag_data.mouse_global_x,
      y: drag_data.local_offset.y + e.pageY - drag_data.mouse_global_y,
    };
    let workspace_needs_update = false;
    let needs_update_size = false;
    const active_brick_needs_removing =
      offset.x < -froggy_offset.x + toolbox_ref.current.clientWidth;
    if (active_brick_needs_removing != active_brick_needs_removing) {
      active_brick_needs_removing = active_brick_needs_removing;
      brick_id_to_data[id].ui.is_removing = active_brick_needs_removing;
    }
    const closest = inserting_candidates.reduce(
      (m, i) => {
        const current = brick_id_to_data[i];
        const parent = brick_id_to_data[current.ui.parent];
        const x1 = offset.x;
        const y1 = offset.y;
        const x2 =
          inserting_candidates_local_offset[i].x +
          (parent && parent.parts ? 15 : 0);
        const y2 =
          inserting_candidates_local_offset[i].y +
          (brick_data.output ? 0 : brick_id_to_size[i].h);
        const distance = distance_2d(x1, y1, x2, y2);
        if (distance < m.distance) {
          m.distance = distance;
          m.closest_brick_id = i;
        }
        return m;
      },
      {
        distance: Infinity,
        closest_brick_id: null,
      }
    );
    if (closest.distance < 15 && !active_brick_needs_removing) {
      if (!brick_is_inserting) {
        brick_is_inserting = true;

        const closest_brick = brick_id_to_data[closest.closest_brick_id];
        const tail = brick_id_to_data[active_brick_tail_id];
        if (brick_data.output) {
          if (closest_brick.inputs[0]) {
            detach_brick(closest_brick.inputs[0].id, undefined, {
              x: offset.x + 20,
              y: offset.y + 20,
            });
            needs_update_size = true;
          }
          closest_brick.inputs = [brick_data];
          brick_data.ui.parent = closest_brick.id;
        } else {
          tail.next = closest_brick.next;
          if (closest_brick.next) {
            closest_brick.next.prev = tail.id;
          }
          closest_brick.next = brick_data;
          brick_data.prev = closest_brick.id;
        }

        const root_id = closest_brick.root || closest_brick.id;
        for_each_brick(brick_data, tail, (i) => {
          i.ui.is_ghost = true;
          i.root = root_id;
        });
        brick_data.is_root = false;

        remove_root_brick(brick_data, false);
        brick_data.ui.offset.x = 0;
        brick_data.ui.offset.y = 0;

        workspace_needs_update = true;
      }
    } else {
      if (brick_is_inserting) {
        brick_is_inserting = false;
        if (!brick_data.is_root) {
          detach_brick(id, active_brick_tail_id);
        }
        workspace_needs_update = true;
      }
    }

    if (!brick_is_inserting) {
      let target = brick_data;
      if (brick_data.is_static) {
        target = get_ancestor(brick_id_to_data, brick_data);
      }
      target.ui.offset.x = offset.x;
      target.ui.offset.y = offset.y;
      if (target !== root_bricks[root_bricks.length - 1]) {
        remove_root_brick(target, false);
        root_bricks.push(target);
        workspace_needs_update = true;
      } else {
        brick_id_to_component[target.id].forceUpdate();
      }
    }

    if (workspace_needs_update) {
      update(() => {
        if (!needs_update_size) {
          return;
        }
        inserting_candidates.forEach((i) => {
          inserting_candidates_local_offset[i] = get_global_offset(
            this.brick_refs[i].current,
            this.froggy_ref.current
          );
        });
      });
    }
    // TODO
    */
  };
  const brick_on_drag_end = useCallback(
    (e) => {
      console.log("drag end");
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