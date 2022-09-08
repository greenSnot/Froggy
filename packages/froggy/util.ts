import {
  Brick,
  BrickId,
} from './types';

export const gen_id = () => Math.random().toString(32);

export const get_global_offset = (d: HTMLElement, root = document.body) => {
  let offset_x = 0;
  let offset_y = 0;
  while (d && d !== root) {
    offset_x += d.offsetLeft;
    offset_y += d.offsetTop;
    d = d.offsetParent as HTMLElement;
  }
  return {
    x: offset_x,
    y: offset_y,
  };
};

export const distance_2d = (x1, y1, x2, y2) => Math.pow((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2), 0.5);

export const deduplicate = (arr) => {
  const t = {};
  arr.forEach(i => t[i] = true);
  return Object.keys(t);
};

export const flatten = (i) => {
  const res = [];
  i.forEach(j => res.push(...j));
  return res;
};

export const deep_clone = (x) => {
  const do_deep_clone = (t) => {
    if (t instanceof Array) {
      return t.map((i) => do_deep_clone(i));
    } else if (typeof t === "object" && t != null) {
      return Object.keys(t).reduce((m, i) => {
        m[i] = do_deep_clone(t[i]);
        return m;
      }, {});
    }
    return t;
  };
  return do_deep_clone(x);
};

export const clone_brick = (
  brick: Brick,
  {
    remove_toolbox_flag,
    tail_relative_path,
  }: {
    remove_toolbox_flag: boolean;
    tail_relative_path?: string[];
  } = {
    remove_toolbox_flag: true,
    tail_relative_path: undefined,
  }
) => {
  const do_clone = (b: Brick, depth = 0) => {
    const res = {
      ...b,
      parts: b.parts ? b.parts.map((i) => do_clone(i, -Infinity)) : undefined,
      inputs: b.inputs ? b.inputs.map((i) => do_clone(i, -Infinity)) : undefined,
    } as Brick;
    res.ui = {
      ...b.ui,
    };
    remove_toolbox_flag && delete res.ui.is_toolbox_brick;
    delete res.ui.is_removing;
    delete res.ui.is_ghost;
    if (b.next !== undefined) {
      res.next =
        b.next === null || (tail_relative_path && depth == tail_relative_path.length)
          ? null
          : do_clone(b.next, depth + 1);
    }
    return res;
  };
  const root_brick = do_clone(brick);
  root_brick.ui.offset = {
    x: root_brick.ui.offset?.x || 0,
    y: root_brick.ui.offset?.y || 0,
  };
  root_brick.is_root = true;
  return root_brick as Brick;
};

export const get_tail = (b: Brick) => {
  let tail = b;
  while (tail.next) {
    tail = tail.next;
  }
  return tail;
};

export const for_each_brick = (
  b: Brick,
  tail: Brick,
  cb: Function,
  range: {
    inputs?: boolean,
    parts?: boolean,
    next?: boolean,
  } = {
    inputs: true,
    parts: true,
    next: true,
  }) => {
  const for_each_child_brick = (brick: Brick) => {
    cb(brick);
    range.inputs && brick.inputs && brick.inputs.forEach(i => for_each_child_brick(i));
    range.parts && brick.parts && brick.parts.forEach(i => for_each_child_brick(i));
    if (tail && get_id(brick) === get_id(tail)) {
      return;
    }
    range.next && brick.next && for_each_child_brick(brick.next);
  };
  for_each_child_brick(b);
};

export const is_container = (brick: Brick) => brick.type === 'container';
export const is_procedure_def = (brick: Brick) => brick.type === 'procedure_def';
export const is_procedure = (brick: Brick) => brick.type === 'procedure';
export const is_procedure_with_output = (brick: Brick) => brick.type === 'procedure_with_output';
export const is_procedure_return = (brick: Brick) => brick.type === 'procedure_return';
export const get_id = (brick: Brick) => {
 return `${brick.ui.is_toolbox_brick ? 'toolbox' : 'workspace'}_${brick.path.join('-')}`;
}
export const to_id = (path: string[], scope: 'toolbox' | 'workspace') => {
 return `${scope}_${path.join('-')}`;
}

export function update_path(brick: Brick, default_path = []) {
  const s = (brick: Brick, path) => {
    brick.path = path;
    brick.inputs && brick.inputs.forEach((i, idx) => s(i, [...path, 'inputs', idx.toString()]));
    brick.parts && brick.parts.forEach((i, idx) => s(i, [...path, 'parts', idx.toString()]));
    brick.next && s(brick.next, [...path, 'next']);
  };
  s(brick, default_path);
  return brick;
}