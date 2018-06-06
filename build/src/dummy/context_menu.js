import React from 'react';
import styles from '../styles/dummy.less';
export default class Input extends React.Component {
    render() {
        const data = this.props.menu;
        return React.createElement("div", { className: styles.dummyWrap, onClick: this.props.blank_on_click },
            React.createElement("div", { className: styles.contextMenu, style: {
                    left: this.props.offset.x,
                    top: this.props.offset.y,
                } }, Object.keys(data).map(i => (React.createElement("div", { className: styles.contextMenuItem, key: i, onClick: (e) => {
                    e.stopPropagation();
                    data[i]();
                } }, i)))));
    }
}
