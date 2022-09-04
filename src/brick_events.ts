import React, { useCallback, useRef } from "react";
import { BrickDragEvent } from "./types";

export function useDragEvents(workspace_ref: React.RefObject<HTMLDivElement>) {
  const brick_is_dragging_ref = useRef(false);
  const active_brick_id_ref = useRef('');

  const brick_drag_start_data_ref = useRef<
    BrickDragEvent & {
      local_offset?: {
        x: number;
        y: number;
      };
    }
  >();

  const brick_on_drag_start = useCallback((e: BrickDragEvent) => {
    active_brick_id_ref.current = e.id;
    brick_drag_start_data_ref.current = e;
    let id = e.id;
    /*
    if (brick_id_to_data[e.id].is_static) {
      id = get_ancestor(brick_id_to_data, brick_id_to_data[e.id]).id;
      active_brick_id = id;
      brick_drag_start_data.id = id;
    }
    brick_drag_start_data.local_offset = get_global_offset(
      brick_refs[id].current,
      froggy_ref.current
    );
    const data = brick_id_to_data[id];
    if (data.ui.is_toolbox_brick) {
      if (data.root) {
        brick_drag_start_data.id = data.root;
        brick_drag_start_data.local_offset = get_global_offset(
          brick_refs[data.root].current,
          froggy_ref.current
        );
      }
      brick_drag_start_data.local_offset.x -=
        toolbox_bricks_ref.current.scrollLeft;
      brick_drag_start_data.local_offset.y -=
        toolbox_bricks_ref.current.scrollTop;
    }
    */
  }, []);
  const brick_on_click = useCallback((e) => {
    active_brick_id_ref.current = undefined;
  }, []);
  const brick_on_first_drag = useCallback((e) => {
    /*
    const drag_data = brick_drag_start_data;
    const id = drag_data.id;
    let brick_data = brick_id_to_data[id];
    if (brick_data.ui.is_toolbox_brick) {
      const b = clone(brick_data);
      b.ui.is_toolbox_brick = false;
      b.ui.offset.x = drag_data.local_offset.x;
      b.ui.offset.y = drag_data.local_offset.y;
      brick_drag_start_data.id = b.id;
      root_bricks.push(b);
      brick_id_to_data[b.id] = b;
      active_brick_id = b.id;
      brick_data = brick_id_to_data[b.id];
    } else if (!brick_data.is_root) {
      const parent = brick_id_to_data[brick_data.ui.parent];
      const needs_detach =
        !brick_data.is_static ||
        !(parent && is_container(parent) && parent.is_static);
      if (needs_detach) {
        detach_brick(id, undefined, {
          x: drag_data.local_offset.x,
          y: drag_data.local_offset.y,
        });
      }
      if (parent && is_container(parent) && parent.ui.copier) {
        const new_brick = clone(brick_data);
        new_brick.ui.parent = parent.id;
        new_brick.is_root = false;
        new_brick.root = parent.root;
        parent.inputs.push(new_brick);
      }
    }
    update_inserting_candidates(brick_data);

    const tail = get_tail(brick_data);
    active_brick_tail_id = tail.id;
    */
  }, []);

  const on_mouse_move_middleware = useCallback((e) => {
    /*
    const event = {
      pageX: e.touches ? e.touches[0].pageX : e.pageX,
      pageY: e.touches ? e.touches[0].pageY : e.pageY,
    };
    if (workspace_is_mouse_down && !active_brick_id) {
      workspace_on_drag(event);
      return;
    }
    if (!active_brick_id) {
      return;
    }
    brick_on_drag(event);
    */
  }, []);
  const on_mouse_up_middleware = useCallback((event) => {
    /*
    if (brick_is_dragging) {
      brick_on_drag_end(event);
    } else {
      brick_on_click(event);
    }
    workspace_on_drag_end(event);
    */
  }, []);
  const on_mouse_down_middleware = useCallback((e) => {
    /*
    const event = {
      pageX: e.touches ? e.touches[0].pageX : e.pageX,
      pageY: e.touches ? e.touches[0].pageY : e.pageY,
    };
    workspace_on_drag_start(event);
    */
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
  const brick_on_drag_end = useCallback((e) => {
    /*
    if (active_brick_needs_removing) {
      remove_root_brick(brick_id_to_data[active_brick_id]);
      active_brick_needs_removing = false;
    }
    if (brick_is_inserting) {
      const active_brick = brick_id_to_data[active_brick_id];
      const active_brick_tail = brick_id_to_data[active_brick_tail_id];
      for_each_brick(
        active_brick,
        active_brick_tail,
        (i) => (i.ui.is_ghost = false)
      );
    }
    active_brick_id = undefined;
    brick_is_dragging = false;
    clear_inserting_candidates();
    update(() => root_bricks_on_change());
    */
  }, []);
}

export function useContextMenu() {
  /*
  const brick_on_context_menu = (e: BrickDragEvent) => {
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
  };
    */


}