import React from 'react';
import { DragEvent, MouseEvent, TouchEvent } from 'react';
import {
  Brick,
  BrickOutput,
  BrickId,
  BrickDragEvent,
} from './types';

type Props = {
  brick_id_to_component: {[id: string]: any},
  data: Brick,
  styles?: any,
  active?: boolean,
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

class BrickComponent extends React.Component<Props, State> {
  refs = null;
  constructor(props: Props) {
    super(props);
    props.brick_id_to_component[props.id] = this;
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
        className={`${styles.inputs} ${this.props.data.ui.show_hat ? styles.hat : ''}`}
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
        marginLeft: `${this.props.data.ui.offset && this.props.data.ui.offset.x || 0}px`,
        marginTop: `${this.props.data.ui.offset && this.props.data.ui.offset.y || 0}px`,
      }}
      className={`${styles.wrap} ${this.props.data.output ? `${styles.output} ${styles[BrickOutput[this.props.data.output]]}` : ''} ${this.props.data.ui.is_removing ? styles.removing : ''} ${this.props.is_container ? styles.container : ''}  ${this.props.data.ui.is_ghost ? styles.ghost : ''} ${this.props.active ? styles.active : ''}`}
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