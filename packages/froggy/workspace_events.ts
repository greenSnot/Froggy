import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useAppDispatch, useAppSelector } from './app/hooks';
import { changeBlocksOffsetBy, selectBlocksOffset, setBlocksOffset } from './brick/brickSlice';
import { Offset } from "./types";
import { get_global_offset } from './util';

export function useWorkspaceEvents() {
  const workspace_ref = useRef<HTMLDivElement>();
  const froggy_ref = useRef<HTMLDivElement>();

  const workspace_drag_start_data_ref = useRef<{
    workspace_global_x: number;
    workspace_global_y: number;
    mouse_global_x: number;
    mouse_global_y: number;
    blocks_offset_x: number;
    blocks_offset_y: number;
  }>({
    workspace_global_x: 0,
    workspace_global_y: 0,
    mouse_global_x: 0,
    mouse_global_y: 0,
    blocks_offset_x: 0,
    blocks_offset_y: 0,
  });

  const dispatch = useAppDispatch();
  const blocks_offset = useAppSelector(selectBlocksOffset);
  const workspace_on_drag = useCallback((e) => {
    const workspace_data = workspace_drag_start_data_ref.current;
    const new_offset: Offset = {
      x: Math.round(
        workspace_data.blocks_offset_x +
          workspace_data.workspace_global_x +
          e.pageX -
          workspace_data.mouse_global_x
      ),
      y: Math.round(
        workspace_data.blocks_offset_y +
          workspace_data.workspace_global_y +
          e.pageY -
          workspace_data.mouse_global_y
      ),
    };
    dispatch(setBlocksOffset(new_offset));
  }, [dispatch]);

  const workspace_on_mouse_down = useCallback((e) => {
    console.log('w d')
    const global_offset = get_global_offset(workspace_ref.current);
    const x = parseFloat(froggy_ref.current.style.left) || 0;
    const y = parseFloat(froggy_ref.current.style.top) || 0;
    workspace_drag_start_data_ref.current.blocks_offset_x = x;
    workspace_drag_start_data_ref.current.blocks_offset_y = y;
    workspace_drag_start_data_ref.current.mouse_global_x = e.pageX;
    workspace_drag_start_data_ref.current.mouse_global_y = e.pageY;
    workspace_drag_start_data_ref.current.workspace_global_x = global_offset.x;
    workspace_drag_start_data_ref.current.workspace_global_y = global_offset.y;
    workspace_ref.current.addEventListener('mousemove', workspace_on_drag);
    workspace_ref.current.addEventListener('mouseup', workspace_on_drag_end);
  }, []);

  const workspace_on_drag_end = useCallback((e) => {
    workspace_ref.current.removeEventListener('mousemove', workspace_on_drag);
    workspace_ref.current.removeEventListener('mousemove', workspace_on_drag_end);
  }, []);

  const workspace_on_wheel = useCallback((e) => {
    dispatch(changeBlocksOffsetBy({
      x: - e.deltaX,
      y: - e.deltaY,
    }));
  }, [dispatch]);

  return {
    workspace_on_mouse_down,
    workspace_on_wheel,
    workspace_ref,
    froggy_ref,
    blocks_offset,
  };
}