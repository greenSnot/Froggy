export var BrickOutput;
(function (BrickOutput) {
    BrickOutput[BrickOutput["void"] = 0] = "void";
    BrickOutput[BrickOutput["string"] = 1] = "string";
    BrickOutput[BrickOutput["number"] = 2] = "number";
    BrickOutput[BrickOutput["boolean"] = 3] = "boolean";
    BrickOutput[BrickOutput["array"] = 4] = "array";
    BrickOutput[BrickOutput["any"] = 5] = "any";
})(BrickOutput || (BrickOutput = {}));
export var AtomicBrickEnum;
(function (AtomicBrickEnum) {
    AtomicBrickEnum[AtomicBrickEnum["atomic_text"] = 1] = "atomic_text";
    AtomicBrickEnum[AtomicBrickEnum["atomic_boolean"] = 2] = "atomic_boolean";
    AtomicBrickEnum[AtomicBrickEnum["atomic_dropdown"] = 3] = "atomic_dropdown";
    AtomicBrickEnum[AtomicBrickEnum["atomic_input_string"] = 4] = "atomic_input_string";
    AtomicBrickEnum[AtomicBrickEnum["atomic_input_number"] = 5] = "atomic_input_number";
    AtomicBrickEnum[AtomicBrickEnum["atomic_param"] = 6] = "atomic_param";
    AtomicBrickEnum[AtomicBrickEnum["atomic_button"] = 7] = "atomic_button";
})(AtomicBrickEnum || (AtomicBrickEnum = {}));
