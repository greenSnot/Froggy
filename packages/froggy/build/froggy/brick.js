import React, { useCallback } from "react";
import Input from "./dummy/input";
import Select from "./dummy/select";
import { BrickOutput, AtomicBrickEnum, } from "./types";
import styles from "./styles/brick.less";
import { get_id, is_container } from "./util";
const BrickComponent = ({ data }) => {
    const { path } = data;
    const id = get_id(data);
    const self_is_container = is_container(data);
    const on_drag_start = () => { };
    const on_context_menu = () => { };
    const atomic_dropdown_menu = {};
    const on_touch_start = useCallback((e) => {
        if (self_is_container) {
            return;
        }
        e.stopPropagation();
        on_drag_start({
            id: id,
            mouse_global_x: e.touches[0].pageX,
            mouse_global_y: e.touches[0].pageY,
        });
    }, [on_drag_start, id, self_is_container]);
    const on_mouse_down = useCallback((e) => {
        if (self_is_container) {
            return;
        }
        e.stopPropagation();
        on_drag_start({
            id: id,
            mouse_global_x: e.pageX,
            mouse_global_y: e.pageY,
        });
    }, [on_drag_start, id, self_is_container]);
    const fn_on_context_menu = useCallback((e) => {
        if (self_is_container) {
            return;
        }
        e.preventDefault();
        e.stopPropagation();
        on_context_menu({
            id: id,
            mouse_global_x: e.pageX,
            mouse_global_y: e.pageY,
        });
    }, [on_context_menu, id, self_is_container]);
    if (AtomicBrickEnum[data.type]) {
        if (data.type === "atomic_text") {
            return (React.createElement("div", { key: id, className: styles.atomicText },
                data.ui.value[0] === " " ? (React.createElement("div", { className: styles.atomicTextIndent })) : null,
                data.ui.value));
        }
        const basic_fns = {
            onChange: (value) => {
                if (data.output === BrickOutput.number) {
                    data.ui.value = parseFloat(value) || 0;
                }
                else {
                    data.ui.value = value;
                }
                return data.ui.value;
            },
            show: (content, cb) => {
                // workspace.mask_data.content = content;
                // workspace.mask_data.visibility = true;
                // workspace.mask_data.brick_id = brick.id;
            },
            hide: () => {
                // workspace.mask_data.visibility = false;
                // workspace.mask_data.brick_id = undefined;
                // workspace.update();
            },
        };
        const select_fns = Object.assign(Object.assign({}, basic_fns), { offset: () => {
                // const offset = get_global_offset(
                //   workspace.brick_refs[brick.id].current
                // );
                // offset.y += 40;
                // return offset;
                return { x: 0, y: 0 };
            } });
        const input_fns = Object.assign(Object.assign({}, basic_fns), { offset: () => {
                // const offset = get_global_offset(
                //   workspace.brick_refs[brick.id].current
                // );
                // offset.x++;
                // offset.y++;
                // return offset;
                return { x: 0, y: 0 };
            } });
        const typeToInstance = {
            atomic_input_string: () => (React.createElement(Input, Object.assign({ value: data.ui.value.toString() }, input_fns, { editing: false }))),
            atomic_input_number: () => typeToInstance.atomic_input_string(),
            atomic_dropdown: () => (React.createElement(Select, Object.assign({ value: data.ui.value, options: atomic_dropdown_menu[data.ui.dropdown] }, select_fns))),
            atomic_boolean: () => typeToInstance.atomic_dropdown(),
            atomic_button: () => (React.createElement("div", { key: id, className: styles.atomicButtonWrap },
                React.createElement("div", { className: data.ui.className, onClick: (e) => {
                        e.stopPropagation();
                        // atomic_button_fns[brick.ui.value](
                        //   workspace.brick_id_to_data,
                        //   brick,
                        //   () =>
                        //     workspace.update(() => workspace.root_bricks_on_change())
                        // );
                    } }))),
            atomic_param: () => (React.createElement("div", { key: id, className: styles.atomicParam }, data.ui.value)),
        };
        return typeToInstance[data.type]();
    }
    const events = {
        onTouchStart: on_touch_start,
        onMouseDown: on_mouse_down,
        onContextMenu: fn_on_context_menu,
    };
    const inputs_el = data.inputs.length ? (React.createElement("div", Object.assign({}, events, { className: `${styles.inputs} ${data.ui.show_hat ? styles.hat : ""}` }), data.inputs.map((i) => (React.createElement(BrickComponent, { key: get_id(i), data: i }))))) : null;
    const parts_el = data.parts.length ? (React.createElement("div", { className: styles.parts }, data.parts.map((i) => (React.createElement(BrickComponent, { data: i, key: get_id(i) }))))) : null;
    const next_el = data.next ? (React.createElement("div", { className: styles.next },
        React.createElement(BrickComponent, { data: data.next, key: get_id(data.next) }))) : null;
    return (React.createElement("div", Object.assign({ style: {
            marginLeft: `${(data.ui.offset && data.ui.offset.x) || 0}px`,
            marginTop: `${(data.ui.offset && data.ui.offset.y) || 0}px`,
        }, className: `${styles.wrap} ${data.output
            ? `${styles.output} ${styles[BrickOutput[data.output]]}`
            : ""} ${data.ui.is_removing ? styles.removing : ""} ${self_is_container ? styles.container : ""}  ${data.ui.is_ghost ? styles.ghost : ""}`, "data-id": id }, events),
        inputs_el,
        parts_el,
        next_el));
};
export default BrickComponent;
