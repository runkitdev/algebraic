const { IObject } = require("./intrinsics");
const f = require("./function-define");
const type = require("./type");
const fail = require("./fail");


function Field(name, value)
{
    this.name = name;
    this.constraint = new Constraint(value);
    this.default = Default.None;
}

module.exports = Field;

Field.prototype.extract = function (T, values)
{
    const present = IObject.has(this.name, values);
    
    if (!present && this.default === Field.Default.None)
        fail.type(
            `${toTypeString(T)} constructor requires field ` +
            `${toValueString(this.name)}.`);

    // FIXME: Do computed correctly...
    if (!present)
        return this.default instanceof Field.Default.Value ?
            this.default.value :
            this.default.computed();

    const value = values[this.name];

    if (!this.constraint.has(value))
        fail.type(
            `${toTypeString(T)} constructor passed invalid value` +
            ` for field ${toValueString(this.name)}:\n` +
            `  Expected: type ${toTypeString(T)}\n` +
            `  Found: ${toValueString(value)} ` +
            `of type ${toTypeString(type.of(value))}`);

    return value;
}

function Constraint(type)
{
    this.type = type;
}

Constraint.prototype.has = function (value)
{
    return value instanceof this.type;
}

const Default =
{
    None: Symbol("Default.None"),
    Value: f.constructible `Default.Value`
        (function (f, value) { this.value = value } ),
    Computed: f.constructible `Default.Computed`
        (function (f, computed) { this.computed = computed })
};

Field.Default = Default;

const highlighted = ([color]) => string => `${color}${string}\x1b[0m`;
const toTypeString = T => highlighted `\x1b[36m` (type.typename(T));
const toValueString = value => highlighted `\x1b[35m` (
    value === void(0) ? "undefined" :
    value === null ? "null" :
    typeof value === "function" ? `[function ${value.name}]` :
//    typeof value !== "object" ? JSON.stringify(value, null, 2) :
//    of(value) && getKind(of(value)) ? value + "" :
    JSON.stringify(value, null, 2));

