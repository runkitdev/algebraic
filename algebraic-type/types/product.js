const { IArray } = require("../intrinsics");
const isSingleObject = body => body.length === 1 && typeof body[0] === "object";

exports.Product = (name, body) =>
({
    name,
    inherits: !isSingleObject(body) && IArray.prototype,
    constructors: [{ name, fields: body, preprocess }]
});

exports.isProductBody = body => true;

function preprocess(T, C, values)
{
    const hasPositionalFields = T.prototype instanceof Array;

    return hasPositionalFields || values.length > 1 ?
        [false, values] :
        [values[0] instanceof T, values];
}
