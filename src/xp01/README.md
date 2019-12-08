# Experiment 01

A minimalist proof system for propositional logic.

## Discussion

The goal of this experiment is to implement a proof system as a rewriting system.
In other words, I attempt to construct a framework where *deduction* and
*reduction* (finding a normal form) are formally identical.
This is an ambitious goal, because a successful implementation would be
a significant step towards my realization the phrase *proofs as programs*
which is associated with the Curry-Howard correspondence.

Propositional logic seems to be a good choice for discovering this
technique as it is simple but requires an axiom schemata.

In order to achieve my goal, I represent sequences of well-formed formulae
as expressions built from binary operations. To keep the system as minimal
as possible, the sequencing operator is identified with logical conjunction,
based on the similarity of the two concepts, i.e.

- A conjunction is true iff both operands are true.
  The iterative form of conjunction extends this to _n_ propositions.
- A conclusion is true if both (all) of its premises are true and there is
  a rule of inference that produces the conclusion from the premises.

It is important to distinguish the metalanguage from the object language, and
I'm aware of the risk of the mentioned simplification.
Another simplification is using the constant `true` to indicate a successful
proof and `false` to indicate failure.
One of the goals of this scenario is to help to find the minimal "distance"
to keep between the object level and the meta level to save the system
from collapsing into triviality. Propositional logic is probably very
tolerant in this respect.

In order to realize the correspondence of proofs and normalization, we have to
change the notion of proof a bit. Traditionally a proof process answers a
closed-ended question (or yes-no question).
A successful derivation means that the target formula is true in the examined
formal system.
This experiment implements a reductionist approach to proofs, where
the question is formed like *what is required to be proved in order to
prove the target formula?*
The required proof is reduced to another, possibly simpler proof.
This way the proof process answers open-ended questions.
This is analogous to moving from complete evaluation to partial evaluation.

Ideally the proof algorithm returns true if the target formula is a syntactic
consequence of the premises. If the target formula directly contradicts some
of the premises, the algorithm returns false. Otherwise it returns a formula
that must be added to the premises to make the consequence true.
Interestingly, such an algorithm would amount to an automated theorem prover
which sounds too much of an achievement for a simple program like this.

The algorithm is divided into a deduction operation and a normalizer.
The deduction operation implements the following rules of inference.

~~~
a |- (b /\ c) -> (a |- b) /\ (a |- c)  -- conjunction introduction

(a /\ b) |- c -> (a |- b) \/ (a |- c)  -- conjunction elimination

a |- (b \/ c) -> (a |- b) \/ (a |- c)  -- disjunction introduction

(a \/ b) |- c -> (a |- b) /\ (a |- c)  -- disjunction elimination

a |- a -> true                         -- success

a |- ~a -> false                       -- failure
~~~

The first four rules are generalized versions of the rules well known from
natural deduction.

The last two rules form a simple unification algorithm together with syntactic
equality. By prioritizing the rules in the listed order, it is sufficient to
implement syntactic equality only for literals of the form `a` and `~a`.