import { BrickOutput } from 'froggy';
const bricks = [
    {
        type: 'atomic_boolean',
        output: BrickOutput.boolean,
        is_root: true,
        ui: {
            value: true,
            dropdown: 'atomic_boolean_dropdown',
        },
    },
    {
        type: 'atomic_input_number',
        output: BrickOutput.number,
        is_root: true,
        ui: {
            value: 1,
        },
    },
    {
        type: 'atomic_input_string',
        is_root: true,
        output: BrickOutput.string,
        ui: {
            value: 'string',
        },
    },
    {
        type: 'data_empty_array',
        output: BrickOutput.array,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'empty array',
                },
            }],
        is_root: true,
    },
    {
        type: 'data_variable_get',
        output: BrickOutput.any,
        is_root: true,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'variable',
                },
            }, {
                type: 'container',
                is_static: true,
                output: BrickOutput.string,
                inputs: [{
                        type: 'atomic_input_string',
                        output: BrickOutput.string,
                        is_static: true,
                        ui: {
                            value: 'x',
                        },
                    }],
            }],
    },
    {
        type: 'data_variable_set',
        next: null,
        is_root: true,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'set variable',
                },
            }, {
                type: 'container',
                is_static: true,
                output: BrickOutput.string,
                inputs: [{
                        type: 'atomic_input_string',
                        output: BrickOutput.string,
                        is_static: true,
                        ui: {
                            value: 'x',
                        },
                    }],
            }, {
                type: 'atomic_text',
                ui: {
                    value: 'to',
                },
            }, {
                type: 'container',
                output: BrickOutput.any,
                inputs: [],
            }],
    },
    {
        type: 'data_variable_append',
        next: null,
        is_root: true,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'append',
                },
            }, {
                type: 'container',
                output: BrickOutput.any,
                inputs: [],
            }, {
                type: 'atomic_text',
                ui: {
                    value: 'to',
                },
            }, {
                type: 'container',
                is_static: true,
                output: BrickOutput.string,
                inputs: [{
                        type: 'atomic_input_string',
                        output: BrickOutput.string,
                        is_static: true,
                        ui: {
                            value: 'x',
                        },
                    }],
            }],
    },
    {
        type: 'data_variable_get_nth',
        is_root: true,
        output: BrickOutput.any,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'get',
                },
            }, {
                type: 'container',
                output: BrickOutput.number,
                inputs: [{
                        type: 'atomic_input_number',
                        output: BrickOutput.number,
                        ui: {
                            value: 0,
                        },
                    }],
            }, {
                type: 'atomic_text',
                ui: {
                    value: 'th of',
                },
            }, {
                type: 'container',
                is_static: true,
                output: BrickOutput.string,
                inputs: [{
                        type: 'atomic_input_string',
                        output: BrickOutput.string,
                        is_static: true,
                        ui: {
                            value: 'x',
                        },
                    }],
            }],
    },
    {
        type: 'data_variable_remove_nth',
        next: null,
        is_root: true,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'remove',
                },
            }, {
                type: 'container',
                output: BrickOutput.number,
                inputs: [{
                        type: 'atomic_input_number',
                        output: BrickOutput.number,
                        ui: {
                            value: 0,
                        },
                    }],
            }, {
                type: 'atomic_text',
                ui: {
                    value: 'th of',
                },
            }, {
                type: 'container',
                is_static: true,
                output: BrickOutput.string,
                inputs: [{
                        type: 'atomic_input_string',
                        output: BrickOutput.string,
                        is_static: true,
                        ui: {
                            value: 'x',
                        },
                    }],
            }],
    },
    {
        type: 'data_variable_set_nth',
        next: null,
        is_root: true,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'set',
                },
            }, {
                type: 'container',
                output: BrickOutput.number,
                inputs: [{
                        type: 'atomic_input_number',
                        output: BrickOutput.number,
                        ui: {
                            value: 0,
                        },
                    }],
            }, {
                type: 'atomic_text',
                ui: {
                    value: 'th of',
                },
            }, {
                type: 'container',
                is_static: true,
                output: BrickOutput.string,
                inputs: [{
                        type: 'atomic_input_string',
                        output: BrickOutput.string,
                        is_static: true,
                        ui: {
                            value: 'x',
                        },
                    }],
            }, {
                type: 'atomic_text',
                ui: {
                    value: 'to',
                },
            }, {
                type: 'container',
                output: BrickOutput.any,
                inputs: [],
            }],
    },
    {
        type: 'data_variable_length_of',
        is_root: true,
        output: BrickOutput.any,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'length of',
                },
            }, {
                type: 'container',
                is_static: true,
                output: BrickOutput.string,
                inputs: [{
                        type: 'atomic_input_string',
                        output: BrickOutput.string,
                        is_static: true,
                        ui: {
                            value: 'x',
                        },
                    }],
            }],
    },
    {
        type: 'data_variable_pop',
        is_root: true,
        output: BrickOutput.any,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'pop',
                },
            }, {
                type: 'container',
                is_static: true,
                output: BrickOutput.string,
                inputs: [{
                        type: 'atomic_input_string',
                        output: BrickOutput.string,
                        is_static: true,
                        ui: {
                            value: 'x',
                        },
                    }],
            }],
    },
    {
        type: 'data_variable_declare_local',
        is_root: true,
        next: null,
        inputs: [{
                type: 'atomic_text',
                ui: {
                    value: 'declare local variable',
                },
            }, {
                type: 'container',
                is_static: true,
                output: BrickOutput.string,
                inputs: [{
                        type: 'atomic_input_string',
                        output: BrickOutput.string,
                        is_static: true,
                        ui: {
                            value: 'x',
                        },
                    }],
            }],
    },
];
const atomic_button_fns = {};
const atomic_dropdown_menu = {
    atomic_boolean_dropdown: {
        true: true,
        false: false,
    },
};
export default {
    bricks,
    atomic_dropdown_menu,
    atomic_button_fns,
};
