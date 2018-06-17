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
