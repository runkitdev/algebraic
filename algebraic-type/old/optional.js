const { data, union, parameterized } = require("./type");

const None = data `None` ();
const Optional = parameterized (T =>
    union `Optional<${T}>` (
        T,
        None ) );

Optional.Optional = Optional;
Optional.None = None;

module.exports = Optional;
