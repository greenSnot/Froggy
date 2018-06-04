import React from 'react';
import ReactDOM from 'react-dom';

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

import Workspace from '../src/workspace';

import { clone, for_each_brick, Brick, BrickOutput } from '../src/brick';
import { gen_id } from '../src/util';

import control from './toolbox/control';
import data from './toolbox/data';
import event from './toolbox/event';
import operator from './toolbox/operator';
import procedure from './toolbox/procedure';

const categories = {
  control,
  data,
  event,
  operator,
  procedure,
};
const map_child = (j, key) => Object.keys(j).reduce(
  (m, i) => {
    m[i] = j[i][key];
    return m;
  },
  {},
);
const flatten = (i) => Object.keys(i).reduce(
  (m, j) => {
    return {...m, ...i[j]};
  },
  {},
);

const init_categories = (c: {[name: string]: Brick[]}) => {
  Object.keys(c).forEach(category => {
    const bricks = c[category];
    const result = [];
    bricks.forEach(i => {
      const brick = clone(i);
      brick.ui.offset.y = brick.ui.show_hat ? (result.length === 0 ? 20 : 30) : 20;
      brick.is_root = true;
      for_each_brick(brick, undefined, j => j.ui.is_toolbox_brick = true);
      result.push(brick);
    });
    c[category] = result;
  });
  return c;
};

const toolbox = {
  categories: init_categories(map_child(categories, 'bricks')),
  activeCategory: 'data',
};

const storage_key = 'root_bricks';
const save = (bricks: Brick[]) => {
  localStorage.setItem(storage_key, JSON.stringify(bricks));
};
const load = () => JSON.parse(localStorage.getItem(storage_key) || '[]');
const root_bricks = load();
console.log(toolbox);
console.log(root_bricks);
ReactDOM.render(
  <Workspace
    id="a"
    root_bricks={root_bricks}
    atomic_button_fns={flatten(map_child(categories, 'atomic_button_fns'))}
    atomic_dropdown_menu={flatten(map_child(categories, 'atomic_dropdown_menu'))}
    toolbox={toolbox}
    workspace_on_change={(bricks: Brick[]) => save(bricks)}
  />,
  document.getElementById('main'));