var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var BrickComponent_1;
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './styles/brick.less';
import { get_global_offset } from './util';
import Input from './dummy/input';
import Select from './dummy/select';
import { AtomicBrickEnum, BrickOutput, } from './types';
const is_container = (brick) => brick.type === 'container';
let RootBrickComponent = class RootBrickComponent extends Component {
    constructor(props) {
        super(props);
    }
    render() {
        const brick = this.props.data;
        const store = this.props.store;
        const id = brick.id;
        return React.createElement("div", { className: styles.root_brick, style: brick.ui && brick.ui.offset ? {
                left: brick.ui.offset.x,
                top: brick.ui.offset.y,
            } : {} },
            React.createElement(BrickComponent, { data: brick, store: store }));
    }
};
RootBrickComponent = __decorate([
    observer
], RootBrickComponent);
export { RootBrickComponent };
let BrickComponent = BrickComponent_1 = class BrickComponent extends Component {
    constructor(props) {
        super(props);
        this.on_touch_start = (e) => {
            e.stopPropagation();
            this.props.store.brick_on_drag_start(e, this.props.data, this.ref.current);
        };
        this.on_mouse_down = (e) => {
            e.stopPropagation();
            this.props.store.brick_on_drag_start(e, this.props.data, this.ref.current);
        };
        this.on_context_menu = (e) => {
            e.stopPropagation();
            this.props.store.on_context_menu(e, this.props.data, this.ref.current);
        };
        this.ref = React.createRef();
    }
    render() {
        const brick = this.props.data;
        const store = this.props.store;
        let child;
        if (AtomicBrickEnum[brick.type]) {
            if (brick.type === 'atomic_text') {
                return React.createElement("div", { key: brick.id, className: styles.atomicText },
                    brick.ui.value[0] === ' ' ? React.createElement("div", { className: styles.atomicTextIndent }) : null,
                    brick.ui.value);
            }
            const basic_fns = {
                onChange: (value) => {
                    if (brick.output === BrickOutput.number) {
                        brick.ui.value = parseFloat(value) || 0;
                    }
                    else {
                        brick.ui.value = value;
                    }
                    // store.root_bricks_on_change();
                    return brick.ui.value;
                },
                show: (content, cb) => {
                    store.ui.mask.content = content;
                    store.ui.mask.visibility = true;
                },
                hide: () => {
                    store.ui.mask.visibility = false;
                },
            };
            const select_fns = Object.assign({}, basic_fns, { offset: () => {
                    const offset = get_global_offset(this.ref.current);
                    offset.y += 40;
                    return offset;
                } });
            const input_fns = Object.assign({}, basic_fns, { offset: () => {
                    const offset = get_global_offset(this.ref.current);
                    offset.x++;
                    offset.y++;
                    return offset;
                } });
            const typeToInstance = {
                atomic_input_string: () => React.createElement(Input, Object.assign({ value: brick.ui.value.toString() }, input_fns, { editing: store.ui.mask.visibility && store.active_brick === brick })),
                atomic_input_number: () => typeToInstance.atomic_input_string(),
                atomic_dropdown: () => React.createElement(Select, Object.assign({ value: brick.ui.value, options: store.atomic_dropdown_menu[brick.ui.dropdown] }, select_fns)),
                atomic_boolean: () => typeToInstance.atomic_dropdown(),
                atomic_button: () => React.createElement("div", { key: brick.id, className: styles.atomicButtonWrap },
                    React.createElement("div", { className: brick.ui.className, onClick: (e) => {
                            e.stopPropagation();
                            store.atomic_button_fns[brick.ui.value](store, brick);
                        } })),
                atomic_param: () => React.createElement("div", { key: brick.id, className: styles.atomicParam }, brick.ui.value),
            };
            child = typeToInstance[brick.type]();
        }
        const parts = brick.parts && brick.parts.length && brick.parts.map(i => React.createElement(BrickComponent_1, { key: i.id, data: i, store: store }));
        const inputs = brick.inputs && brick.inputs.length && brick.inputs.map(i => React.createElement(BrickComponent_1, { key: i.id, data: i, store: store }));
        const next = brick.next && React.createElement(BrickComponent_1, { key: brick.next.id, data: brick.next, store: store });
        const active = brick === store.active_brick;
        const class_name = `${styles.wrap} ${brick.output ? `${styles.output} ${styles[BrickOutput[brick.output]]}` : ''} ${brick.ui.is_removing ? styles.removing : ''} ${is_container(brick) ? styles.container : ''}  ${brick.ui.is_ghost ? styles.ghost : ''} ${active ? styles.active : ''}`;
        const events = {
            onTouchStart: this.on_touch_start,
            onMouseDown: this.on_mouse_down,
            onContextMenu: this.on_context_menu,
        };
        return (React.createElement("div", Object.assign({ className: class_name, ref: this.ref, key: brick.id }, child ? events : {}, { style: {
                marginLeft: `${brick.ui.offset && brick.ui.offset.x || 0}px`,
                marginTop: `${brick.ui.offset && brick.ui.offset.y || 0}px`,
            } }),
            parts ? React.createElement("div", { className: styles.parts }, parts) : null,
            inputs ? React.createElement("div", Object.assign({}, events, { className: `${styles.inputs} ${brick.ui.show_hat ? styles.hat : ''}` }), inputs) : null,
            next ? React.createElement("div", { className: styles.next }, next) : null,
            child));
    }
};
BrickComponent = BrickComponent_1 = __decorate([
    observer
], BrickComponent);
