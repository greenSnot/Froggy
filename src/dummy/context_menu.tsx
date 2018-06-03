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
export default class Input extends React.Component<Props, State> {
  render() {
    const data = this.props.menu;
    return <div
      className={styles.dummyWrap}
      onClick={this.props.blank_on_click}
    >
      <div
        className={styles.contextMenu}
        style={{
          left: this.props.offset.x,
          top: this.props.offset.y,
        }}
      >
        {
          Object.keys(data).map(i => (
            <div
              className={styles.contextMenuItem}
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                data[i]();
              }}
            >
              {i}
            </div>
          ))
        }
      </div>
    </div>;
  }
}