import React, { useCallback, useRef } from 'react';
import Workspace from '../workspace';

import styles from '../styles/dummy.less';

type Props = {
  value: any,
  onChange: Function,
  editing: boolean,
  show: Function,
  hide: Function,
  offset: Function,
};
type State = {
  value: any,
};
const Input = ({ value, onChange, editing, show, hide, offset }: Props) => {
  const ref = useRef<HTMLDivElement>();
  const input_ref = useRef<HTMLInputElement>();

  const wrap_on_click = useCallback(
    (e) => {
      e.stopPropagation();
      hide();
    },
    [hide]
  );

  const input_on_blur = useCallback(
    (e) => {
      ref.current!.innerText = onChange(e.currentTarget.value);
    },
    [onChange]
  );

  const input_on_input = useCallback((e) => {
    ref.current.innerText = e.currentTarget.value;
    input_ref.current.style.width = `${ref.current.clientWidth}px`;
  }, []);

  const input_text_on_click = useCallback((event) => {
    event.stopPropagation();
    const offset_ = offset();
    const mask_content = () => (
      <div className={styles.dummyWrap} onClick={wrap_on_click}>
        <div
          className={styles.input}
          style={{
            left: offset_.x,
            top: offset_.y,
          }}
        >
          <input
            style={{ width: ref.current!.clientWidth }}
            ref={input_ref}
            defaultValue={value}
            onBlur={input_on_blur}
            onInput={input_on_input}
            onClick={(ev) => ev.stopPropagation()}
          />
        </div>
      </div>
    );
    show(mask_content(), () => {
      input_ref.current.focus();
      input_ref.current.value = value;
      input_ref.current.style.width = `${ref.current.clientWidth}px`;
    });
  }, [value, offset, show, hide]);

  return (
    <div
      className={`${styles.inputValue} ${editing ? styles.editing : ""}`}
      ref={ref}
      onClick={input_text_on_click}
    >
      {value}
    </div>
  );
};

export default Input;