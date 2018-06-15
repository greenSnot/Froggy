import React from 'react';
import { DragEvent, MouseEvent, TouchEvent } from 'react';

export type BrickId = string;
export type BrickDragEvent = {
  id: BrickId,
  mouse_global_x: number,
  mouse_global_y: number,
};
export enum BrickOutput {
  void,
  string,
  number,
  boolean,
  array,
  any,
}

export enum AtomicBrickEnum {
  atomic_text = 1,
  atomic_boolean,
  atomic_dropdown,
  atomic_input_string,
  atomic_input_number,
  atomic_param,
  atomic_button,
}

export type RuntimeBrick = {
  id?: BrickId,
  type: string,
  root?: BrickId,
  is_root?: boolean,

  parts?: Brick[],
  prev?: BrickId,
  next?: Brick,
  output?: BrickOutput,
  inputs?: Brick[],

  is_static?: boolean, // avoid to be inserting candidate
};

export type Brick = RuntimeBrick & {
  ui?: {
    className?: string,
    copier?: boolean, // for output container
    parent?: BrickId, // part's parent or input's parent
    show_hat?: boolean,
    offset?: {
      x: number,
      y: number,
    },
    is_toolbox_brick?: boolean,
    value?: any, // output value
    dropdown?: string, // dropdown
  },
};

import { gen_id } from './util';

export const get_ancestor = (bricks, brick: Brick) => {
  let ancestor = brick;
  while (ancestor.ui.parent) {
    ancestor = bricks[ancestor.ui.parent];
  }
  return ancestor;
};

export const clone = (brick: Brick, with_ui = true) => {
  let root;
  const do_clone = (b: Brick, prev: BrickId, parent = undefined) => {
    const id = gen_id();
    root = root || id;
    const res = {
      ...b,
      parts: b.parts ? b.parts.map(i => do_clone(i, undefined, id)) : undefined,
      inputs: b.inputs ? b.inputs.map(i => do_clone(i, undefined, id)) : undefined,
      root,
      prev: b.output ? undefined : prev,
      id,
    } as Brick;
    if (with_ui) {
      res.ui = {
        ...b.ui,
        is_toolbox_brick: false,
        parent: parent,
        delegate: b.output ? undefined : parent,
      };
    }
    if (b.next !== undefined) {
      res.next = b.next === null ? null : do_clone(b.next, id);
    }
    return res;
  };
  const root_brick = do_clone(brick, undefined);
  root_brick.root = undefined;
  root_brick.ui.offset = {
    x: 0,
    y: 0,
  };
  root_brick.is_root = true;
  return root_brick as Brick;
};

export const get_tail = (b: Brick) => {
  let tail = b;
  while (tail.next) {
    tail = tail.next;
  }
  return tail;
};

type Props = {
  styles?: any,
  is_removing?: boolean,
  active?: boolean,
  show_hat?: boolean,
  offset?: {
    x: number,
    y: number,
  },
  is_ghost?: boolean,
  output?: BrickOutput,
  is_container?: boolean,
  on_drag_start: (e: BrickDragEvent) => void,
  on_context_menu: (e: BrickDragEvent) => void,
  brick_ref: any,
  brick_inputs_ref: any,
  brick_parts_ref: any,
  parts: any,
  next: any,
  inputs: any,
  id: BrickId,
};
type State = {};

export const for_each_brick = (
  b: Brick,
  tail: Brick,
  cb: Function,
  range: {
    inputs?: boolean,
    parts?: boolean,
    next?: boolean,
  } = {
    inputs: true,
    parts: true,
    next: true,
  }) => {
  const for_each_child_brick = (brick: Brick) => {
    cb(brick);
    range.inputs && brick.inputs && brick.inputs.forEach(i => for_each_child_brick(i));
    range.parts && brick.parts && brick.parts.forEach(i => for_each_child_brick(i));
    if (tail && brick.id === tail.id) {
      return;
    }
    range.next && brick.next && for_each_child_brick(brick.next);
  };
  for_each_child_brick(b);
};

class BrickComponent extends React.Component<Props, State> {
  refs = null;
  constructor(props) {
    super(props);
  }
  on_touch_start = (e: TouchEvent<HTMLDivElement>) => {
    if (this.props.is_container) {
      return;
    }
    e.stopPropagation();
    this.props.on_drag_start({
      id: this.props.id,
      mouse_global_x: e.touches[0].pageX,
      mouse_global_y: e.touches[0].pageY,
    });
  }

  on_mouse_down = (e: MouseEvent<HTMLDivElement>) => {
    if (this.props.is_container) {
      return;
    }
    e.stopPropagation();
    this.props.on_drag_start({
      id: this.props.id,
      mouse_global_x: e.pageX,
      mouse_global_y: e.pageY,
    });
  }

  on_context_menu = (e: MouseEvent<HTMLDivElement>) => {
    if (this.props.is_container) {
      return;
    }
    e.preventDefault();
    e.stopPropagation();
    this.props.on_context_menu({
      id: this.props.id,
      mouse_global_x: e.pageX,
      mouse_global_y: e.pageY,
    });
  }

  render() {
    const styles = this.props.styles;
    const events = {
      onTouchStart: this.on_touch_start,
      onMouseDown: this.on_mouse_down,
      onContextMenu: this.on_context_menu,
    };
    const inputs = this.props.inputs.length ?
      <div
        {...events}
        className={`${styles.inputs} ${this.props.show_hat ? styles.hat : ''}`}
        ref={this.props.brick_inputs_ref}
      >
        {this.props.inputs}
      </div> : null;
    const parts = this.props.parts.length ?
      <div className={styles.parts} ref={this.props.brick_parts_ref}>
        {this.props.parts}
      </div> : null;
    const next = this.props.next ?
      <div className={styles.next}>
        {this.props.next}
      </div> : null;
    return <div
      style={{
        marginLeft: `${this.props.offset && this.props.offset.x || 0}px`,
        marginTop: `${this.props.offset && this.props.offset.y || 0}px`,
      }}
      className={`${styles.wrap} ${this.props.output ? `${styles.output} ${styles[BrickOutput[this.props.output]]}` : ''} ${this.props.is_removing ? styles.removing : ''} ${this.props.is_container ? styles.container : ''}  ${this.props.is_ghost ? styles.ghost : ''} ${this.props.active ? styles.active : ''}`}
      data-id={this.props.id}
      ref={this.props.brick_ref}
      {...this.props.children ? events : {}}
    >
      {inputs}
      {parts}
      {next}
      {this.props.children}
    </div>;
  }
}

export default BrickComponent;