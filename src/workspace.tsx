import React, { ReactElement } from 'react';

import { DragEvent, MouseEvent, TouchEvent } from 'react';

import styles from './styles/index.less';

import BrickComponent, {
  Brick,
} from './brick';
import {
  deduplicate,
  distance_2d,
  flatten,
  gen_id,
  get_global_offset,
} from './util';

import {
  clone,
  for_each_brick,
  get_ancestor,
  get_tail,
  AtomicBrickEnum,
  BrickDragEvent,
  BrickOutput,
} from './brick';

import ContextMenu from './dummy/context_menu';
import Input from './dummy/input';
import Select from './dummy/select';

const is_container = (brick) => brick.type === 'container';
const is_procedure_def = (brick) => brick.type === 'procedure_def';
const is_procedure = (brick) => brick.type === 'procedure';
const is_procedure_with_output = (brick) => brick.type === 'procedure_with_output';
const is_procedure_return = (brick) => brick.type === 'procedure_return';
type Props = {
  id: string,
  root_bricks: Brick[],
  toolbox: {
    categories: {[name: string]: Brick[]},
    activeCategory: string,
  },
  atomic_button_fns: {[name: string]: Function},
  atomic_dropdown_menu: {[id: string]: {[name: string]: any}},
  workspace_on_change?: Function,
};
type State = {
};

function global_to_local(x, y, workspace: Workspace) {
  return {
    x: x - workspace.global_offset.x - workspace.froggy_offset.x,
    y: y - workspace.global_offset.y - workspace.froggy_offset.y,
  };
}

export default class Workspace extends React.Component<Props, State> {
  active_brick_needs_removing = false;
  toolbox_ref;
  toolbox_bricks_ref;
  mask_ref;
  froggy_ref;
  froggy_wrap_ref;

  mask_data = {
    brick_id: undefined,
    visibility: false,
    content: null,
  };

  toolbox;

  ghost_bricks = {};
  brick_refs = {};
  brick_inputs_refs = {};
  brick_parts_refs = {};

  global_offset;
  froggy_offset = {
    x: 0,
    y: 0,
  };
  brick_id_to_size = {};

  inserting_candidates = [];
  inserting_candidates_local_offset = {};
  active_brick_tail_id;

  brick_drag_start_data: BrickDragEvent & {
    local_offset?: {
      x: number,
      y: number,
    },
  };
  workspace_drag_start_data = {
    workspace_global_x: 0,
    workspace_global_y: 0,
    mouse_global_x: 0,
    mouse_global_y: 0,
  };
  active_brick_id;
  brick_is_dragging = false;
  brick_is_inserting = false;
  workspace_is_mouse_down = false;
  root_bricks = [];
  brick_id_to_data: {[id: string]: Brick} = {};
  constructor(props) {
    super(props);
    this.froggy_ref = React.createRef();
    this.toolbox_ref = React.createRef();
    this.toolbox_bricks_ref = React.createRef();
    this.froggy_wrap_ref = React.createRef();
    this.mask_ref = React.createRef();
  }
  componentDidMount() {
    this.global_offset = get_global_offset(this.froggy_wrap_ref.current);
    this.froggy_wrap_ref.current.addEventListener('touchmove', (e) => {
      if (e.target.className !== styles.toolboxBricks) {
        e.preventDefault();
      }
    });
  }
  componentWillMount() {
    this.root_bricks = this.props.root_bricks;
    this.toolbox = this.props.toolbox;
    this.update_toolbox_procedure();
    this.update();
  }
  update = this.forceUpdate;

  clear_inserting_candidates() {
    this.inserting_candidates = [];
  }

  update_toolbox_procedure() {
    const procedures = {};
    const procedures_with_output = {};
    this.root_bricks.filter(i => is_procedure_def(i)).forEach(i => {
      const procedure_name = i.inputs[1].inputs[0].ui.value;
      procedures[procedure_name] = [];
      for_each_brick(
        i,
        undefined,
        (j) => {
          if ((AtomicBrickEnum[j.type] as any) === AtomicBrickEnum.atomic_param) {
            const param_name = j.ui.value;
            procedures[procedure_name].push(param_name);
          } else if (is_procedure_return(j)) {
            procedures_with_output[procedure_name] = true;
          }
        },
      );
      procedures[procedure_name] = deduplicate(procedures[procedure_name]).filter(j => j);
    });
    this.toolbox.categories.procedure.splice(2);
    Object.keys(procedures).forEach(i => {
      const id = `procedure∫${i}`;
      this.toolbox.categories.procedure.push({
        id,
        type: 'procedure',
        next: null,
        is_root: true,
        inputs: [{
          id: `procedure_text∫${i}`,
          type: 'atomic_text',
          root: id,
          ui: {
            parent: id,
            value: i,
            is_toolbox_brick: true,
          },
        }, ...flatten(procedures[i].map(j => ([{
          id: `procedure∫${i}∫${j}`,
          type: 'atomic_text',
          root: id,
          ui: {
            parent: id,
            value: ` ${j}:`,
            is_toolbox_brick: true,
          },
        }, {
          id: `procedure∫${i}∫${j}∫container`,
          type: 'container',
          output: BrickOutput.any,
          root: id,
          inputs: [],
          ui: {
            parent: id,
            is_toolbox_brick: true,
          },
        }])))],
        ui: {
          is_toolbox_brick: true,
          offset: {
            x: 0,
            y: 20,
          },
        },
      });
      if (procedures_with_output[i]) {
        const id_with_output = `procedure_with_output∫{i}`;
        this.toolbox.categories.procedure.push({
          id: id_with_output,
          type: 'procedure_with_output',
          output: BrickOutput.any,
          is_root: true,
          inputs: [{
            id: `procedure_with_output_text∫${i}`,
            type: 'atomic_text',
            root: id_with_output,
            ui: {
              parent: id_with_output,
              value: i,
              is_toolbox_brick: true,
            },
          }, ...flatten(procedures[i].map(j => ([{
              id: `procedure_with_output∫${i}∫${j}`,
              type: 'atomic_text',
              root: id,
              ui: {
                parent: id,
                value: ` ${j}:`,
                is_toolbox_brick: true,
              },
            }, {
                id: `procedure_with_output∫${i}∫${j}∫container`,
                type: 'container',
                output: BrickOutput.any,
                root: id,
                inputs: [],
                ui: {
                  parent: id,
                  is_toolbox_brick: true,
                },
          }])))],
          ui: {
            is_toolbox_brick: true,
            offset: {
              x: 0,
              y: 20,
            },
          },
        });
      }
    });
    this.update();
  }

  root_bricks_on_change() {
    this.update_toolbox_procedure();
    this.props.workspace_on_change && this.props.workspace_on_change(this.root_bricks);
  }

  brick_on_context_menu = (e: BrickDragEvent) => {
    const id = this.active_brick_id;
    this.mask_data = {
      visibility: true,
      brick_id: id,
      content: <ContextMenu
        blank_on_click={() => {
          this.mask_data.visibility = false;
          this.update();
        }}
        menu={{
          copy: () => {
            const brick = this.brick_id_to_data[id];
            const new_brick = clone(brick);
            new_brick.ui.offset = get_global_offset(this.brick_refs[id].current, this.froggy_ref.current);
            new_brick.ui.offset.x += 20;
            new_brick.ui.offset.y += 20;
            this.root_bricks.push(new_brick);
            this.mask_data.visibility = false;
            this.update(() => this.root_bricks_on_change());
          },
        }}
        offset={{
          x: e.mouse_global_x - this.global_offset.x,
          y: e.mouse_global_y - this.global_offset.y,
        }}
      />,
    };
    this.update();
  }

  update_inserting_candidates(current: Brick) {
    if (current.ui.show_hat) {
      return;
    }
    if (current.output) {
      this.inserting_candidates = Object.keys(this.brick_id_to_data).filter(i => {
        const brick = this.brick_id_to_data[i];
        return i !== current.id &&
        !brick.ui.is_toolbox_brick &&
        !(brick.root && this.brick_id_to_data[brick.root].ui.is_toolbox_brick) &&
        brick.root !== current.id &&
        is_container(brick) &&
        !brick.is_static &&
        (brick.output === current.output || brick.output === BrickOutput.any || current.output === BrickOutput.any);
      });
    } else {
      this.inserting_candidates = Object.keys(this.brick_id_to_data).filter(
        i => {
          const brick = this.brick_id_to_data[i];
          return i !== current.id &&
            (brick.inputs || (brick.parts && brick.parts.length > 1)) &&
            !brick.ui.is_toolbox_brick &&
            !(brick.root && this.brick_id_to_data[brick.root].ui.is_toolbox_brick) &&
            brick.root !== current.id &&
            brick.next !== undefined;
        },
      );
    }
    this.inserting_candidates.forEach(i => {
      this.inserting_candidates_local_offset[i] = get_global_offset(this.brick_refs[i].current, this.froggy_ref.current);
      this.update_size(i);
    });
  }

  workspace_on_drag_start = (e) => {
    this.workspace_is_mouse_down = true;
    this.workspace_drag_start_data = {
      mouse_global_x: e.pageX,
      mouse_global_y: e.pageY,
      workspace_global_y: parseInt(this.froggy_ref.current.style.top) || 0,
      workspace_global_x: parseInt(this.froggy_ref.current.style.left) || 0,
    };
  }
  workspace_on_drag = (e) => {
    if (this.mask_data.visibility) {
      return;
    }
    const workspace_data = this.workspace_drag_start_data;
    this.froggy_offset = {
      x: Math.round(workspace_data.workspace_global_x + e.pageX - workspace_data.mouse_global_x),
      y: Math.round(workspace_data.workspace_global_y + e.pageY - workspace_data.mouse_global_y),
    };
    this.toolbox_ref.current.style.left = `${- this.froggy_offset.x}px`;
    this.toolbox_ref.current.style.top = `${- this.froggy_offset.y}px`;
    this.froggy_ref.current.style.left = `${this.froggy_offset.x}px`;
    this.froggy_ref.current.style.top = `${this.froggy_offset.y}px`;
  }
  workspace_on_drag_end = (e) => {
    this.workspace_is_mouse_down = false;
  }

  brick_on_drag_start = (e: BrickDragEvent) => {
    this.active_brick_id = e.id;
    this.brick_drag_start_data = e;
    this.update_size(e.id);
    let id = e.id;
    if (this.brick_id_to_data[e.id].is_static) {
      id = get_ancestor(this.brick_id_to_data, this.brick_id_to_data[e.id]).id;
      this.active_brick_id = id;
      this.brick_drag_start_data.id = id;
      this.update_size(id);
    }
    this.brick_drag_start_data.local_offset = get_global_offset(
      this.brick_refs[id].current,
      this.froggy_ref.current,
    );
    const data = this.brick_id_to_data[id];
    if (data.ui.is_toolbox_brick) {
      if (data.root) {
        this.brick_drag_start_data.id = data.root;
        this.update_size(data.root);
        this.brick_drag_start_data.local_offset = get_global_offset(
          this.brick_refs[data.root].current,
          this.froggy_ref.current,
        );
      }
      this.brick_drag_start_data.local_offset.x -= this.toolbox_bricks_ref.current.scrollLeft;
      this.brick_drag_start_data.local_offset.y -= this.toolbox_bricks_ref.current.scrollTop;
    }
  }
  brick_on_click = (e) => {
    this.active_brick_id = undefined;
  }
  brick_on_first_drag = (e) => {
    const drag_data = this.brick_drag_start_data;
    const id = drag_data.id;
    let brick_data = this.brick_id_to_data[id];
    if (brick_data.ui.is_toolbox_brick) {
      const b = clone(brick_data);
      b.ui.is_toolbox_brick = false;
      b.ui.offset.x = drag_data.local_offset.x;
      b.ui.offset.y = drag_data.local_offset.y;
      this.brick_drag_start_data.id = b.id;
      this.root_bricks.push(b);
      this.brick_id_to_data[b.id] = b;
      this.active_brick_id = b.id;
      brick_data = this.brick_id_to_data[b.id];
    } else if (!brick_data.is_root) {
      const parent = this.brick_id_to_data[brick_data.ui.parent];
      const needs_detach = !brick_data.is_static || !(parent && is_container(parent) && parent.is_static);
      if (needs_detach) {
        this.detach_brick(id, undefined, {
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
    this.update_inserting_candidates(brick_data);

    const tail = get_tail(brick_data);
    this.active_brick_tail_id = tail.id;
    this.update();
  }
  remove_root_brick(brick, clean_refs = true) {
    let root_index = 0;
    while (root_index < this.root_bricks.length && this.root_bricks[root_index] !== brick) {
      ++root_index;
    }
    if (clean_refs) {
      for_each_brick(brick, undefined, (i) => {
        delete this.brick_refs[i.id];
        delete this.brick_inputs_refs[i.id];
        delete this.brick_parts_refs[i.id];
        delete this.brick_id_to_data[i.id];
        delete this.brick_id_to_size[i.id];
      });
    }
    this.root_bricks.splice(root_index, 1);
  }
  detach_brick(id, tail_id = undefined, offset = {
    x: 0,
    y: 0,
  }) {
    const brick = this.brick_id_to_data[id];
    if (!brick.output) {
      const prev = this.brick_id_to_data[brick.prev];
      prev.next = null;
      if (tail_id) {
        const tail = this.brick_id_to_data[tail_id];
        const tail_next = tail.next;
        if (tail_next) {
          tail_next.prev = prev.id;
          prev.next = tail_next;
        }
        tail.next = null;
      }
    } else {
      const container = this.brick_id_to_data[brick.ui.parent];
      container.inputs = [];
      brick.ui.parent = undefined;
    }
    brick.is_root = true;
    brick.root = undefined;
    for_each_brick(brick, undefined, i => i.root = id);
    this.root_bricks.push(brick);
    brick.ui.offset = offset;
    return brick;
  }
  brick_on_drag = (e) => {
    const drag_data = this.brick_drag_start_data;
    const id = drag_data.id;
    const brick_data = this.brick_id_to_data[id];
    if (!this.brick_is_dragging) {
      this.brick_is_dragging = true;
      this.brick_on_first_drag(e);
      return;
    }

    const offset = {
      x: drag_data.local_offset.x + e.pageX - drag_data.mouse_global_x,
      y: drag_data.local_offset.y + e.pageY - drag_data.mouse_global_y,
    };
    this.active_brick_needs_removing = offset.x < -this.froggy_offset.x + this.toolbox_ref.current.clientWidth;
    let needs_update = false;
    const closest = this.inserting_candidates.reduce(
      (m, i) => {
        const current = this.brick_id_to_data[i];
        const parent = this.brick_id_to_data[current.ui.parent];
        const x1 = offset.x;
        const y1 = offset.y;
        const x2 = this.inserting_candidates_local_offset[i].x + (parent && parent.parts ? 20 : 0);
        const y2 = this.inserting_candidates_local_offset[i].y + (brick_data.output ? 0 : this.brick_id_to_size[i].h);
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
      },
    );
    if (closest.distance < 15 && !this.active_brick_needs_removing) {
      if (!this.brick_is_inserting) {
        this.brick_is_inserting = true;

        const closest_brick = this.brick_id_to_data[closest.closest_brick_id];
        const tail = this.brick_id_to_data[this.active_brick_tail_id];
        if (brick_data.output) {
          if (closest_brick.inputs[0]) {
            this.detach_brick(closest_brick.inputs[0].id, undefined, {
              x: offset.x + 20,
              y: offset.y + 20,
            });
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
        this.ghost_bricks = [];
        for_each_brick(brick_data, tail, (i) => {
          this.ghost_bricks[i.id] = true;
          i.root = closest_brick.root || closest_brick.id;
        });
        brick_data.is_root = false;

        this.remove_root_brick(brick_data, false);
        brick_data.ui.offset.x = 0;
        brick_data.ui.offset.y = 0;
        needs_update = true;
      }
    } else {
      if (this.brick_is_inserting) {
        this.ghost_bricks = {};
        this.brick_is_inserting = false;
        if (!brick_data.is_root) {
          this.detach_brick(id, this.active_brick_tail_id);
        }
        needs_update = true;
      }
    }

    if (!this.brick_is_inserting) {
      let target = brick_data;
      if (brick_data.is_static) {
        target = get_ancestor(this.brick_id_to_data, brick_data);
      }
      target.ui.offset.x = offset.x;
      target.ui.offset.y = offset.y;
      if (target !== this.root_bricks[this.root_bricks.length - 1]) {
        this.remove_root_brick(target, false);
        this.root_bricks.push(target);
      }
      needs_update = true;
    }

    if (needs_update) {
      this.update(() => {
        this.inserting_candidates.forEach(i => {
          this.inserting_candidates_local_offset[i] = get_global_offset(this.brick_refs[i].current, this.froggy_ref.current);
          this.update_size(i);
        });
      });
    }
    // TODO
  }
  brick_on_drag_end = (e) => {
    if (this.active_brick_needs_removing) {
      this.remove_root_brick(this.brick_id_to_data[this.active_brick_id]);
      this.active_brick_needs_removing = false;
    }
    this.active_brick_id = undefined;
    this.brick_is_dragging = false;
    this.clear_inserting_candidates();
    this.ghost_bricks = {};
    this.update(() => this.root_bricks_on_change());
  }

  update_size(id, proxy = undefined) {
    const ref = this.brick_inputs_refs[proxy || id].current ||
      this.brick_parts_refs[proxy || id].current ||
      this.brick_refs[proxy || id].current;
    this.brick_id_to_size[id] = {
      h: ref.clientHeight,
      w: ref.clientWidth,
    };
  }
  on_mouse_move_middleware = (e) => {
    const event = {
      pageX: e.touches ? e.touches[0].pageX : e.pageX,
      pageY: e.touches ? e.touches[0].pageY : e.pageY,
    };
    if (this.workspace_is_mouse_down && !this.active_brick_id) {
      this.workspace_on_drag(event);
      return;
    }
    if (!this.active_brick_id) {
      return;
    }
    this.brick_on_drag(event);
  }
  on_mouse_up_middleware = (event) => {
    if (this.brick_is_dragging) {
      this.brick_on_drag_end(event);
    } else {
      this.brick_on_click(event);
    }
    this.workspace_on_drag_end(event);
  }
  on_mouse_down_middleware = (e) => {
    const event = {
      pageX: e.touches ? e.touches[0].pageX : e.pageX,
      pageY: e.touches ? e.touches[0].pageY : e.pageY,
    };
    this.workspace_on_drag_start(event);
  }
  render() {
    return <div
      ref={this.froggy_wrap_ref}
      key={this.props.id}
      className={styles.froggyWrap}
      onMouseDown={this.on_mouse_down_middleware}
      onTouchStart={this.on_mouse_down_middleware}
      onMouseMove={this.on_mouse_move_middleware}
      onTouchMove={this.on_mouse_move_middleware}
      onMouseUp={this.on_mouse_up_middleware}
      onTouchEnd={this.on_mouse_up_middleware}
    >
      <div
        ref={this.froggy_ref}
        className={styles.froggy}
        style={{
          left: `${this.froggy_offset.x}px`,
          top: `${this.froggy_offset.y}px`,
        }}
      >
        <div
          className={styles.toolbox}
          ref={this.toolbox_ref}
          onTouchStart={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          style={{
            left: `${-this.froggy_offset.x}px`,
            top: `${-this.froggy_offset.y}px`,
          }}
        >
          <div className={styles.categories}>
            {Object.keys(this.toolbox.categories).map(i => <div
              key={i}
              onClick={() => {
                this.toolbox.activeCategory = i;
                this.update();
              }}
              className={`${styles.category} ${i === this.toolbox.activeCategory ? styles.activeCategory : ''}`}
            >{i}</div>)}
          </div>
          <div
            className={styles.toolboxBricks}
            ref={this.toolbox_bricks_ref}
          >
            {this.toolbox.categories[this.toolbox.activeCategory].map(i => root_brick_to_brick_component(this, i))}
          </div>
        </div>
        {this.root_bricks.map(i => root_brick_to_brick_component(this, i))}
      </div>
      <div
        className={styles.mask}
        ref={this.mask_ref}
        style={{
          display: this.mask_data.visibility ? 'block' : 'none',
        }}
      >{this.mask_data.content}</div>
    </div>;
  }
}

function root_brick_to_brick_component(workspace: Workspace, root_brick) {
  const init_brick_id_to_data = (data: Brick) => {
    workspace.brick_id_to_data[data.id] = data;
    workspace.brick_refs[data.id] = workspace.brick_refs[data.id] || React.createRef();
    workspace.brick_inputs_refs[data.id] = workspace.brick_inputs_refs[data.id] || React.createRef();
    workspace.brick_parts_refs[data.id] = workspace.brick_parts_refs[data.id] || React.createRef();
    data.parts && data.parts.forEach(i => init_brick_id_to_data(i));
    data.inputs && data.inputs.forEach(i => init_brick_id_to_data(i));
    data.next && init_brick_id_to_data(data.next);
  };
  init_brick_id_to_data(root_brick);
  const init_brick_instance = (brick: Brick) => {
    const id = brick.id;
    let child;
    if (AtomicBrickEnum[brick.type]) {
      if (brick.type === 'atomic_text') {
        return <span key={brick.id} className={styles.atomicText}>{brick.ui.value[0] === ' ' ? <div className={styles.atomicTextIndent}/> : null}{brick.ui.value}</span>;
      }
      const basic_fns = {
        onChange: (value) => {
          if (brick.output === BrickOutput.number) {
            brick.ui.value = parseFloat(value) || 0;
            workspace.update();
          } else {
            brick.ui.value = value;
          }
          workspace.root_bricks_on_change();
          return brick.ui.value;
        },
        show: (content, cb?) => {
          workspace.mask_data.content = content;
          workspace.mask_data.visibility = true;
          workspace.mask_data.brick_id = brick.id;
          workspace.update(cb || (() => {}));
        },
        hide: () => {
          workspace.mask_data.visibility = false;
          workspace.mask_data.brick_id = undefined;
          workspace.update();
        },
      };
      const select_fns = {
        ...basic_fns,
        offset: () => {
          const offset = get_global_offset(workspace.brick_refs[brick.id].current);
          offset.y += 40;
          return offset;
        },
      };
      const input_fns = {
        ...basic_fns,
        offset: () => {
          const offset = get_global_offset(workspace.brick_refs[brick.id].current);
          offset.x++;
          offset.y++;
          return offset;
        },
      };
      const typeToInstance = {
        atomic_input_string: () => <Input
          value={brick.ui.value.toString()}
          {...input_fns}
          editing={workspace.mask_data.visibility && workspace.mask_data.brick_id === brick.id} />,
        atomic_input_number: () => typeToInstance.atomic_input_string(),
        atomic_dropdown: () => <Select value={brick.ui.value} options={workspace.props.atomic_dropdown_menu[brick.ui.dropdown]} {...select_fns} />,
        atomic_boolean: () => typeToInstance.atomic_dropdown(),
        atomic_button: () => <div key={brick.id} className={styles.atomicButtonWrap}><div className={brick.ui.className} onClick={(e) => {
          e.stopPropagation();
          workspace.props.atomic_button_fns[brick.ui.value](workspace.brick_id_to_data, brick, () => workspace.update(() => workspace.root_bricks_on_change()));
        }}/></div>,
        atomic_param: () => <div key={brick.id} className={styles.atomicParam}>{brick.ui.value}</div>,
      };
      child = typeToInstance[brick.type]();
    }
    return (
      <BrickComponent
        styles={styles}
        key={id}
        id={id}
        is_removing={id === workspace.active_brick_id && workspace.active_brick_needs_removing}
        active={id === workspace.active_brick_id}
        is_ghost={workspace.ghost_bricks[id]}
        offset={brick.is_root && brick.ui.offset}
        output={brick.output}
        show_hat={brick.ui.show_hat}
        brick_ref={workspace.brick_refs[id]}
        is_container={is_container(brick)}
        brick_inputs_ref={workspace.brick_inputs_refs[id]}
        brick_parts_ref={workspace.brick_parts_refs[id]}
        on_drag_start={workspace.brick_on_drag_start}
        on_context_menu={workspace.brick_on_context_menu}
        parts={brick.parts ? brick.parts.map(i => init_brick_instance(i)) : []}
        inputs={brick.inputs ? brick.inputs.map(i => init_brick_instance(i)) : []}
        next={brick.next ? init_brick_instance(brick.next) : null}
        children={child}
      />
    );
  };
  return init_brick_instance(root_brick);
}