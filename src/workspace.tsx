import React, { Component } from 'react';

import { observer } from 'mobx-react';
import { observable } from 'mobx';

import styles from './styles/index.less';
import WorkspaceStore from './store';

import { RootBrickComponent } from './brick';

import {
  deduplicate,
  distance_2d,
  flatten,
  get_global_offset,
  clone,
  get_ancestor,
  for_each_brick,
  get_tail,
} from './util';

import ContextMenu from './dummy/context_menu';
import Input from './dummy/input';
import Select from './dummy/select';

const is_container = (brick) => brick.type === 'container';
const is_procedure_def = (brick) => brick.type === 'procedure_def';
const is_procedure = (brick) => brick.type === 'procedure';
const is_procedure_with_output = (brick) => brick.type === 'procedure_with_output';
const is_procedure_return = (brick) => brick.type === 'procedure_return';

type Props = {
  store: WorkspaceStore,
};
type State = {
};

@observer
export default class Workspace extends Component<Props, State> {
  workspace_ref;
  workspace_content_ref;
  workspace_toolbox_ref;
  constructor(props) {
    super(props);
    this.workspace_ref = React.createRef();
    this.workspace_content_ref = React.createRef();
    this.workspace_toolbox_ref = React.createRef();
    props.store.workspace_ref = this.workspace_ref;
  }
  render() {
    const store = this.props.store;
    return <div
      ref={this.workspace_ref}
      key={store.id}
      className={styles.workspace}
      onMouseDown={store.workspace_on_mouse_down}
      onTouchStart={store.workspace_on_mouse_down}
      onMouseMove={store.workspace_on_mouse_move}
      onTouchMove={store.workspace_on_mouse_move}
      onMouseUp={store.workspace_on_mouse_up}
      onTouchEnd={store.workspace_on_mouse_up}
    >
      <div
        ref={this.workspace_content_ref}
        className={styles.workspace_content}
        style={{
          left: `${store.ui.workspace_content_offset_x}px`,
          top: `${store.ui.workspace_content_offset_y}px`,
        }}
      >
        {store.root.children.map(i => <RootBrickComponent key={i.id} data={i} store={store}/>)}
      </div>
    </div>;
  }
}
