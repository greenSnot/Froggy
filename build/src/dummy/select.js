import React from 'react';
import styles from '../styles/dummy.less';
const Select = ({ onChange, show, hide, offset, value, options }) => {
    let key;
    Object.keys(options).forEach((i) => {
        if (options[i] === value) {
            key = i;
        }
    });
    return (React.createElement("div", { className: styles.selectValue, onClick: (e) => {
            e.stopPropagation();
            const offset_ = offset();
            show(React.createElement("div", { className: styles.dummyWrap, onClick: (e) => {
                    e.stopPropagation();
                    hide();
                } },
                React.createElement("div", { className: styles.select, style: {
                        left: offset_.x,
                        top: offset_.y,
                    } },
                    React.createElement("div", { className: styles.optionWrap, onWheel: (e) => e.stopPropagation() }, Object.keys(options).map((i) => (React.createElement("div", { key: i, className: `${styles.option} ${i === key ? styles.selected : ""}`, onClick: () => {
                            onChange(options[i]);
                        } }, i)))))));
        } }, key));
};
export default Select;
