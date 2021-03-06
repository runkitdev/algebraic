Error.stackTraceLimit = 1000;
const { IObject } = require("./intrinsics");
const { isTaggedCall, tagResolve } = require("./templating");
const f = require("./function-define");

const type = function (){};

type[Symbol.iterator] = function * () { yield type; yield type; };

module.exports = type;

type.type = type;
type.of = value =>
    !value || typeof value !== "object" ?
        type[typeof value] :
        Object.getPrototypeOf(value).constructor;

type.has = (T, value) => T.has(value);

type.typename = T => T.name;

type.data = require("./data");

function primitive(name, has)
{
    return Object.assign(f (name, ()=>{}, type.prototype),
    {
        has: has || (value => typeof value === name)
    });
}

type.bigint = primitive("bigint");
type.boolean = primitive("boolean");
type.function = primitive("function");
type.number = primitive("number");
type.null = primitive("null");
type.string = primitive("string");
type.symbol = primitive("symbol");
type.undefined = primitive("undefined");
type.object = primitive("object", value => value && typeof value === "object");


const { caseof } = require("./data");

type.caseof = caseof;


const { data } = type;

type.optional =
    data `optional` .forall (T =>
    ([
        caseof `some` (of => T),
        caseof `none` ()
    ]));


type.List = type.data `List` .forall(T =>
([
    caseof `Cons`   (of => T),
    caseof `Empty`  (),
]));

type.defaultValue = T => private(T, "DefaultValue");




