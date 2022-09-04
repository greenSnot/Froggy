import React, { useCallback, useRef } from 'react';
import styles from '../styles/dummy.less';
const Input = ({ value, onChange, editing, show, hide, offset }) => {
    const ref = useRef();
    const input_ref = useRef();
    const wrap_on_click = useCallback((e) => {
        e.stopPropagation();
        hide();
    }, [hide]);
    const input_on_blur = useCallback((e) => {
        ref.current.innerText = onChange(e.currentTarget.value);
    }, [onChange]);
    const input_on_input = useCallback((e) => {
        ref.current.innerText = e.currentTarget.value;
        input_ref.current.style.width = `${ref.current.clientWidth}px`;
    }, []);
    const input_text_on_click = useCallback((event) => {
        event.stopPropagation();
        const offset_ = offset();
        const mask_content = () => (React.createElement("div", { className: styles.dummyWrap, onClick: wrap_on_click },
            React.createElement("div", { className: styles.input, style: {
                    left: offset_.x,
                    top: offset_.y,
                } },
                React.createElement("input", { style: { width: ref.current.clientWidth }, ref: input_ref, defaultValue: value, onBlur: input_on_blur, onInput: input_on_input, onClick: (ev) => ev.stopPropagation() }))));
        show(mask_content(), () => {
            input_ref.current.focus();
            input_ref.current.value = value;
            input_ref.current.style.width = `${ref.current.clientWidth}px`;
        });
    }, [value, offset, show, hide]);
    return (React.createElement("div", { className: `${styles.inputValue} ${editing ? styles.editing : ""}`, ref: ref, onClick: input_text_on_click }, value));
};
export default Input;
