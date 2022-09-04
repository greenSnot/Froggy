import React from 'react';
window['r1']=React;
console.log('##', '#', window['r1'] == window['r2'])
import {createRoot} from 'react-dom/client';

import { Brick, Workspace } from 'froggy';

import { atomic_button_fns, atomic_dropdown_menu, toolbox } from './toolbox';

import './styles/index.less';

const storage_key = 'root_bricks';
const save = (bricks: Brick[]) => {
  localStorage.setItem(storage_key, JSON.stringify(bricks));
};
const load = () => JSON.parse(localStorage.getItem(storage_key) || '[]');
const root_bricks = load();
console.log(toolbox);
console.log(root_bricks);
createRoot(document.getElementById("main")).render(
  <Workspace
    id="a"
    root_bricks={root_bricks}
    atomic_button_fns={atomic_button_fns}
    atomic_dropdown_menu={atomic_dropdown_menu}
    toolbox={toolbox}
    workspace_on_change={(bricks: Brick[]) => save(bricks)}
  />
);