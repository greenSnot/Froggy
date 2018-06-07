import { Brick, BrickOutput } from 'froggy';

const bricks: Brick[] = [
  {
    type: 'operator_number',
    output: BrickOutput.number,
    is_root: true,
    inputs: [
      {
        type: 'container',
        output: BrickOutput.number,
        inputs: [],
      },
      {
        type: 'container',
        output: BrickOutput.number,
        is_static: true,
        inputs: [{
          type: 'atomic_dropdown',
          output: BrickOutput.number,
          is_static: true,
          ui: {
            value: 1,
            dropdown: 'operator_number_dropdown',
          },
        }],
      },
      {
        type: 'container',
        output: BrickOutput.number,
        inputs: [],
      },
    ],
  },
  {
    id: 'math',
    type: 'operator_math',
    output: BrickOutput.number,
    is_root: true,
    inputs: [
      {
        type: 'container',
        output: BrickOutput.number,
        is_static: true,
        inputs: [{
          type: 'atomic_dropdown',
          output: BrickOutput.number,
          is_static: true,
          ui: {
            value: 1,
            dropdown: 'operator_math_dropdown',
          },
        }],
      },
      {
        type: 'container',
        output: BrickOutput.number,
        inputs: [],
      },
    ],
  },
  {
    type: 'operator_random',
    output: BrickOutput.number,
    is_root: true,
    inputs: [
      {
        type: 'atomic_text',
        ui: {
          value: 'random from',
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
          value: 'to',
        },
      },
      {
        type: 'container',
        output: BrickOutput.number,
        inputs: [],
      },
    ],
  },
  {
    type: 'operator_ternary',
    output: BrickOutput.any,
    is_root: true,
    inputs: [
      {
        type: 'atomic_text',
        ui: {
          value: 'ternary',
        },
      },
      {
        type: 'container',
        output: BrickOutput.boolean,
        inputs: [],
      },
      {
        type: 'atomic_text',
        ui: {
          value: '?',
        },
      },
      {
        type: 'container',
        output: BrickOutput.any,
        inputs: [],
      },
      {
        type: 'atomic_text',
        ui: {
          value: ':',
        },
      },
      {
        type: 'container',
        output: BrickOutput.any,
        inputs: [],
      },
    ],
  },
  {
    type: 'operator_compare',
    output: BrickOutput.boolean,
    is_root: true,
    inputs: [
      {
        type: 'container',
        output: BrickOutput.any,
        inputs: [],
      },
      {
        type: 'container',
        output: BrickOutput.number,
        is_static: true,
        inputs: [{
          type: 'atomic_dropdown',
          output: BrickOutput.number,
          is_static: true,
          ui: {
            value: 1,
            dropdown: 'operator_compare_dropdown',
          },
        }],
      },
      {
        type: 'container',
        output: BrickOutput.any,
        inputs: [],
      },
    ],
  },
  {
    type: 'operator_boolean',
    output: BrickOutput.any,
    is_root: true,
    inputs: [
      {
        type: 'container',
        output: BrickOutput.any,
        inputs: [],
      },
      {
        type: 'container',
        output: BrickOutput.number,
        is_static: true,
        inputs: [{
          type: 'atomic_dropdown',
          output: BrickOutput.number,
          is_static: true,
          ui: {
            value: 1,
            dropdown: 'operator_boolean_dropdown',
          },
        }],
      },
      {
        type: 'container',
        output: BrickOutput.any,
        inputs: [],
      },
    ],
  },
  {
    type: 'operator_not',
    output: BrickOutput.boolean,
    is_root: true,
    inputs: [
      {
        type: 'atomic_text',
        ui: {
          value: 'not',
        },
      },
      {
        type: 'container',
        output: BrickOutput.boolean,
        inputs: [],
      },
    ],
  },
];

const atomic_button_fns = {};
const atomic_dropdown_menu = {
  operator_number_dropdown: {
    '+': 0,
    '-': 1,
    'x': 2,
    '÷': 3,
    '^': 4,
    'mod': 5,
  },
  operator_compare_dropdown: {
    '<': 0,
    '<=': 1,
    '=': 2,
    '>': 3,
    '>=': 4,
  },
  operator_math_dropdown: {
    abs: 0,
    round: 1,
    floor: 2,
    ceiling: 3,
    sqrt: 4,
    sin: 5,
    cos: 6,
    tan: 7,
    asin: 8,
    acos: 9,
    atan: 10,
    ln: 11,
    log: 12,
  },
  operator_boolean_dropdown: {
    'and': 0,
    'xor': 1,
    'or': 2,
    'shift left': 3,
    'shift right': 4,
  },
};
export default {
  bricks,
  atomic_button_fns,
  atomic_dropdown_menu,
};