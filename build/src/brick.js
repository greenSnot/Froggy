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
            const host = this.props.data.output === BrickOutput.void ? this.props.store.id_to_host[this.props.data.id] : this.props.data;
            const element = this.props.store.id_to_ref[host.id].current;
            this.props.store.brick_on_drag_start(e, host, element);
        };
        this.on_mouse_down = (e) => {
            e.stopPropagation();
            const host = this.props.data.output === BrickOutput.void ? this.props.store.id_to_host[this.props.data.id] : this.props.data;
            const element = this.props.store.id_to_ref[host.id].current;
            this.props.store.brick_on_drag_start(e, host, element);
        };
        this.on_context_menu = (e) => {
            e.stopPropagation();
            const host = this.props.data.output === BrickOutput.void ? this.props.store.id_to_host[this.props.data.id] : this.props.data;
            const element = this.props.store.id_to_ref[host.id].current;
            this.props.store.on_context_menu(e, host, element);
        };
        this.ref = React.createRef();
    }
    componentDidUpdate() {
        this.props.store.id_to_offset[this.props.data.id] = get_global_offset(this.ref.current, this.props.store.workspace_ref.current);
    }
    render() {
        const brick = this.props.data;
        const store = this.props.store;
        store.id_to_data[brick.id] = brick;
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
        if (brick.parts && brick.parts.length) {
            brick.parts.forEach(i => store.id_to_host[i.id] = brick);
        }
        store.id_to_ref[brick.id] = this.ref;
        const inputs = brick.inputs && brick.inputs.length && brick.inputs.map(i => React.createElement(BrickComponent_1, { key: i.id, data: i, store: store, is_container: true }));
        if (brick.inputs) {
            brick.inputs.forEach(i => store.id_to_host[i.id] = brick);
        }
        const is_container = this.props.is_container;
        const next = brick.next && React.createElement(BrickComponent_1, { key: brick.next.id, data: brick.next, store: store });
        if (brick.next) {
            store.id_to_prev[brick.next.id] = brick;
        }
        const active = brick === store.active_brick;
        const class_name = `${styles.wrap} ${brick.output ? `${styles.output} ${styles[BrickOutput[brick.output]]}` : ''} ${brick.ui.is_removing ? styles.removing : ''} ${is_container ? styles.container : ''}  ${brick.ui.is_ghost ? styles.ghost : ''} ${active ? styles.active : ''}`;
        const events = {
            onTouchStart: this.on_touch_start,
            onMouseDown: this.on_mouse_down,
            onContextMenu: this.on_context_menu,
        };
        return (React.createElement("div", Object.assign({ className: class_name, "data-id": brick.id, ref: this.ref, key: brick.id }, child ? events : {}),
            parts ? React.createElement("div", { className: styles.parts }, parts) : null,
            inputs ? React.createElement("div", Object.assign({}, events, { className: `${styles.inputs} ${brick.ui.show_hat ? styles.hat : ''}` }), inputs) : null,
            next ? React.createElement("div", { className: styles.next }, next) : null,
            child));
    }
};
BrickComponent = BrickComponent_1 = __decorate([
    observer
], BrickComponent);
