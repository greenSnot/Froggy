import React from 'react';

import styles from '../styles/dummy.less';

type Props = {
  blank_on_click: any,
  menu: {[key: string]: Function},
  offset: {
    x: number,
    y: number,
  },
};
type State = {};
const ContextMenu  = ({
  blank_on_click,menu,offset
}:Props)=> {
  return (
    <div className={styles.dummyWrap} onClick={blank_on_click}>
      <div
        className={styles.contextMenu}
        style={{
          left: offset.x,
          top: offset.y,
        }}
      >
        {Object.keys(menu).map((i) => (
          <div
            className={styles.contextMenuItem}
            key={i}
            onClick={(e) => {
              e.stopPropagation();
              menu[i]();
            }}
          >
            {i}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ContextMenu;