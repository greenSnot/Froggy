export const gen_id = () => Math.random().toString(32);
export const get_global_offset = (d, root = document.body) => {
    let offset_x = 0;
    let offset_y = 0;
    while (d && d !== root) {
        offset_x += d.offsetLeft;
        offset_y += d.offsetTop;
        d = d.offsetParent;
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
export const get_ancestor = (bricks, brick) => {
    let ancestor = brick;
    while (ancestor.ui.parent) {
        ancestor = bricks[ancestor.ui.parent];
    }
    return ancestor;
};
export const clone = (brick, with_ui = true) => {
    let root;
    const do_clone = (b, prev, parent = undefined) => {
        const id = gen_id();
        root = root || id;
        const res = Object.assign({}, b, { parts: b.parts ? b.parts.map(i => do_clone(i, undefined, id)) : undefined, inputs: b.inputs ? b.inputs.map(i => do_clone(i, undefined, id)) : undefined, root, prev: b.output ? undefined : prev, id });
        if (with_ui) {
            res.ui = Object.assign({}, b.ui, { parent: parent, delegate: b.output ? undefined : parent });
            delete res.ui.is_toolbox_brick;
            delete res.ui.is_removing;
            delete res.ui.is_ghost;
        }
        if (b.next !== undefined) {
            res.next = b.next === null ? null : do_clone(b.next, id);
        }
        return res;
    };
    const root_brick = do_clone(brick, undefined);
    root_brick.root = undefined;
    root_brick.ui.offset = {
        x: 0,
        y: 0,
    };
    root_brick.is_root = true;
    return root_brick;
};
export const get_tail = (b) => {
    let tail = b;
    while (tail.next) {
        tail = tail.next;
    }
    return tail;
};
export const for_each_brick = (b, tail, cb, range = {
    inputs: true,
    parts: true,
    next: true,
}) => {
    const for_each_child_brick = (brick) => {
        cb(brick);
        range.inputs && brick.inputs && brick.inputs.forEach(i => for_each_child_brick(i));
        range.parts && brick.parts && brick.parts.forEach(i => for_each_child_brick(i));
        if (tail && brick.id === tail.id) {
            return;
        }
        range.next && brick.next && for_each_child_brick(brick.next);
    };
    for_each_child_brick(b);
};
