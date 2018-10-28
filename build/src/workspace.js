var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import React, { Component } from 'react';
import { observer } from 'mobx-react';
import styles from './styles/index.less';
import { RootBrickComponent } from './brick';
const is_container = (brick) => brick.type === 'container';
const is_procedure_def = (brick) => brick.type === 'procedure_def';
const is_procedure = (brick) => brick.type === 'procedure';
const is_procedure_with_output = (brick) => brick.type === 'procedure_with_output';
const is_procedure_return = (brick) => brick.type === 'procedure_return';
let Workspace = class Workspace extends Component {
    constructor(props) {
        super(props);
        this.workspace_ref = React.createRef();
        this.workspace_content_ref = React.createRef();
        this.workspace_toolbox_ref = React.createRef();
        props.store.workspace_ref = this.workspace_ref;
    }
    render() {
        const store = this.props.store;
        return React.createElement("div", { ref: this.workspace_ref, key: store.id, className: styles.workspace, onMouseDown: store.workspace_on_mouse_down, onTouchStart: store.workspace_on_mouse_down, onMouseMove: store.workspace_on_mouse_move, onTouchMove: store.workspace_on_mouse_move, onMouseUp: store.workspace_on_mouse_up, onTouchEnd: store.workspace_on_mouse_up },
            React.createElement("div", { ref: this.workspace_content_ref, className: styles.workspace_content, style: {
                    left: `${store.ui.workspace_content_offset_x}px`,
                    top: `${store.ui.workspace_content_offset_y}px`,
                } }, store.root.children.map(i => React.createElement(RootBrickComponent, { key: i.id, data: i, store: store }))));
    }
};
Workspace = __decorate([
    observer
], Workspace);
export default Workspace;
