import { createListenerMiddleware } from "@reduxjs/toolkit";
import React, { useCallback, useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from "../app/hooks";
import { AppThunk } from "../app/store";
import { Brick, BrickOutput, DragData, Offset } from "../types";
import { clone, for_each_brick, get_global_offset, get_id, is_container, to_id } from "../util";
import { brickOnDragMove, brickOnDragStart, BrickState, detach, insert, selectAll, selectBlocksOffset, setBlocksOffset, setBrickOffset, toolboxBricksOnMove } from "./brickSlice";

export function useBrickEvents(
  workspace_ref: React.RefObject<HTMLDivElement>,
  froggy_ref: React.RefObject<HTMLDivElement>,
  toolbox_bricks_ref: React.RefObject<HTMLDivElement>
) {

  const dispatch = useAppDispatch();
  const brick_on_drag_move = useCallback(
    (e) => {
      const mouse_x = e.touches ? e.touches[0].pageX : e.pageX;
      const mouse_y = e.touches ? e.touches[0].pageY : e.pageY;
      dispatch(
        brickOnDragMove({
          mouse_x,
          mouse_y,
          toolbox_bricks_scroll_top: toolbox_bricks_ref.current.scrollTop,
        })
      );
    },
    [dispatch]
  );

  const toolbox_bricks_on_move = useCallback((e) => {
    dispatch(toolboxBricksOnMove());
  }, [dispatch]);

  const brick_on_drag_start = useCallback((data: DragData) => {
    const global_offset = get_global_offset(workspace_ref.current);
    dispatch(
      brickOnDragStart({
        ...data,
        is_dragging: false,
        is_removing: false,
        bricks_offset_x: parseFloat(froggy_ref.current.style.left),
        bricks_offset_y: parseFloat(froggy_ref.current.style.top),
        n_root_bricks:
          froggy_ref.current.querySelectorAll(".froggy > .wrap").length,
        brick_offset_x: data.brick.ui.offset?.x,
        brick_path: [...(data.brick.path || [])],
        brick_offset_y: data.brick.ui.offset?.y,
        workspace_global_x: global_offset.x,
        workspace_global_y: global_offset.y,
      })
    );
    toolbox_bricks_ref.current.addEventListener(
      "mousemove",
      toolbox_bricks_on_move
    );
    workspace_ref.current.addEventListener("mousemove", brick_on_drag_move);
    workspace_ref.current.addEventListener("mouseup", brick_on_drag_end);
  }, []);

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