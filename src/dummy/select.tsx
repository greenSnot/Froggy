import React from 'react';
import Workspace from '../workspace';

import { get_global_offset } from '../util';

import styles from '../styles/dummy.less';

type Props = {
  value: any,
  options: {[key: string]: any},
  onChange: Function,
  show: Function,
  hide: Function,
  offset: () => {
    x: number,
    y: number,
  },
};
type State = {
  value: any,
};
export default class Select extends React.Component<Props, State> {
  render() {
    const { options, value } = this.props;
    let key;
    Object.keys(options).forEach(i => {
      if (options[i] === value) {
        key = i;
      }
    });
    return <div className={styles.selectValue} onClick={(e) => {
      e.stopPropagation();
      const offset = this.props.offset();
      this.props.show(
        <div
          className={styles.dummyWrap}
          onClick={(e) => {
            e.stopPropagation();
            this.props.hide();
          }}
        >
          <div
            className={styles.select}
            style={{
              left: offset.x,
              top: offset.y,
            }}
          >
            <div
              className={styles.optionWrap}
              onWheel={(e) => e.stopPropagation()}
            >
            {Object.keys(options).map(i => <div
              key={i}
              className={`${styles.option} ${i === key ? styles.selected : ''}`}
              onClick={() => {
                this.props.onChange(options[i]);
              }}
            >{i}</div>)}
            </div>
          </div>
        </div>,
      );
    }}>{key}</div>;
  }
}
