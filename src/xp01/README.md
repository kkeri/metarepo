# Experiment 01

A minimalist proof system for propositional logic.

Disclaimer: the algorithm is "mostly" correct, which means that it gives
incorrect result for certain cases, but I believe it can be fixed.
Run tests to get ideas what is broken (hint: proofs involving implication).

## Usage

Go to the main directory of the repository.
For build instructions see the [main readme file](../../README.md).

Run tests:

    bin/xp01 src/xp01/test/test.all

Start the read-eval-print loop:

    bin/xp01

## The read-eval-print loop

At the prompt, the user can type propositions and commands. Commands begin
with the `.` character, any other input is interpreted as a proposition.
When the user enters a proposition, the program tries to prove it from the
current set of premises, which is empty in the beginning.
The result is written in the next line. For example:

~~~
>p
p
>q
q
>p/\q
true
~~~

The proof algorithm is implemented as a rewrite system with partial 
evaluation-like semantics, so the result is not necessarily *true* or *false*
but can be any proposition (see the discussion below).
The resulting proposition is added to the set of premises and used in the
following proofs.

### Commands


~~~
  .l, .list           Lists the set of premises
  .r, .reset          Clears the set of premises
  .p, .prove <p>      Prints error message if <p> is not true
  .eq <p1>, <p2>      Prints error message if <p1> is not equal to <p2>
  .summary            Prints a summary of assertions and exits on failure
  .h, .help           Prints the list of commands
  .x, .exit           Quits read-eval-print loop
~~~

Using the assertions `.p` and `.eq` the user can test assumptions without
adding them to the premises. The `.r` commands clears all premises.
Sometimes it helps to list the current premises using the command `.l`.

### Proposition syntax

~~~
Prop ::= true, false     Truth values
       | p               Atom, can be any usual variable name
       | (Prop)          Parentheses
       | ~Prop           Negation
       | Prop /\ Prop    Conjunction
       | Prop \/ Prop    Disjunction
~~~

Precedence of operators: `~`, `/\`, `\/`.
Implication is not in the language but it can be expressed as `~p\/q`.


## Discussion

### Motivation

The goal of this project is to implement a simple theorem prover as
a rewriting system.
In other words, to construct a framework where *deduction* and *reduction*
(finding a normal form) are formally identical. This would be
a step towards my realization of the principle *proofs as programs*
which is associated with the Curry-Howard correspondence.

Propositional logic seems to be a good choice for discovering this
technique as it is simple and decidable. I see it as a starting point
before targeting more expressive calculi.

### Implementation

In order to achieve my goal, I represent sequences of well-formed propositions
as trees built of binary operations. To keep the system as minimal
as possible, the sequence operator is identified with logical conjunction,
considering the similarity of the two concepts, i.e.

- A conjunction is true iff both operands are true.
  The iterative form of conjunction extends to _n_ propositions.
- A conclusion is true if both (all) of its premises are true and there is
  a rule of inference that produces the conclusion from the premises.

I know it is important to distinguish the meta theory (the proof process) from
the object theory (the language of propositions), and I'm aware of the risk
of this simplification.
Another simplification is using the constant `True` to represent a successful
proof and `False` to represent failure.

One of my goals is to find the minimal "distance" to keep between the object
theory and the meta theory without collapsing the deduction system.
I speculate that propositional logic is more tolerant in this respect than
more complex calculi.

In order to realize the correspondence of proofs and normalization, we have to
shift the notion of proof a bit. Traditionally a proof answers a
closed-ended question (yes or no).
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
that, together with the premises, makes the consequence true.

### The deduction operator

The proof algorithm is based on a deduction operation `|>`.
The operation is implemented as a list of rewrite rules
(`->` denotes the rewrite operation.)

~~~
A |> (B /\ C) -> norm((A |> B) /\ (A |> C))  -- Conjunction introduction

(A /\ B) |> C -> norm((A |> C) \/ (B |> C))  -- Conjunction elimination

A |> (B \/ C) -> norm((A |> B) \/ (A |> C))  -- Disjunction introduction

(A \/ B) |> C -> norm((A |> C) /\ (B |> C))  -- Disjunction elimination

A |> A -> True                               -- Success

A |> ~A -> False                             -- Failure
~~~

The first four rules resemble the corresponding inference rules of natural
deduction, and also sequent calculus.
The *success* case is a simple unification algorithm together with syntactic
equality.
I'm not confident about the role and necessity of the *failure* case though,
which also involves syntactic equality.

If none of the rules can be applied to the operands, the right side
operand is returned. This is the key to partial evaluation. 

> In principle, the full operation `A |> B` should be returned,
> but there is no variable binding in the language, so there is no way
> to "pump more information" into `A` to make the operation successful
> later on, even if more axioms are added to the premises.

The output of the deduction operation is generally larger than the operands,
so it must be reduced.
Hence each application of the deduction operator is finished by
a normalization step `norm`.
For this purpose I tried both conjunctive and disjunctive normal forms and I
also experimented with a third (unfinished) one, which I call
*ordered normal form*. Choice of normal form is hard wired into the code.

### Interactive development process

The deduction operation is embedded into an interactive process by which
the user can incrementally build a formal system.
The interactive environment keeps track of the current set of premises
in the form of a normalized proposition
(remember that the sequence operator is logical conjunction.)
The initial premise is `True`, the unit of conjunction.

An iteration of the build process goes like this:

1. The user enters a proposition *S*.
2. The program calls the deduction operation with the set of premises *E*
   on the left side and the new proposition *S* on the right side.

   N = E |> S

3. The deduced proposition *N* is printed to the output.
4. The new set of premises is computed by normalizing the conjunction of the
   old premises and the deduced proposition.
   
   E' = norm(E /\ N)

The incremental development process comes naturally.
If the user enters independent propositions (none of which can be derived from
the others), they are preserved in the premises and one can think of them
as a set of axioms.
If the user enters a proposition that is a theorem in the formal system,
it is (ideally) reduced to the constant `True` and the set of premises
remains intact. For example:

~~~
> a
a
> b
b
> .list
a
b
> a /\ b
true
> .list
a
b
~~~

If the user enters a proposition that contradicts the premises, the set of
premises *collapses* into the constant `False`, what is a terminal state.

The `.prove P` command allows the user to verify if `P` is a theorem
without appending it to the set of premises.
If the normal form of *P* is `True`, the assertion succeeds, otherwise it fails,
temporarily falling back to complete evaluation. 


## Conclusion

The algorithm looks promising, even if not correct yet.

I made a test input file that includes many basic derivations. Most of them
succeeds, but a few fails. For example:

~~~
> // modus ponens 2
>
> ~a\/c
~a \/ c
> a
false
> .prove c
failed to prove: c
required       : c
~~~

where the expected behavior would be

~~~
> ~a\/c
~a \/ c
> a
a
> .prove c
success
~~~

Locally, it is clear what is going on.

~~~
~a \/ c |> a
 -> (~a |> a) /\ (c |> a)     // by disjunction elimination
 -> false /\ (c |> a)         // by failure
 -> false /\ a                // by the default case
 -> false                     // by normalization
~~~

The *disjunction elimination* rule intuitively seems correct.
It is in accordance with the similar rule in natural deduction.
The culprit is the *failure* case. If I omit it, modus ponens succeeds,
although both cases of disjunction elimination fails.
At this point I resort to trial and error what is not satisfactory.

Until now I didn't specify which version of the propositional calculus I wanted
to implement. While I originally targeted classical logic, failures like this
made me wonder if I should move to intuitionistic logic.
Anyway, Curry-Howard is usually associated with the latter.

Notably, the current set of deduction rules don't manifest the
*principle of explosion*, which would be required in case of classical logic.
I tried to add it explicitly, but it didn't fix failed cases, so I removed it. 

Both the deduction operator and the normalizer contains inference rules,
and I can't confidently explain why does a particular rule belong
to one or the other, and does it make sense to distinguish them at all.

Surprisingly, all three normal form performed identically with the current set
of rules.

Correction of the algorithm may require cleaner separation of the
object and the meta theory.
