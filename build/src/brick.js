import React from 'react';
export var BrickOutput;
(function (BrickOutput) {
    BrickOutput[BrickOutput["void"] = 0] = "void";
    BrickOutput[BrickOutput["string"] = 1] = "string";
    BrickOutput[BrickOutput["number"] = 2] = "number";
    BrickOutput[BrickOutput["boolean"] = 3] = "boolean";
    BrickOutput[BrickOutput["array"] = 4] = "array";
    BrickOutput[BrickOutput["any"] = 5] = "any";
})(BrickOutput || (BrickOutput = {}));
export var AtomicBrickEnum;
(function (AtomicBrickEnum) {
    AtomicBrickEnum[AtomicBrickEnum["atomic_text"] = 1] = "atomic_text";
    AtomicBrickEnum[AtomicBrickEnum["atomic_boolean"] = 2] = "atomic_boolean";
    AtomicBrickEnum[AtomicBrickEnum["atomic_dropdown"] = 3] = "atomic_dropdown";
    AtomicBrickEnum[AtomicBrickEnum["atomic_input_string"] = 4] = "atomic_input_string";
    AtomicBrickEnum[AtomicBrickEnum["atomic_input_number"] = 5] = "atomic_input_number";
    AtomicBrickEnum[AtomicBrickEnum["atomic_param"] = 6] = "atomic_param";
    AtomicBrickEnum[AtomicBrickEnum["atomic_button"] = 7] = "atomic_button";
})(AtomicBrickEnum || (AtomicBrickEnum = {}));
import { gen_id } from './util';
export const get_ancestor = (bricks, brick) => {
    let ancestor = brick;
    while (ancestor.ui.parent) {
        ancestor = bricks[ancestor.ui.parent];
    }
    return ancestor;
};
export const clone = (brick, with_ui = true) => {
    let root;
    const do_clone = (b, prev, parent = undefined) => {
        const id = gen_id();
        root = root || id;
        const res = Object.assign({}, b, { parts: b.parts ? b.parts.map(i => do_clone(i, undefined, id)) : undefined, inputs: b.inputs ? b.inputs.map(i => do_clone(i, undefined, id)) : undefined, root, prev: b.output ? undefined : prev, id });
        if (with_ui) {
            res.ui = Object.assign({}, b.ui, { is_toolbox_brick: false, parent: parent, delegate: b.output ? undefined : parent });
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
    return root_brick;
};
export const get_tail = (b) => {
    let tail = b;
    while (tail.next) {
        tail = tail.next;
    }
    return tail;
};
export const for_each_brick = (b, tail, cb, range = {
    inputs: true,
    parts: true,
    next: true,
}) => {
    const for_each_child_brick = (brick) => {
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
    }
    render() {
        const styles = this.props.styles;
        const events = {
            onTouchStart: this.on_touch_start,
            onMouseDown: this.on_mouse_down,
            onContextMenu: this.on_context_menu,
        };
        const inputs = this.props.inputs.length ?
            React.createElement("div", Object.assign({}, events, { className: styles.inputs, ref: this.props.brick_inputs_ref }),
                this.props.show_hat ? React.createElement("div", { className: styles.hat }) : null,
                this.props.inputs) : null;
        const parts = this.props.parts.length ?
            React.createElement("div", { className: styles.parts, ref: this.props.brick_parts_ref }, this.props.parts) : null;
        const next = this.props.next ?
            React.createElement("div", { className: styles.next }, this.props.next) : null;
        return React.createElement("div", Object.assign({ style: {
                marginLeft: `${this.props.offset && this.props.offset.x || 0}px`,
                marginTop: `${this.props.offset && this.props.offset.y || 0}px`,
            }, className: `${styles.wrap} ${styles[BrickOutput[this.props.output || BrickOutput.void]]} ${this.props.is_removing ? styles.removing : ''} ${this.props.is_container ? styles.container : ''}  ${this.props.is_ghost ? styles.ghost : ''} ${this.props.active ? styles.active : ''}`, "data-id": this.props.id, ref: this.props.brick_ref }, this.props.children ? events : {}),
            inputs,
            parts,
            next,
            this.props.children);
    }
}
export default BrickComponent;
