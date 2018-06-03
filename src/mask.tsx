import React, { ReactElement } from 'react';

type Props = {
  className: string,
  onClick: any,
  children: any,
  mask_ref: any,
};
type State = {};
export default class Mask extends React.Component<Props, State> {
  render() {
    return <div ref={this.props.mask_ref} className={this.props.className} onClick={this.props.onClick}>
      {this.props.children}
    </div>;
  }
}