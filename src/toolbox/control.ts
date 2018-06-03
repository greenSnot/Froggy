import { Brick, BrickOutput } from '../brick';
import { gen_id } from '../util';

import { atomicButtonAdd, atomicButtonRemove } from '../styles/brick.less';

const bricks: Brick[] = [
  {
    id: 'if',
    type: 'control_if',
    is_root: true,
    next: null,
    parts: [
      {
        type: 'control_if#if',
        is_static: true,
        next: null,
        inputs: [
          {
            type: 'atomic_text',
            ui: {
              value: 'if',
            },
          },
          {
            type: 'container',
            output: BrickOutput.boolean,
            inputs: [],
          },
          {
            type: 'atomic_button',
            is_static: true,
            ui: {
              className: atomicButtonAdd,
              value: 'control_if_btn_add',
            },
          },
          {
            type: 'atomic_button',
            is_static: true,
            ui: {
              className: atomicButtonRemove,
              value: 'control_if_btn_remove',
            },
          },
        ],
      },
      {
        type: 'control_if#end_if',
        is_static: true,
        inputs: [
          {
            type: 'atomic_text',
            ui: {
              value: 'end if',
            },
          },
        ],
      },
    ],
  },
  {
    type: 'control_wait',
    is_root: true,
    next: null,
    inputs: [
      {
        type: 'atomic_text',
        ui: {
          value: 'wait',
        },
      },
      {
        type: 'container',
        output: BrickOutput.number,
        inputs: [],
      },
      {
        type: 'atomic_text',
        ui: {
          value: 'secs',
        },
      },
    ],
  },
  {
    type: 'contorl_repeat_n_times',
    is_root: true,
    next: null,
    parts: [
      {
        type: 'control_repeat_n_times#condition',
        next: null,
        is_static: true,
        inputs: [
          {
            type: 'atomic_text',
            ui: {
              value: 'repeat',
            },
          },
          {
            type: 'container',
            output: BrickOutput.number,
            inputs: [],
          },
          {
            type: 'atomic_text',
            ui: {
              value: 'times',
            },
          },
        ],
      },
      {
        type: 'control_repeat_n_times#end_repeat',
        is_static: true,
        inputs: [
          {
            type: 'atomic_text',
            ui: {
              value: 'end repeat',
            },
          },
        ],
      },
    ],
  },
  {
    type: 'contorl_repeat_while',
    is_root: true,
    next: null,
    parts: [
      {
        type: 'control_repeat_while#condition',
        is_static: true,
        inputs: [
          {
            type: 'atomic_text',
            ui: {
              value: 'while',
            },
          },
          {
            type: 'container',
            output: BrickOutput.boolean,
            inputs: [{
              type: 'atomic_boolean',
              output: BrickOutput.boolean,
              ui: {
                value: true,
                dropdown: 'atomic_boolean_dropdown',
              },
            }],
          },
        ],
        next: {
          type: 'control_wait',
          next: null,
          inputs: [
            {
              type: 'atomic_text',
              ui: {
                value: 'wait',
              },
            },
            {
              type: 'container',
              output: BrickOutput.number,
              inputs: [{
                type: 'atomic_input_number',
                output: BrickOutput.number,
                ui: {
                  value: 0.16,
                },
              }],
            },
            {
              type: 'atomic_text',
              ui: {
                value: 'secs',
              },
            },
          ],
        },
      },
      {
        type: 'control_repeat_while#end_repeat',
        is_static: true,
        inputs: [
          {
            type: 'atomic_text',
            ui: {
              value: 'end repeat',
            },
          },
        ],
      },
    ],
  },
];

const atomic_button_fns = {
  control_if_btn_add: (brick_id_to_data, cfg, update) => {
    const father = brick_id_to_data[cfg.ui.parent];
    const grandpa = brick_id_to_data[father.ui.parent];
    const last2 = grandpa.parts[grandpa.parts.length - 2];
    if (last2.type !== 'control_if#else' || grandpa.parts.length === 2) {
      const id = gen_id();
      grandpa.parts.splice(grandpa.parts.length - 1, 0, {
        id,
        type: 'control_if#else',
        root: cfg.root,
        next: null,
        is_static: true,
        inputs: [{
          id: gen_id(),
          type: 'atomic_text',
          root: cfg.root,
          ui: {
            delegate: id,
            is_toolbox_brick: grandpa.ui.is_toolbox_brick,
            offset: { x: 0, y: 0 },
            value: 'else',
            parent: id,
          },
        }],
        ui: {
          delegate: grandpa.id,
          offset: { x: 0, y: 0 },
          is_toolbox_brick: grandpa.ui.is_toolbox_brick,
          parent: grandpa.id,
        },
      });
    } else {
      last2.type = 'control_if#else_if';
      last2.inputs[0].ui.value = 'else if';
      last2.inputs.push({
        id: gen_id(),
        type: 'container',
        output: BrickOutput.boolean,
        inputs: [],
        root: cfg.root,
        ui: {
          delegate: last2.id,
          is_toolbox_brick: grandpa.ui.is_toolbox_brick,
          offset: { x: 0, y: 0 },
          value: ' if',
          parent: last2.id,
        },
      });
    }
    update();
  },
  control_if_btn_remove: (brick_id_to_data, cfg, update) => {
    const father = brick_id_to_data[cfg.ui.parent];
    const grandpa = brick_id_to_data[father.ui.parent];
    const last2 = grandpa.parts[grandpa.parts.length - 2];
    if (last2.type !== 'control_if#else_if') {
      if (grandpa.parts.length > 2) {
        grandpa.parts.splice(grandpa.parts.length - 2, 1);
      }
    } else {
      last2.type = 'control_if#else';
      last2.inputs[0].ui.value = 'else';
      last2.inputs.splice(1, 1);
    }
    update();
  },
};
const atomic_dropdown_menu = {};
export default {
  bricks,
  atomic_dropdown_menu,
  atomic_button_fns,
};