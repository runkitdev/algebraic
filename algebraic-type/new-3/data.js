const { hasOwnProperty } = Object;
const fail = require("../fail");
const fromEntries = require("@climb/from-entries");
const type = require("./type");
const provenancing = require("./provenancing");
const CachedFields = new WeakMap();
const given = f => f();

const toResolvedFields = fields => Object
    .entries(fields)
    .map(([name, fType]) => [name, fType()])
    .map(([name, T]) => [name, T, type.attributes(T)])
    .map(([name, T, attributes]) =>
    ({
        name,
        type: T,
        ...(hasOwnProperty.call(attributes, "default") &&
        { default: attributes.default })
    }));

const ResolvedCachedFields = new WeakMap();
const toResolvedFieldsCached = T =>
    ResolvedCachedFields.has(T) ?
        ResolvedCachedFields.get(T) :
        given((fields = toResolvedFields(T)) =>
            (ResolvedCachedFields.set(T, fields), fields));


const AllDefaults = {};
const construct = (T, instantiate, { fields }, values) =>
    values instanceof T ?
        values :
        instantiate(
            T,
            fromEntries(
                toResolvedFieldsCached(fields)
                    .map(initialize(T, values || AllDefaults))));

module.exports = fields => ({ construct, fields: { ...fields } });

const highlighted = ([color]) => string => `${color}${string}\x1b[0m`;
const toTypeString = T => highlighted `\x1b[36m` (type.typename(T));
const toValueString = value => highlighted `\x1b[35m` (
    value === void(0) ? "undefined" :
    value === null ? "null" :
    typeof value === "function" ? `[function ${value.name}]` :
    typeof value !== "object" ? JSON.stringify(value, null, 2) :
    of(value) && getKind(of(value)) ? value + "" :
    JSON.stringify(value, null, 2));

const toCandidate = (T, values, { name, ...field }) =>
    hasOwnProperty.call(values, name) ? values[name] :
    hasOwnProperty.call(field, "default") ? field.default :
    fail.type(
        `${toTypeString(T)} constructor requires field ` +
        `${toValueString(name)}.`);

const initialize = (T, values) => field =>
    given((candidate = toCandidate(T, values, field)) =>
        !type.satisfies(field.type, candidate) ?
            fail.type(
                `${toTypeString(T)} constructor passed invalid value` +
                ` for field ${toValueString(field.name)}:\n` +
                `  Expected: type ${toTypeString(field.type)}\n` +
                `  Found: ${toValueString(candidate)} ` +
                `of type ${toTypeString(type.of(candidate))}`) :
        [field.name, candidate]);

/*
const Field = type `field` ({ name: of => type.string, type: of => type.any });
const getFields = provenance =>
    provenance.function === data ?
        toResolvedFieldsCached(provenance.arguments[0]) :
        getFields(provenance.parent);


data.fields = T => getFields(T["Provenance"])
    .map(([name, type]) => Field({ name, type }));
*/
