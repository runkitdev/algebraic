const Node = require("./node");
const { parse, parseExpression } = require("@babel/parser");
const fromBabel = require("./from-babel");

module.exports = (...args) => fromBabel(parse(...args).program);
module.exports.expression =  (...args) => fromBabel(parseExpression(...args));
