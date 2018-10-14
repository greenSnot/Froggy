import React from 'react';
import styles from '../styles/dummy.less';
export default class Select extends React.Component {
    render() {
        const { options, value } = this.props;
        let key;
        Object.keys(options).forEach(i => {
            if (options[i] === value) {
                key = i;
            }
        });
        return React.createElement("div", { className: styles.selectValue, onClick: (e) => {
                e.stopPropagation();
                const offset = this.props.offset();
                this.props.show(React.createElement("div", { className: styles.dummyWrap, onClick: (e) => {
                        e.stopPropagation();
                        this.props.hide();
                    } },
                    React.createElement("div", { className: styles.select, style: {
                            left: offset.x,
                            top: offset.y,
                        } },
                        React.createElement("div", { className: styles.optionWrap, onWheel: (e) => e.stopPropagation() }, Object.keys(options).map(i => React.createElement("div", { key: i, className: `${styles.option} ${i === key ? styles.selected : ''}`, onClick: () => {
                                this.props.onChange(options[i]);
                            } }, i))))));
            } }, key);
    }
}
