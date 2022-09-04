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
const Select = ({ onChange, show, hide, offset, value, options }: Props) => {
  let key;
  Object.keys(options).forEach((i) => {
    if (options[i] === value) {
      key = i;
    }
  });
  return (
    <div
      className={styles.selectValue}
      onClick={(e) => {
        e.stopPropagation();
        const offset_ = offset();
        show(
          <div
            className={styles.dummyWrap}
            onClick={(e) => {
              e.stopPropagation();
              hide();
            }}
          >
            <div
              className={styles.select}
              style={{
                left: offset_.x,
                top: offset_.y,
              }}
            >
              <div
                className={styles.optionWrap}
                onWheel={(e) => e.stopPropagation()}
              >
                {Object.keys(options).map((i) => (
                  <div
                    key={i}
                    className={`${styles.option} ${
                      i === key ? styles.selected : ""
                    }`}
                    onClick={() => {
                      onChange(options[i]);
                    }}
                  >
                    {i}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );
      }}
    >
      {key}
    </div>
  );
};

export default Select;