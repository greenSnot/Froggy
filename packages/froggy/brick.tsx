import React, { ReactElement, useCallback, useContext, useRef } from "react";
import ContextMenu from "./dummy/context_menu";
import Input from "./dummy/input";
import Select from "./dummy/select";
import { DragEvent, MouseEvent, TouchEvent } from "react";
import {
  Brick,
  BrickOutput,
  BrickId,
  BrickDragEvent,
  AtomicBrickEnum,
} from "./types";
import styles from "./styles/brick.less";
import { get_id, is_container } from "./util";

type Props = {
  data: Brick;
};

const BrickComponent = ({ data }: Props) => {
  const { path } = data;
  const id = get_id(data);
  const self_is_container = is_container(data);

  const on_drag_start: (e: BrickDragEvent) => void = () => {};
  const on_context_menu: (e: BrickDragEvent) => void = () => {};
  const atomic_dropdown_menu: { [id: string]: { [name: string]: any } } = {};

  const on_touch_start = useCallback(
    (e: TouchEvent<HTMLDivElement>) => {
      if (self_is_container) {
        return;
      }
      e.stopPropagation();
      on_drag_start({
        id: id,
        mouse_global_x: e.touches[0].pageX,
        mouse_global_y: e.touches[0].pageY,
      });
    },
    [on_drag_start, id, self_is_container]
  );

  const on_mouse_down = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
      if (self_is_container) {
        return;
      }
      e.stopPropagation();
      on_drag_start({
        id: id,
        mouse_global_x: e.pageX,
        mouse_global_y: e.pageY,
      });
    },
    [on_drag_start, id, self_is_container]
  );

  const fn_on_context_menu = useCallback(
    (e: MouseEvent<HTMLDivElement>) => {
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
    },
    [on_context_menu, id, self_is_container]
  );

  if (AtomicBrickEnum[data.type]) {
    if (data.type === "atomic_text") {
      return (
        <div key={id} className={styles.atomicText}>
          {data.ui.value[0] === " " ? (
            <div className={styles.atomicTextIndent} />
          ) : null}
          {data.ui.value}
        </div>
      );
    }
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
    return typeToInstance[data.type]();
  }

  const events = {
    onTouchStart: on_touch_start,
    onMouseDown: on_mouse_down,
    onContextMenu: fn_on_context_menu,
  };

  const inputs_el = data.inputs.length ? (
    <div
      {...events}
      className={`${styles.inputs} ${data.ui.show_hat ? styles.hat : ""}`}
    >
      {data.inputs.map((i) => (
        <BrickComponent key={get_id(i)} data={i} />
      ))}
    </div>
  ) : null;
  const parts_el = data.parts.length ? (
    <div className={styles.parts}>
      {data.parts.map((i) => (
        <BrickComponent data={i} key={get_id(i)} />
      ))}
    </div>
  ) : null;
  const next_el = data.next ? (
    <div className={styles.next}>
      <BrickComponent data={data.next} key={get_id(data.next)} />
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
          ? `${styles.output} ${styles[BrickOutput[data.output]]}`
          : ""
      } ${data.ui.is_removing ? styles.removing : ""} ${
        self_is_container ? styles.container : ""
      }  ${data.ui.is_ghost ? styles.ghost : ""}`}
      data-id={id}
      {...events}
    >
      {inputs_el}
      {parts_el}
      {next_el}
    </div>
  );
};

export default BrickComponent;
