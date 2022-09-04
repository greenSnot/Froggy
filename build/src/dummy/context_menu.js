import React from 'react';
import styles from '../styles/dummy.less';
const ContextMenu = ({ blank_on_click, menu, offset }) => {
    return (React.createElement("div", { className: styles.dummyWrap, onClick: blank_on_click },
        React.createElement("div", { className: styles.contextMenu, style: {
                left: offset.x,
                top: offset.y,
            } }, Object.keys(menu).map((i) => (React.createElement("div", { className: styles.contextMenuItem, key: i, onClick: (e) => {
                e.stopPropagation();
                menu[i]();
            } }, i))))));
};
export default ContextMenu;
