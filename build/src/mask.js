import React from 'react';
export default class Mask extends React.Component {
    render() {
        return React.createElement("div", { ref: this.props.mask_ref, className: this.props.className, onClick: this.props.onClick }, this.props.children);
    }
}
