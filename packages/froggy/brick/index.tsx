import React, { ReactElement, useCallback, useContext, useRef } from "react";
import ContextMenu from "../dummy/context_menu";
import Input from "../dummy/input";
import Select from "../dummy/select";
import { MouseEvent, TouchEvent } from "react";
import {
  Brick,
  BrickOutput,
  BrickId,
  DragData,
  AtomicBrickEnum,
} from "../types";
import styles from "../styles/brick.less";
import { get_id, is_container } from "../util";
import { Context } from "../context";
import { useAppDispatch, useAppSelector } from "../app/hooks";

type Props = {
  data: Brick;
  interactable_parent?: Brick;
};

const BrickComponent = ({ data, interactable_parent }: Props) => {
  const { path } = data;
  const id = get_id(data);
  const self_is_container = is_container(data);

  const {
    atomic_dropdown_menu,
    atomic_button_fns,
    brick_on_drag_start,
    brick_on_context_menu,
  } = useContext(Context);

  const dispatch = useAppDispatch();
  const interactable_brick = data.ui.is_toolbox_brick
    ? data.is_root
      ? data
      : interactable_parent
    : data.is_static
    ? interactable_parent
    : AtomicBrickEnum[data.type]
    ? interactable_parent
    : data;
  const on_mouse_down = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.stopPropagation();
      console.log('b d')
      brick_on_drag_start({
        brick: interactable_brick,
        mouse_global_x: e.pageX,
        mouse_global_y: e.pageY,
      });
    },
    [interactable_brick, brick_on_drag_start]
  );

  const fn_on_context_menu = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      brick_on_context_menu({
        brick: interactable_brick,
        mouse_global_x: e.pageX,
        mouse_global_y: e.pageY,
      });
    },
    [brick_on_context_menu, interactable_brick]
  );

  let atomic_el = null;
  if (AtomicBrickEnum[data.type]) {
    if (data.type === "atomic_text") {
      atomic_el = (
        <div key={id} className={styles.atomicText}>
          {data.ui.value[0] === " " ? (
            <div className={styles.atomicTextIndent} />
          ) : null}
          {data.ui.value}
        </div>
      );
    } else {
      const basic_fns = {
        onChange: (value) => {
          if (data.output === BrickOutput.number) {
            data.ui.value = parseFloat(value) || 0;
          } else {
            data.ui.value = value;
          }
          return data.ui.value;
        },
        show: (content, cb?) => {
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
      const select_fns = {
        ...basic_fns,
        offset: () => {
          // const offset = get_global_offset(
          //   workspace.brick_refs[brick.id].current
          // );
          // offset.y += 40;
          // return offset;
          return { x: 0, y: 0 };
        },
      };
      const input_fns = {
        ...basic_fns,
        offset: () => {
          // const offset = get_global_offset(
          //   workspace.brick_refs[brick.id].current
          // );
          // offset.x++;
          // offset.y++;
          // return offset;
          return { x: 0, y: 0 };
        },
      };
      const typeToInstance = {
        atomic_input_string: () => (
          <Input
            value={data.ui.value.toString()}
            {...input_fns}
            editing={
              false
              // workspace.mask_data.visibility &&
              // workspace.mask_data.brick_id === brick.id
            }
          />
        ),
        atomic_input_number: () => typeToInstance.atomic_input_string(),
        atomic_dropdown: () => (
          <Select
            value={data.ui.value}
            options={atomic_dropdown_menu[data.ui.dropdown]}
            {...select_fns}
          />
        ),
        atomic_boolean: () => typeToInstance.atomic_dropdown(),
        atomic_button: () => (
          <div key={id} className={styles.atomicButtonWrap}>
            <div
              className={data.ui.className}
              onClick={(e) => {
                e.stopPropagation();
                // atomic_button_fns[brick.ui.value](
                //   workspace.brick_id_to_data,
                //   brick,
                //   () =>
                //     workspace.update(() => workspace.root_bricks_on_change())
                // );
              }}
            />
          </div>
        ),
        atomic_param: () => (
          <div key={id} className={styles.atomicParam}>
            {data.ui.value}
          </div>
        ),
      };
      atomic_el = typeToInstance[data.type]();
    }
  }

  const events = {
    onMouseDown: on_mouse_down,
    onContextMenu: fn_on_context_menu,
  };

  const inputs_el = data.inputs && data.inputs.length ? (
    <div
      {...events}
      className={`${styles.inputs} ${data.ui.show_hat ? styles.hat : ""}`}
    >
      {data.inputs.map((i) => (
        <BrickComponent key={get_id(i)} data={i} interactable_parent={interactable_brick} />
      ))}
    </div>
  ) : null;
  const parts_el = data.parts && data.parts.length ? (
    <div className={styles.parts}>
      {data.parts.map((i) => (
        <BrickComponent data={i} key={get_id(i)} interactable_parent={interactable_brick} />
      ))}
    </div>
  ) : null;
  const next_el = data.next ? (
    <div className={styles.next}>
      <BrickComponent data={data.next} key={get_id(data.next)} interactable_parent={interactable_brick} />
    </div>
  ) : null;
  return (
    <div
      style={{
        marginLeft: `${(data.ui.offset && data.ui.offset.x) || 0}px`,
        marginTop: `${(data.ui.offset && data.ui.offset.y) || 0}px`,
      }}
      className={`${styles.wrap} ${
        data.output
          ? `${styles.output} ${styles[`output_${BrickOutput[data.output]}`]}`
          : ""
      } ${data.ui.is_removing ? styles.removing : ""} ${
        self_is_container ? styles.container : ""
      }  ${data.ui.is_ghost ? styles.ghost : ""}`}
      id={id}
      {...events}
    >
      {inputs_el}
      {parts_el}
      {next_el}
      {atomic_el}
    </div>
  );
};

export default BrickComponent;
