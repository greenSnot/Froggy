import React, { ReactElement, ReactHTMLElement, useCallback, useEffect, useRef } from 'react';

import styles from '../styles/index.less';

import { useAppSelector, useAppDispatch } from '../app/hooks';
import { reset, selectAll, setActiveToolbox } from "../brick/brickSlice";

import { Provider } from 'react-redux';
import { store } from '../app/store';
import BrickComponent from '../brick';
import { get_id, is_container, is_procedure_def, is_procedure_return, update_path } from '../util';
import {
  deduplicate,
  distance_2d,
  flatten,
  get_global_offset,
  clone_brick,
  for_each_brick,
  get_tail,
} from '../util';

import {
  Brick,
  AtomicBrickEnum,
  DragData,
  BrickOutput,
} from '../types';

import { useWorkspaceEvents } from './events';
import { Context } from '../context';
import { useBrickEvents } from '../brick/events';

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

// function global_to_local(x, y, workspace: Workspace) {
//   return {
//     x: x - workspace.global_offset.x - workspace.froggy_offset.x,
//     y: y - workspace.global_offset.y - workspace.froggy_offset.y,
//   };
// }

const Workspace = (props: Props) => {
  const { atomic_button_fns, atomic_dropdown_menu } = props;
  const toolbox_ref = useRef<HTMLDivElement>();
  const toolbox_bricks_ref = useRef<HTMLDivElement>();
  const { bricks, toolbox } = useAppSelector(selectAll);

  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(
      reset({
        atomic_dropdown_menu: props.atomic_dropdown_menu,
        blocks_offset: { x: 0, y: 0 },
        toolbox: {
          categories: Object.keys(props.toolbox.categories).reduce((m, i) => {
            m[i] = props.toolbox.categories[i].map((j, idx) =>
              update_path(
                clone_brick(j, {
                  remove_toolbox_flag: false,
                  tail_relative_path: [],
                }),
                [idx]
              )
            );
            return m;
          }, {}),
          activeCategory: props.toolbox.activeCategory,
        },
        bricks: props.root_bricks
          .map((i) => clone_brick(i))
          .map((i, idx) => update_path(i, [idx])),
      })
    );
  }, [props, dispatch]);

  const mask_data = {
    brick_id: undefined,
    visibility: false,
    content: null,
  };

  let inserting_candidates = [];
  let inserting_candidates_local_offset = {};

  function update_toolbox_procedure() {
    /*
    const procedures = {};
    const procedures_with_output = {};
    bricks
      .filter((i) => is_procedure_def(i))
      .forEach((i) => {
        const procedure_name = i.inputs[1].inputs[0].ui.value;
        procedures[procedure_name] = [];
        for_each_brick(i, undefined, (j) => {
          if (
            (AtomicBrickEnum[j.type] as any) === AtomicBrickEnum.atomic_param
          ) {
            const param_name = j.ui.value;
            procedures[procedure_name].push(param_name);
          } else if (is_procedure_return(j)) {
            procedures_with_output[procedure_name] = true;
          }
        });
        procedures[procedure_name] = deduplicate(
          procedures[procedure_name]
        ).filter((j) => j);
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
          ...flatten(
            procedures[i].map((j) => [
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
            ])
          ),
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
        toolbox.categories.procedure.push({
          type: "procedure_with_output",
          output: BrickOutput.any,
          is_root: true,
          inputs: [
            {
              id: `procedure_with_output_text∫${i}`,
              type: "atomic_text",
              ui: {
                value: i,
                is_toolbox_brick: true,
              },
            },
            ...flatten(
              procedures[i].map((j) => [
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
              ])
            ),
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
    */
  }

  const {
    workspace_ref,
    blocks_offset,
    froggy_ref,
    workspace_on_mouse_down,
    workspace_on_wheel,
  } = useWorkspaceEvents();
  const { brick_on_context_menu, brick_on_drag_start } =
    useBrickEvents(workspace_ref, froggy_ref, toolbox_bricks_ref);

  return (
    <Context.Provider
      value={{
        atomic_button_fns,
        atomic_dropdown_menu,
        brick_on_drag_start,
        brick_on_context_menu,
      }}
    >
      <div
        className={styles.froggyWrap}
        ref={workspace_ref}
        onWheel={workspace_on_wheel}
        onMouseDown={workspace_on_mouse_down}
      >
        <div
          ref={froggy_ref}
          className={styles.froggy}
          style={{
            left: `${blocks_offset.x}px`,
            top: `${blocks_offset.y}px`,
          }}
        >
          <div
            className={styles.toolbox}
            ref={toolbox_ref}
            onTouchStart={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            style={{
              left: `${-blocks_offset.x}px`,
              top: `${-blocks_offset.y}px`,
            }}
          >
            <div className={styles.categories}>
              {Object.keys(toolbox.categories).map((i) => (
                <div
                  key={i}
                  onClick={() => {
                    dispatch(setActiveToolbox(i));
                  }}
                  className={`${styles.category} ${
                    i === toolbox.activeCategory ? styles.activeCategory : ""
                  }`}
                >
                  {i}
                </div>
              ))}
            </div>
            <div className={styles.toolboxBricks} ref={toolbox_bricks_ref}>
              {(toolbox.categories[toolbox.activeCategory] || []).map((i, idx) => (
                <BrickComponent key={get_id(i)} data={i} />
              ))}
            </div>
          </div>
          {bricks.map((i, idx) => (
            <BrickComponent key={get_id(i)} data={i} />
          ))}
        </div>
        <div
          className={styles.mask}
          style={{
            display: mask_data.visibility ? "block" : "none",
          }}
        >
          {mask_data.content}
        </div>
      </div>
    </Context.Provider>
  );
};

const WorkspaceWrap = ({
  id,
  root_bricks,
  toolbox,
  atomic_button_fns,
  atomic_dropdown_menu,
  workspace_on_change,
}: Props) => {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <Workspace
          workspace_on_change={workspace_on_change}
          id={id}
          root_bricks={root_bricks}
          toolbox={toolbox}
          atomic_button_fns={atomic_button_fns}
          atomic_dropdown_menu={atomic_dropdown_menu}
        />
      </Provider>
    </React.StrictMode>
  );
}

export default WorkspaceWrap;

// block 移动/attach/detach
// block on mouse down -> workspace listeners add mousemove, mouseup
// mouseup时清除mousemove mouseup事件

// 面板移动
// workspace listener mouse down -> workspace listeners add mousemove, mouseup
// mouseup时清除mousemove mouseup事件