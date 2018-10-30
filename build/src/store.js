var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { observable } from 'mobx';
import { for_each_brick, get_global_offset, } from './util';
export default class WorkspaceStore {
    constructor({ id, root_bricks, atomic_dropdown_menu, atomic_button_fns, toolbox, workspace_on_change }) {
        this.root = {
            id: 'root',
            children: [],
        };
        this.id_to_data = {};
        this.id_to_prev = {};
        this.id_to_host = {};
        this.id_to_ref = {};
        this.ext_root = {
            id: 'root',
            children: [],
        };
        this.id_to_ext_data = {};
        this.atomic_dropdown_menu = {};
        this.atomic_button_fns = {};
        this.ui = {
            workspace_content_offset_x: 0,
            workspace_content_offset_y: 0,
            mask: {
                content: '',
                visibility: false,
            },
        };
        this.brick_on_drag_start = (e, brick, element) => {
            this.mouse_down_x = e.touches ? e.touches[0].pageX : e.pageX;
            this.mouse_down_y = e.touches ? e.touches[0].pageY : e.pageY;
            this.active_brick = brick;
            this.active_brick_element = element;
            console.log(brick);
            console.log(element);
            this.active_brick_offset = get_global_offset(element, this.workspace_ref.current);
            console.log(this.active_brick_offset);
        };
        this.detach_brick = (brick, tail = undefined, offset = {
            x: 0,
            y: 0,
        }) => {
            if (!brick.output) {
                const prev = this.id_to_prev[brick.id];
                prev.next = null;
                if (tail) {
                    const tail_next = tail.next;
                    if (tail_next) {
                        tail_next.prev = prev.id;
                        prev.next = tail_next;
                    }
                    tail.next = null;
                }
            }
            else {
                const container = this.id_to_data[brick.ui.parent];
                container.inputs = [];
                brick.ui.parent = undefined;
            }
            brick.is_root = true;
            brick.root = undefined;
            for_each_brick(brick, undefined, i => {
                i.root = brick.id;
                i.ui.is_ghost = false;
            });
            this.root.children.push(brick);
            brick.ui.offset = offset;
            return brick;
        };
        this.brick_on_drag_move = (e, brick, element) => {
            const x = e.touches ? e.touches[0].pageX : e.pageX;
            const y = e.touches ? e.touches[0].pageY : e.pageY;
            const new_offset = {
                x: this.active_brick_offset.x + (x - this.mouse_down_x),
                y: this.active_brick_offset.y + (y - this.mouse_down_y),
            };
            if (brick.is_root) {
                brick.ui.offset = new_offset;
            }
            else {
                this.detach_brick(brick, null, new_offset);
            }
        };
        this.workspace_on_mouse_down = (e) => {
        };
        this.workspace_on_mouse_move = (e) => {
            if (this.active_brick) {
                this.brick_on_drag_move(e, this.active_brick, this.active_brick_element);
            }
        };
        this.workspace_on_mouse_up = (e) => {
            this.active_brick = undefined;
        };
        this.root.children.push(...root_bricks);
        this.atomic_button_fns = atomic_button_fns;
        this.atomic_dropdown_menu = atomic_dropdown_menu;
        this.toolbox = toolbox;
    }
    on_context_menu(e, brick, element) {
    }
}
__decorate([
    observable
], WorkspaceStore.prototype, "root", void 0);
__decorate([
    observable
], WorkspaceStore.prototype, "ext_root", void 0);
__decorate([
    observable
], WorkspaceStore.prototype, "ui", void 0);
__decorate([
    observable
], WorkspaceStore.prototype, "active_brick", void 0);
