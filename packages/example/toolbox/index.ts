import control from './control';
import data from './data';
import event from './event';
import operator from './operator';
import procedure from './procedure';

import {
  clone,
  for_each_brick,
  Brick,
} from 'froggy';

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

export const toolbox = {
  categories: init_categories(map_child(categories, 'bricks')),
  activeCategory: 'data',
};

export const atomic_button_fns = flatten(map_child(categories, 'atomic_button_fns'));
export const atomic_dropdown_menu = flatten(map_child(categories, 'atomic_dropdown_menu'));