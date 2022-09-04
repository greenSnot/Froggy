import React from 'react';
window['r2'] = React;
console.log('###', React);
import styles from './styles/index.less';
import BrickComponent from './brick';
import { get_id, is_procedure_def, is_procedure_return } from './util';
import { deduplicate, flatten, for_each_brick, } from './util';
import { AtomicBrickEnum, BrickOutput, } from './types';
import { useWorkspaceEvents } from './workspace_events';
// function global_to_local(x, y, workspace: Workspace) {
//   return {
//     x: x - workspace.global_offset.x - workspace.froggy_offset.x,
//     y: y - workspace.global_offset.y - workspace.froggy_offset.y,
//   };
// }
const Workspace = ({ id, root_bricks, toolbox, atomic_button_fns, atomic_dropdown_menu, workspace_on_change, }) => {
    let active_brick_needs_removing = false;
    const froggy_ref = React.createRef();
    const toolbox_ref = React.createRef();
    const toolbox_bricks_ref = React.createRef();
    const mask_data = {
        brick_id: undefined,
        visibility: false,
        content: null,
    };
    const brick_refs = {};
    const brick_inputs_refs = {};
    const brick_parts_refs = {};
    const brick_id_to_size = {};
    let inserting_candidates = [];
    let inserting_candidates_local_offset = {};
    let active_brick_tail_id;
    let active_brick_id;
    let brick_is_inserting = false;
    let workspace_is_mouse_down = false;
    const brick_id_to_data = {};
    const brick_id_to_component = {};
    const root_brick_id_to_component = {};
    function clear_inserting_candidates() {
        inserting_candidates = [];
    }
    function update_toolbox_procedure() {
        const procedures = {};
        const procedures_with_output = {};
        root_bricks
            .filter((i) => is_procedure_def(i))
            .forEach((i) => {
            const procedure_name = i.inputs[1].inputs[0].ui.value;
            procedures[procedure_name] = [];
            for_each_brick(i, undefined, (j) => {
                if (AtomicBrickEnum[j.type] === AtomicBrickEnum.atomic_param) {
                    const param_name = j.ui.value;
                    procedures[procedure_name].push(param_name);
                }
                else if (is_procedure_return(j)) {
                    procedures_with_output[procedure_name] = true;
                }
            });
            procedures[procedure_name] = deduplicate(procedures[procedure_name]).filter((j) => j);
        });
        this.toolbox.categories.procedure.splice(2);
        Object.keys(procedures).forEach((i) => {
            const id = `procedure∫${i}`;
            this.toolbox.categories.procedure.push({
                id,
                type: "procedure",
                next: null,
                is_root: true,
                inputs: [
                    {
                        id: `procedure_text∫${i}`,
                        type: "atomic_text",
                        root: id,
                        ui: {
                            parent: id,
                            value: i,
                            is_toolbox_brick: true,
                        },
                    },
                    ...flatten(procedures[i].map((j) => [
                        {
                            id: `procedure∫${i}∫${j}`,
                            type: "atomic_text",
                            root: id,
                            ui: {
                                parent: id,
                                value: ` ${j}:`,
                                is_toolbox_brick: true,
                            },
                        },
                        {
                            id: `procedure∫${i}∫${j}∫container`,
                            type: "container",
                            output: BrickOutput.any,
                            root: id,
                            inputs: [],
                            ui: {
                                parent: id,
                                is_toolbox_brick: true,
                            },
                        },
                    ])),
                ],
                ui: {
                    is_toolbox_brick: true,
                    offset: {
                        x: 0,
                        y: 20,
                    },
                },
            });
            if (procedures_with_output[i]) {
                const id_with_output = `procedure_with_output∫${i}`;
                this.toolbox.categories.procedure.push({
                    id: id_with_output,
                    type: "procedure_with_output",
                    output: BrickOutput.any,
                    is_root: true,
                    inputs: [
                        {
                            id: `procedure_with_output_text∫${i}`,
                            type: "atomic_text",
                            root: id_with_output,
                            ui: {
                                parent: id_with_output,
                                value: i,
                                is_toolbox_brick: true,
                            },
                        },
                        ...flatten(procedures[i].map((j) => [
                            {
                                id: `procedure_with_output∫${i}∫${j}`,
                                type: "atomic_text",
                                root: id,
                                ui: {
                                    parent: id,
                                    value: ` ${j}:`,
                                    is_toolbox_brick: true,
                                },
                            },
                            {
                                id: `procedure_with_output∫${i}∫${j}∫container`,
                                type: "container",
                                output: BrickOutput.any,
                                root: id,
                                inputs: [],
                                ui: {
                                    parent: id,
                                    is_toolbox_brick: true,
                                },
                            },
                        ])),
                    ],
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
    }
    function update_inserting_candidates(current) {
        /*
        if (current.ui.show_hat) {
          return;
        }
        if (current.output) {
          inserting_candidates = Object.keys(brick_id_to_data).filter((i) => {
            const brick = brick_id_to_data[i];
            return (
              i !== current.id &&
              !brick.ui.is_toolbox_brick &&
              !(brick.root && brick_id_to_data[brick.root].ui.is_toolbox_brick) &&
              brick.root !== current.id &&
              is_container(brick) &&
              !brick.is_static &&
              (brick.output === current.output ||
                brick.output === BrickOutput.any ||
                current.output === BrickOutput.any)
            );
          });
        } else {
          inserting_candidates = Object.keys(brick_id_to_data).filter((i) => {
            const brick = brick_id_to_data[i];
            return (
              i !== current.id &&
              (brick.inputs || (brick.parts && brick.parts.length > 1)) &&
              !brick.ui.is_toolbox_brick &&
              !(brick.root && brick_id_to_data[brick.root].ui.is_toolbox_brick) &&
              brick.root !== current.id &&
              brick.next !== undefined
            );
          });
        }
        inserting_candidates.forEach((i) => {
          inserting_candidates_local_offset[i] = get_global_offset(
            brick_refs[i].current,
            froggy_ref.current
          );
        });
        */
    }
    const remove_root_brick = (brick) => {
        let root_index = 0;
        while (root_index < root_bricks.length &&
            root_bricks[root_index] !== brick) {
            ++root_index;
        }
        root_bricks.splice(root_index, 1);
    };
    const detach_brick = (id, tail_id = undefined, offset = {
        x: 0,
        y: 0,
    }) => {
        /*
        const brick = brick_id_to_data[id];
        if (!brick.output) {
          const prev = brick_id_to_data[brick.prev];
          prev.next = null;
          if (tail_id) {
            const tail = brick_id_to_data[tail_id];
            const tail_next = tail.next;
            if (tail_next) {
              tail_next.prev = prev.id;
              prev.next = tail_next;
            }
            tail.next = null;
          }
        } else {
          const container = brick_id_to_data[brick.ui.parent];
          container.inputs = [];
          brick.ui.parent = undefined;
        }
        brick.is_root = true;
        brick.root = undefined;
        for_each_brick(brick, undefined, (i) => {
          i.root = id;
          i.ui.is_ghost = false;
        });
        root_bricks.push(brick);
        brick.ui.offset = offset;
        return brick;
        */
    };
    const { workspace_ref, blocks_offset } = useWorkspaceEvents({
        initial_blocks_offset: { x: 0, y: 0 },
    });
    return (React.createElement("div", { className: styles.froggyWrap, ref: workspace_ref },
        React.createElement("div", { ref: froggy_ref, className: styles.froggy, style: {
                left: `${blocks_offset.x}px`,
                top: `${blocks_offset.y}px`,
            } },
            React.createElement("div", { className: styles.toolbox, ref: toolbox_ref, onTouchStart: (e) => e.stopPropagation(), onMouseDown: (e) => e.stopPropagation(), onWheel: (e) => e.stopPropagation(), style: {
                    left: `${-blocks_offset.x}px`,
                    top: `${-blocks_offset.y}px`,
                } },
                React.createElement("div", { className: styles.categories }, Object.keys(toolbox.categories).map((i) => (React.createElement("div", { key: i, onClick: () => {
                        // toolbox.activeCategory = i;
                        // update();
                    }, className: `${styles.category} ${i === toolbox.activeCategory ? styles.activeCategory : ""}` }, i)))),
                React.createElement("div", { className: styles.toolboxBricks, ref: toolbox_bricks_ref }, toolbox.categories[toolbox.activeCategory].map((i) => (React.createElement(BrickComponent, { key: get_id(i), data: i }))))),
            root_bricks.map((i) => (React.createElement(BrickComponent, { key: get_id(i), data: i })))),
        React.createElement("div", { className: styles.mask, style: {
                display: mask_data.visibility ? "block" : "none",
            } }, mask_data.content)));
};
export default Workspace;
// block 移动/attach/detach
// block on mouse down -> workspace listeners add mousemove, mouseup
// mouseup时清除mousemove mouseup事件
// 面板移动
// workspace listener mouse down -> workspace listeners add mousemove, mouseup
// mouseup时清除mousemove mouseup事件
