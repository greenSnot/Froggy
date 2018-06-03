import { Brick, BrickOutput } from '../brick';

const bricks: Brick[] = [
  {
    id: 'event_run_on_click',
    type: 'event_run_on_click',
    is_root: true,
    inputs: [
      {
        type: 'atomic_text',
        ui: {
          value: 'when RUN clicked',
        },
      },
    ],
    ui: {
      show_hat: true,
    },
    next: null,
  },
  {
    type: 'atomic_dropdown',
    output: BrickOutput.number,
    is_root: true,
    ui: {
      value: 2,
      dropdown: 'sensor_mouse_status_dropdown',
    },
  },
  {
    type: 'sensor_key',
    is_root: true,
    output: BrickOutput.boolean,
    inputs: [
      {
        type: 'container',
        output: BrickOutput.number,
        is_static: true,
        inputs: [
          {
            type: 'atomic_dropdown',
            is_static: true,
            output: BrickOutput.number,
            ui: {
              value: 1,
              dropdown: 'sensor_key_dropdown',
            },
          },
        ],
      },
      {
        type: 'atomic_text',
        ui: {
          value: 'is',
        },
      },
      {
        type: 'container',
        output: BrickOutput.number,
        is_static: true,
        inputs: [
          {
            type: 'atomic_dropdown',
            output: BrickOutput.number,
            is_static: true,
            ui: {
              value: 2,
              dropdown: 'sensor_key_status_dropdown',
            },
          },
        ],
      },
    ],
  },
  {
    type: 'event_mouse',
    is_root: true,
    inputs: [
      {
        type: 'atomic_text',
        ui: {
          value: 'when',
        },
      },
      {
        type: 'container',
        output: BrickOutput.any,
        is_static: true,
        inputs: [
          {
            type: 'atomic_dropdown',
            output: BrickOutput.number,
            is_static: true,
            ui: {
              value: 2,
              dropdown: 'sensor_mouse_status_dropdown',
            },
          },
        ],
      },
    ],
    ui: {
      show_hat: true,
    },
    next: null,
  },
  {
    type: 'event_key',
    is_root: true,
    inputs: [
      {
        type: 'atomic_text',
        ui: {
          value: 'when',
        },
      },
      {
        type: 'container',
        output: BrickOutput.number,
        is_static: true,
        inputs: [
          {
            type: 'atomic_dropdown',
            output: BrickOutput.number,
            is_static: true,
            ui: {
              value: 1,
              dropdown: 'sensor_key_status_dropdown',
            },
          },
        ],
      },
      {
        type: 'atomic_text',
        ui: {
          value: 'is',
        },
      },
      {
        type: 'container',
        output: BrickOutput.number,
        is_static: true,
        inputs: [{
          is_static: true,
          type: 'atomic_dropdown',
          output: BrickOutput.number,
          ui: {
            value: 2,
            dropdown: 'sensor_key_status_dropdown',
          },
        }],
      },
    ],
    ui: {
      show_hat: true,
    },
    next: null,
  },
];

const atomic_button_fns = {};
const atomic_dropdown_menu = {
  sensor_key_status_dropdown: {
    'pressed': 1,
    'released': 2,
  },
  sensor_key_dropdown: {
    'a': 1,
    // TODO
  },
  sensor_mouse_status_dropdown: {
    'left mouse up': 1,
    'left mouse down': 2,
    'right mouse up': 3,
    'right mouse down': 4,
  },
};
export default {
  bricks,
  atomic_button_fns,
  atomic_dropdown_menu,
};