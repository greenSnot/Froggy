var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { observable } from 'mobx';
import { get_global_offset, } from './util';
export default class WorkspaceStore {
    constructor({ id, root_bricks, atomic_dropdown_menu, atomic_button_fns, toolbox, workspace_on_change }) {
        this.root = {
            id: 'root',
            children: [],
        };
        this.id_to_data = {};
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
            const x = e.touches ? e.touches[0].pageX : e.pageX;
            const y = e.touches ? e.touches[0].pageY : e.pageY;
            this.active_brick = brick;
            this.active_brick_element = element;
        };
        this.brick_on_drag_move = (e, brick, element) => {
            if (brick.is_root) {
                brick.ui.offset = get_global_offset(element, this.workspace_ref.current);
                console.log(brick.ui);
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
