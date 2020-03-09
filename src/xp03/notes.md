
## Assumptions to be examined

Types have more structure than terms.
Parsing is analogous to type checking (at least for inductive types).
Parsing is constructive proof of having a particular structure.
Consequently grammars are analogous to types.
Pattern matching is also analogous to type checking and so to parsing.
That's why type constructors are on the left side of product types.
Function types and sequence operators of PEGs are the same.

Maybe there is a relationship (duality/correspondence) here.

normalization       parsing
product type        sequence type
left assoc.         right assoc.
context             source
antecedent          consequence (continuation)
past                future

## Ideas

Type theoretic rule applications may be implemented using shortcut combinators.
Backtracking is also implemented using shortcut combinators.
Pattern matching can be built from atomic pattern matching and backtracking.
Recursive descent parsing also uses backtracking.
