import React from 'react';
import ReactDOM from 'react-dom';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import { Brick, Workspace, WorkspaceStore } from 'froggy';

import { atomic_button_fns, atomic_dropdown_menu, toolbox } from './toolbox';

import './styles/index.less';

const storage_key = 'root_bricks';
const save = (bricks: Brick[]) => {
  localStorage.setItem(storage_key, JSON.stringify(bricks));
};
const load = () => JSON.parse(localStorage.getItem(storage_key) || '[{"id":"0.3d4aa0dikog","type":"event_run_on_click","is_root":true,"inputs":[{"type":"atomic_text","ui":{"value":"when RUN clicked","parent":"0.3d4aa0dikog","delegate":"0.3d4aa0dikog"},"root":"0.3d4aa0dikog","id":"0.aa3fjtn2k1g"}],"ui":{"show_hat":true,"offset":{"x":274,"y":122},"is_toolbox_brick":false,"is_removing":false},"next":{"type":"contorl_repeat_n_times","is_root":false,"next":null,"parts":[{"type":"control_repeat_n_times#condition","next":{"type":"contorl_repeat_n_times","is_root":false,"next":null,"parts":[{"type":"control_repeat_n_times#condition","next":null,"is_static":true,"inputs":[{"type":"atomic_text","ui":{"value":"repeat","parent":"0.4d32oh0q1u8","delegate":"0.4d32oh0q1u8","is_ghost":false},"root":"0.3d4aa0dikog","id":"0.svushfbhu78"},{"type":"container","output":2,"inputs":[],"root":"0.3d4aa0dikog","id":"0.rgq94b0juoo","ui":{"parent":"0.4d32oh0q1u8","is_ghost":false}},{"type":"atomic_text","ui":{"value":"times","parent":"0.4d32oh0q1u8","delegate":"0.4d32oh0q1u8","is_ghost":false},"root":"0.3d4aa0dikog","id":"0.079jjlv292g"}],"root":"0.3d4aa0dikog","id":"0.4d32oh0q1u8","ui":{"parent":"0.3kevgel478","delegate":"0.3kevgel478","is_ghost":false}},{"type":"control_repeat_n_times#end_repeat","is_static":true,"inputs":[{"type":"atomic_text","ui":{"value":"end repeat","parent":"0.tqi5h1pn90o","delegate":"0.tqi5h1pn90o","is_ghost":false},"root":"0.3d4aa0dikog","id":"0.38vicn056to"}],"root":"0.3d4aa0dikog","id":"0.tqi5h1pn90o","ui":{"parent":"0.3kevgel478","delegate":"0.3kevgel478","is_ghost":false}}],"root":"0.3d4aa0dikog","prev":"0.v6d4p820vrg","id":"0.3kevgel478","ui":{"offset":{"x":0,"y":0},"is_toolbox_brick":false,"is_removing":false,"is_ghost":false}},"is_static":true,"inputs":[{"type":"atomic_text","ui":{"value":"repeat","parent":"0.v6d4p820vrg","delegate":"0.v6d4p820vrg","is_ghost":false},"root":"0.3d4aa0dikog","id":"0.ecie5jc9f9g"},{"type":"container","output":2,"inputs":[{"type":"atomic_input_number","output":2,"is_root":false,"ui":{"value":1,"parent":"0.nrhcgtbli0o","offset":{"x":0,"y":0},"is_toolbox_brick":false,"is_removing":false,"is_ghost":false},"root":"0.3d4aa0dikog","id":"0.a51g7jl3cfg"}],"root":"0.3d4aa0dikog","id":"0.nrhcgtbli0o","ui":{"parent":"0.v6d4p820vrg","is_ghost":false}},{"type":"atomic_text","ui":{"value":"times","parent":"0.v6d4p820vrg","delegate":"0.v6d4p820vrg","is_ghost":false},"root":"0.3d4aa0dikog","id":"0.vt06p45j5d8"}],"root":"0.3d4aa0dikog","id":"0.v6d4p820vrg","ui":{"parent":"0.t106m5ms66g","delegate":"0.t106m5ms66g","is_ghost":false}},{"type":"control_repeat_n_times#end_repeat","is_static":true,"inputs":[{"type":"atomic_text","ui":{"value":"end repeat","parent":"0.4rlfcbqlpj","delegate":"0.4rlfcbqlpj","is_ghost":false},"root":"0.3d4aa0dikog","id":"0.4f6ujqpgugo"}],"root":"0.3d4aa0dikog","id":"0.4rlfcbqlpj","ui":{"parent":"0.t106m5ms66g","delegate":"0.t106m5ms66g","is_ghost":false}}],"root":"0.3d4aa0dikog","prev":"0.3d4aa0dikog","id":"0.t106m5ms66g","ui":{"offset":{"x":0,"y":0},"is_toolbox_brick":false,"is_removing":false,"is_ghost":false}}}]');
const root_bricks = load();
const store = new WorkspaceStore({
  id: 'a',
  root_bricks: root_bricks,
  atomic_button_fns: atomic_button_fns,
  atomic_dropdown_menu: atomic_dropdown_menu,
  toolbox: toolbox,
  workspace_on_change: (bricks: Brick[]) => save(bricks),
});
console.log(toolbox);
console.log(root_bricks);
ReactDOM.render(
  <Workspace
    store={store}
  />,
  document.getElementById('main'));