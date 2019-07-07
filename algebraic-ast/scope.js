const { data, string } = require("@algebraic/type");
const { Set } = require("@algebraic/collections");
const StringSet = Set(string);

const Scope = data `Scope` (
    free    => [StringSet, StringSet()],
    bound   => [StringSet, StringSet()] );

Scope.identity = Scope({ });
Scope.concat = (lhs, rhs) =>
    lhs === Scope.Identity ? rhs :
    rhs === Scope.Identity ? lhs :
        ((bound =>
            Scope({ bound, free: lhs.free.union(rhs.free).subtract(bound) })))
        (lhs.bound.union(rhs.bound));

Scope.reduce = nodes => nodes
    .map(node => node.scope)
    .reduce(Scope.concat, Scope.identity);



Scope.justFree = scope => Scope({ free: scope.free });
Scope.fromFree = variable => Scope({ free: StringSet([variable]) });
Scope.fromBound = variable => Scope({ bound: StringSet([variable]) });

const symbol = Symbol("Scope");

Scope.for = node => node && node[symbol] || Scope.identity;
Scope.with = (node, scope) => (node[symbol] = Scope(scope), node);
Scope.has = node => !!node[symbol];

module.exports = Scope;
