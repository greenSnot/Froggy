export type BrickId = string;
export type DragData = {
  brick: Brick;
  mouse_global_x: number,
  mouse_global_y: number,
};
export enum BrickOutput {
  void,
  string,
  number,
  boolean,
  array,
  any,
}

export enum AtomicBrickEnum {
  atomic_text = 1,
  atomic_boolean,
  atomic_dropdown,
  atomic_input_string,
  atomic_input_number,
  atomic_param,
  atomic_button,
}

export type RuntimeBrick = {
  id?: string,
  path?: string[],
  type: string,
  root?: BrickId,
  is_root?: boolean,

  parts?: Brick[],
  prev?: BrickId,
  next?: Brick,
  output?: BrickOutput,
  inputs?: Brick[],

  is_static?: boolean, // avoid to be inserting candidate
};

export type Brick = RuntimeBrick & {
  ui?: {
    className?: string,
    copier?: boolean, // for output container
    parent?: BrickId, // part's parent or input's parent
    show_hat?: boolean,
    is_removing?: boolean,
    is_ghost?: boolean,
    offset?: {
      x: number,
      y: number,
    },
    delegate?: Brick,
    is_toolbox_brick?: boolean,
    value?: any, // output value
    dropdown?: string, // dropdown
  },
};

export type Offset = {
  x: number;
  y: number;
};