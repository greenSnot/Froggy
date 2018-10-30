import { observable } from 'mobx';

import {
  for_each_brick,
  get_global_offset,
  get_tail,
  distance_2d,
} from './util';
import { BrickOutput, AtomicBrickEnum } from './types';

const attaching_distance = 20;
export default class WorkspaceStore {
  id: string;
  @observable root = {
    id: 'root',
    children: [],
  };
  id_to_offset = {};
  id_to_data = {};
  id_to_prev = {};
  id_to_host = {};
  id_to_ref = {};
  @observable ext_root = {
    id: 'root',
    children: [],
  };
  id_to_ext_data = {};
  atomic_dropdown_menu = {};
  atomic_button_fns = {};
  @observable ui = {
    workspace_content_offset_x: 0,
    workspace_content_offset_y: 0,
    mask: {
      content: '',
      visibility: false,
    },
  }
  toolbox;
  @observable active_brick;
  active_brick_element;
  brick_is_attaching;
  workspace_on_change;
  workspace_ref;
  constructor({id, root_bricks, atomic_dropdown_menu, atomic_button_fns, toolbox, workspace_on_change }) {
    this.root.children.push(...root_bricks);
    this.atomic_button_fns = atomic_button_fns;
    this.atomic_dropdown_menu = atomic_dropdown_menu;
    this.toolbox = toolbox;
  }

  mouse_down_x;
  mouse_down_y;
  active_brick_offset;
  brick_on_drag_start = (e, brick, element) => {
    this.mouse_down_x = e.touches ? e.touches[0].pageX : e.pageX;
    this.mouse_down_y = e.touches ? e.touches[0].pageY : e.pageY;
    this.active_brick = brick;
    this.active_brick_element = element;
    console.log(brick);
    console.log(element);
    this.active_brick_offset = get_global_offset(element, this.workspace_ref.current);
    console.log(this.active_brick_offset);
  }

  last_attaching_offset = {
    x: 0,
    y: 0,
  };

  brick_attaching_tail;
  brick_on_drag_move = (e, brick, element) => {
    const x = e.touches ? e.touches[0].pageX : e.pageX;
    const y = e.touches ? e.touches[0].pageY : e.pageY;
    const new_offset = {
      x: this.active_brick_offset.x + (x - this.mouse_down_x),
      y: this.active_brick_offset.y + (y - this.mouse_down_y),
    };
    if (brick.is_root) {
      const candidates = attachable_candidates(brick, this);
      if (attach_nearest_candidate(brick, new_offset, candidates, this)) {
        this.brick_is_attaching = true;
      } else {
        brick.ui.offset = new_offset;
      }
    } else if (!this.brick_is_attaching || distance_2d(this.last_attaching_offset.x, this.last_attaching_offset.y, new_offset.x, new_offset.y) > attaching_distance) {
      if (!this.brick_is_attaching)
        this.brick_attaching_tail = get_tail(brick);
      detach_brick(brick, this, this.brick_is_attaching ? this.brick_attaching_tail : null, new_offset);
    }
  }
  workspace_on_mouse_down = (e) => {
  }
  workspace_on_mouse_move = (e) => {
    if (this.active_brick) {
      this.brick_on_drag_move(e, this.active_brick, this.active_brick_element);
    }
  }
  workspace_on_mouse_up = (e) => {
    this.active_brick = undefined;
  }
  on_context_menu(e, brick, element) {
  }
}

const attach_nearest_candidate = (brick, position, candidates, store) => {
  let nearest_candidate;
  let nearest_distance = Infinity;
  let nearest_position;
  for (let i = 0; i < candidates.length; ++i) {
    const p = store.id_to_offset[candidates[i].id];
    if (!p) continue;
    const distance = distance_2d(position.x, position.y, p.x, p.y);
    if (distance < nearest_distance) {
      nearest_candidate = candidates[i];
      nearest_distance = distance;
      nearest_position = p;
    }
  }
  if (nearest_distance > attaching_distance) {
    return false;
  }
  
  if (nearest_candidate.output) {
    if (nearest_candidate.inputs.length) {
      detach_brick(nearest_candidate, store, undefined, {
        x: nearest_position.x + 20,
        y: nearest_position.y + 20,
      });
    }
    brick.is_root = false;
    nearest_candidate.inputs.push(brick);
    store.root.children.splice(store.root.children.indexOf(brick), 1);
    return true;
  } else {
    // TODO
    const prev = store.id_to_prev[nearest_candidate.id];
    const next = nearest_candidate.next;
    if (!prev) return false;

    brick.is_root = false;
    prev.next = brick;
    if (next) {
      store.brick_attaching_tail.next = next;
    }
  }
  store.last_attaching_offset = nearest_position;
};

const attachable_candidates = (brick, store: WorkspaceStore) => {
  const candidates = [];
  const output = brick.output;
  store.root.children.forEach(i => for_each_brick(i, undefined, (j) => {
    if (j === brick) return;
    if (!output && !AtomicBrickEnum[j.type]) {
      candidates.push(j);
    } else if (output === BrickOutput.any || j.output === BrickOutput.any || j.output === brick.output) {
      candidates.push(j);
    }
  }));
  return candidates;
};

const detach_brick = (brick, store, tail = undefined, offset = {
  x: 0,
  y: 0,
}) => {
  if (!brick.output) {
    const prev = store.id_to_prev[brick.id];
    if (prev) prev.next = null;
    if (tail) {
      const tail_next = tail.next;
      if (tail_next) {
        tail_next.prev = prev.id;
        prev.next = tail_next;
      }
      tail.next = null;
    }
  } else {
    const container = store.id_to_host[brick.id];
    container.inputs = [];
    store.id_to_host[brick.id] = null;
  }
  brick.is_root = true;
  brick.root = undefined;
  for_each_brick(brick, undefined, i => {
    i.root = brick.id;
    i.ui.is_ghost = false;
  });
  store.root.children.push(brick);
  brick.ui.offset = offset;
  return brick;
}