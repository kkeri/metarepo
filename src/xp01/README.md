# Experiment 01

A minimalist proof system for propositional logic.

## Usage

First, go to the repository directory.

Build:

    make xp01

Running tests:

    node lib/xp01/cli src/xp01/test/test.all

To start the read-eval-print loop:

    node lib/xp01/cli



## Discussion

The goal of this experiment is to implement a proof system as a rewriting system.
In other words, I attempt to construct a framework where *deduction* and
*reduction* (finding a normal form) are formally identical.
This is an ambitious goal, because a successful implementation would be
a significant step towards my realization of the phrase *proofs as programs*
which is associated with the Curry-Howard correspondence.

Propositional logic seems to be a good choice for discovering this
technique as it is simple and decidable but requires an axiom schemata.

In order to achieve my goal, I represent sequences of well-formed formulae
as expressions built from binary operations. To keep the system as minimal
as possible, the sequencing operator is identified with logical conjunction,
considering the similarity of the two concepts, i.e.

- A conjunction is true iff both operands are true.
  The iterative form of conjunction extends to _n_ propositions.
- A conclusion is true if both (all) of its premises are true and there is
  a rule of inference that produces the conclusion from the premises.

It is important to distinguish the meta level (the proof process) from the
object level (the language of propositions), and I'm aware of the risk
of the mentioned simplification.
Another simplification is using the constant `True` to indicate a successful
proof and `False` to indicate failure.
One of the goals of this experiment is help to find the minimal "distance"
to keep between the object level and the meta level to save the system
from collapsing into triviality. Propositional logic is possibly more
tolerant in this respect than more expressive calculi.

In order to realize the correspondence of proofs and normalization, we have to
change the notion of proof a bit. Traditionally a proof process answers a
closed-ended question (yes-no question).
A successful derivation means that the target proposition is true in the
examined formal system.
This experiment applies a reductionist approach to proofs, where
the question is formed as *what is required to be proved in order to
prove the target proposition?*
The required proof is reduced to another, possibly simpler proof.
This way the proof process answers open-ended questions,
what is analogous to moving from complete evaluation to partial evaluation.

Ideally the proof algorithm returns `True` if the target proposition is
syntactic consequence of the set of premises.
If the target proposition directly contradicts some of the premises,
the algorithm returns `False`. Otherwise it returns a proposition
that must be added to the set of premises to make the consequence true.
Interestingly, such an algorithm would amount to an automated theorem prover
which sounds too much of an achievement for a simple program like this.

### The deduction operator

The proof algorithm is based on a deduction operation *|>*. The operation is
implemented as a number of rewrite rules.

~~~
A |> (B /\ C) -> (A |> B) /\ (A |> C)  -- Conjunction introduction

(A /\ B) |> C -> (A |> C) \/ (B |> C)  -- Conjunction elimination

A |> (B \/ C) -> (A |> B) \/ (A |> C)  -- Disjunction introduction

(A \/ B) |> C -> (A |> C) /\ (B |> C)  -- Disjunction elimination

A |> A -> True                         -- Success

A |> ~A -> False                       -- Failure
~~~

The first four rules resemble the corresponding inference rules of natural
deduction and sequent calculus.
The *success* case is a simple unification algorithm together with syntactic
equality. I'm not sure about the *failure* case though.
If the rules are tried in the listed order, it is sufficient to
implement syntactic equality only on literals of the form `A` and `~A`.

If none of the rules could be applied to the operands, the right side
operand is returned.

The deduction operation 'mixes' its operands but the output
is generally larger than the operands, so we need more rules in order to reduce
the size of the output. Hence each application of the deduction operator
is followed by a normalization step `norm`.
For this purpose I tried both conjunctive and disjunctive normal forms and
a third one called 'ordered normal form' which I made up myself.

### The interactive interface

The deduction operation is embedded into an interactive process, by which
the user can incrementally build a formal system.
The interactive environment (called read-eval-print loop in Lisp jargon)
keeps track of the current set of premises in form of a normalized proposition
(remember that the sequencing operator is logical conjunction.)
The initial premise is `True`, the unit of conjunction.

An iteration of the build process goes like this:

1. The user enters a proposition *S*.
2. The program calls the deduction operation with the set of premises *E*
   on the left side and the new proposition *S* on the right side and
   the result is normalized.

   N = norm(E |> S)

3. The normalized proposition *N* is printed to the screen.
4. The new set of premises is computed by normalizing the conjunction of the
   old premises and the normalized proposition.
   
   E' = norm(E /\ N)

This incremental process is very natural.
If the user enters independent formulae (none of which can be derived from
the others), they are preserved and one can think of them like a set of
axioms.
If the user enters a proposition that is a theorem in the formal system,
it is (ideally) reduces to the constant `True` and the set of premises
remains intact. For example:

~~~
> A
A
> B
B
> A /\ B
true
~~~

If the user enters a proposition that contradicts the premises, the set of
premises *collapses* into the constant *False*, what is a terminal state.

The `.assert <S>` command allows the user to verify that a proposition
is a theorem without appending it to the set of premises.
If the normal form of *S* is `true`, the assertion succeeds, otherwise it fails,
temporarily switching back to complete evaluation. 

The `|>` deduction operator does not appear on the interactive interface,
it is encoded into the workflow. The user reads and writes only propositional
terms. Note that implication `->` is not part of the language, it must be
expressed using negation and disjunction, e.g. `~A \/ B`.

## Conclusions

The algorithm is promising, but not flawless.
I made a test input file that includes many basic derivations. Most of them
succeeds, but a few fails. For example:

~~~
> // modus ponens 2
>
> ~a\/c
~a \/ c
> a
false
> .eq c, true
assertion failed: c != false
~~~

where the expected behavior would be

~~~
> ~a\/c
~a \/ c
> a
a
> .eq c, true
~~~

Locally, it is clear what happened.

~~~
~a \/ c |> a
 -> (~a |> a) /\ (c |> a)     // by disjunction elimination
 -> false /\ a                // by success and failure
 -> false                     // by normalization
~~~

The *disjunction elimination* rule intuitively seems correct.
It is in accordance with the similar rule in natural deduction.
The culprit is the *failure* case. If I omit it, modus ponens succeeds,
but both cases of disjunction elimination fails.
At this point I resort to trial and error what is not satisfactory.

Until now I didn't specify which version of the propositional calculus I wanted
to implement. While I originally targeted classical logic, failures like this
made me wonder if I should move to intuitionistic logic.
Anyway, Curry-Howard is usually associated with the latter.

Notably, the current set of deduction rules don't manifest the
*principle of explosion*, which would be required in case of classical logic.
I tried to add it explicitly, but it didn't correct failed cases, so I removed it. 

Both the deduction operator and the normalizer contains inference rules,
and I'm uncertain when I have to explain why does a particular rule belong
to one or the other, and does it make sense to distinguish them at all.

Surprisingly, all three normal form performed identically.

The deduction operator is distributive over conjunction and disjunction.
It has the effect of *mixing* its two operands as deeply
as possible, playing a role similar to the *permutation* rule in
sequent calculus, while the *success* case is similar to *contraction*.

A follow-up experiment has to answer the following:

- Should I keep LEM and double negation elimination?
- Is it justified to separate the deduction operator from the normalizer?
- What are the minimal requirements for a suitable normal form?
