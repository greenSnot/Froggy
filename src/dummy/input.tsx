import React from 'react';
import Workspace from '../workspace';

import styles from '../styles/dummy.less';

type Props = {
  value: any,
  onChange: Function,
  editing: boolean,
  show: Function,
  hide: Function,
  offset: Function,
};
type State = {
  value: any,
};
export default class Input extends React.Component<Props, State> {
  ref;
  input_ref;
  constructor(p) {
    super(p);
    this.ref = React.createRef();
    this.input_ref = React.createRef();
  }
  render() {
    return <div
      className={`${styles.inputValue} ${this.props.editing ? styles.editing : ''}` }
      ref={this.ref}
      onClick={(event) => {
        event.stopPropagation();
        const offset = this.props.offset();
        const mask_content = () => (
          <div
            className={styles.dummyWrap}
            onClick={(e) => {
              e.stopPropagation();
              this.props.hide();
            }}
          >
            <div
              className={styles.input}
              style={{
                left: offset.x,
                top: offset.y,
              }}
            >
              <input
                style={{ width: this.ref.current.clientWidth }}
                ref={this.input_ref}
                defaultValue={this.props.value}
                onBlur={(e) => {
                  this.ref.current.innerText = this.props.onChange(e.currentTarget.value);
                }}
                onInput={(e) => {
                  this.ref.current.innerText = e.currentTarget.value;
                  this.input_ref.current.style.width = `${this.ref.current.clientWidth}px`;
                }}
                onClick={ev => ev.stopPropagation()} />
            </div>
         </div>);
        this.props.show(mask_content(), () => {
          this.input_ref.current.focus();
          this.input_ref.current.value = this.props.value;
          this.input_ref.current.style.width = `${this.ref.current.clientWidth}px`;
        });
      }}
    >{this.props.value}</div>;
  }
}