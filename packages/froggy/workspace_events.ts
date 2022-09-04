import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Offset } from "./types";
import { get_global_offset } from './util';

export function useWorkspaceEvents({
    initial_blocks_offset
}:{
    initial_blocks_offset: Offset,
}) {
  const workspace_ref = useRef<HTMLDivElement>();

  const workspace_drag_start_data_ref = useRef<{
    workspace_global_x: number;
    workspace_global_y: number;
    mouse_global_x: number;
    mouse_global_y: number;
  }>({
    workspace_global_x: 0,
    workspace_global_y: 0,
    mouse_global_x: 0,
    mouse_global_y: 0,
  });

  const [blocks_offset, set_blocks_offset] = useState<Offset>(initial_blocks_offset);
  const workspace_on_drag = useCallback((e) => {
    const workspace_data = workspace_drag_start_data_ref.current;
    const new_offset: Offset = {
      x: Math.round(
        workspace_data.workspace_global_x +
          e.pageX -
          workspace_data.mouse_global_x
      ),
      y: Math.round(
        workspace_data.workspace_global_y +
          e.pageY -
          workspace_data.mouse_global_y
      ),
    };
    set_blocks_offset(new_offset);
  }, []);

  const workspace_on_mouse_down = useCallback((e) => {
    const global_offset = get_global_offset(workspace_ref.current);
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
    e.preventDefault();
    set_blocks_offset({
        x: blocks_offset.x - e.deltaX,
        y: blocks_offset.y - e.deltaY,
    })
  }, []);

  useEffect(() => {
    workspace_ref.current.addEventListener('mousedown', workspace_on_drag);
    workspace_ref.current.addEventListener('wheel', workspace_on_wheel);
  }, []);

  return {
    workspace_ref,
    blocks_offset,
  }
}