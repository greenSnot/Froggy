import React from 'react';
import styles from '../styles/dummy.less';
export default class Input extends React.Component {
    constructor(p) {
        super(p);
        this.ref = React.createRef();
        this.input_ref = React.createRef();
    }
    render() {
        return React.createElement("div", { className: `${styles.inputValue} ${this.props.editing ? styles.editing : ''}`, ref: this.ref, onClick: (event) => {
                event.stopPropagation();
                const offset = this.props.offset();
                const mask_content = () => (React.createElement("div", { className: styles.dummyWrap, onClick: (e) => {
                        e.stopPropagation();
                        this.props.hide();
                    } },
                    React.createElement("div", { className: styles.input, style: {
                            left: offset.x,
                            top: offset.y,
                        } },
                        React.createElement("input", { style: { width: this.ref.current.clientWidth }, ref: this.input_ref, defaultValue: this.props.value, onBlur: (e) => {
                                this.ref.current.innerText = this.props.onChange(e.currentTarget.value);
                            }, onInput: (e) => {
                                this.ref.current.innerText = e.currentTarget.value;
                                this.input_ref.current.style.width = `${this.ref.current.clientWidth}px`;
                            }, onClick: ev => ev.stopPropagation() }))));
                this.props.show(mask_content(), () => {
                    this.input_ref.current.focus();
                    this.input_ref.current.value = this.props.value;
                    this.input_ref.current.style.width = `${this.ref.current.clientWidth}px`;
                });
            } }, this.props.value);
    }
}
