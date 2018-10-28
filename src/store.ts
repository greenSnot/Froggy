import { observable } from 'mobx';

import {
  get_global_offset,
} from './util';

export default class WorkspaceStore {
  id: string;
  @observable root = {
    id: 'root',
    children: [],
  };
  id_to_data = {};
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
  workspace_on_change;
  workspace_ref;
  constructor({id, root_bricks, atomic_dropdown_menu, atomic_button_fns, toolbox, workspace_on_change }) {
    this.root.children.push(...root_bricks);
    this.atomic_button_fns = atomic_button_fns;
    this.atomic_dropdown_menu = atomic_dropdown_menu;
    this.toolbox = toolbox;
  }

  brick_on_drag_start = (e, brick, element) => {
    const x = e.touches ? e.touches[0].pageX : e.pageX;
    const y = e.touches ? e.touches[0].pageY : e.pageY;
    this.active_brick = brick;
    this.active_brick_element = element;
  }
  brick_on_drag_move = (e, brick, element) => {
    if (brick.is_root) {
      brick.ui.offset = get_global_offset(element, this.workspace_ref.current);
      console.log(brick.ui);
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
