import React from 'react';
import { BrickOutput, } from './types';
class BrickComponent extends React.Component {
    constructor(props) {
        super(props);
        this.refs = null;
        this.on_touch_start = (e) => {
            if (this.props.is_container) {
                return;
            }
            e.stopPropagation();
            this.props.on_drag_start({
                id: this.props.id,
                mouse_global_x: e.touches[0].pageX,
                mouse_global_y: e.touches[0].pageY,
            });
        };
        this.on_mouse_down = (e) => {
            if (this.props.is_container) {
                return;
            }
            e.stopPropagation();
            this.props.on_drag_start({
                id: this.props.id,
                mouse_global_x: e.pageX,
                mouse_global_y: e.pageY,
            });
        };
        this.on_context_menu = (e) => {
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
        };
        props.brick_id_to_component[props.id] = this;
    }
    render() {
        const styles = this.props.styles;
        const events = {
            onTouchStart: this.on_touch_start,
            onMouseDown: this.on_mouse_down,
            onContextMenu: this.on_context_menu,
        };
        const inputs = this.props.inputs.length ?
            React.createElement("div", Object.assign({}, events, { className: `${styles.inputs} ${this.props.data.ui.show_hat ? styles.hat : ''}`, ref: this.props.brick_inputs_ref }), this.props.inputs) : null;
        const parts = this.props.parts.length ?
            React.createElement("div", { className: styles.parts, ref: this.props.brick_parts_ref }, this.props.parts) : null;
        const next = this.props.next ?
            React.createElement("div", { className: styles.next }, this.props.next) : null;
        return React.createElement("div", Object.assign({ style: {
                marginLeft: `${this.props.data.ui.offset && this.props.data.ui.offset.x || 0}px`,
                marginTop: `${this.props.data.ui.offset && this.props.data.ui.offset.y || 0}px`,
            }, className: `${styles.wrap} ${this.props.data.output ? `${styles.output} ${styles[BrickOutput[this.props.data.output]]}` : ''} ${this.props.data.ui.is_removing ? styles.removing : ''} ${this.props.is_container ? styles.container : ''}  ${this.props.data.ui.is_ghost ? styles.ghost : ''} ${this.props.active ? styles.active : ''}`, "data-id": this.props.id, ref: this.props.brick_ref }, this.props.children ? events : {}),
            inputs,
            parts,
            next,
            this.props.children);
    }
}
export default BrickComponent;
