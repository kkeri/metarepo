import { Model, Or, And, Not, True, False } from './model';
import { compare } from './compare';
import { LogicalNormalForm } from './types';

// Ordered normal form (unfinished)

// The idea behind this normal form is to convert logical equivalence to
// syntactic equivalence, that is not the case with CNF and DNF.
// In other words, the normal forms of two logically equivalent expressions
// must be strictly identical, so that equal(norm(a),norm(b)) = true.
// The desired benefit of such a normal form is the perfect mixing of the
// two sides of a conjunction, so that reaching the most compact normal form.

// This algorithm uses lexicographical ordering rather than equality on atoms.
// It preserves the duality of disjunction and conjunction.

export const onf: LogicalNormalForm = { or, and, not }

function or (a: Model, b: Model) {
  // either side is constant
  if (a === False) return b
  if (b === False) return a
  if (a === True) return True
  if (b === True) return True

  // right association - convert it to left association
  if (b instanceof Or) return or(or(a, b.a), b.b)

  // left association
  if (a instanceof Or) {
    const c = or(a.b, b)
    if (c instanceof Or) {
      return new Or(or(a.a, c.a), c.b)
    }
    else {
      return or(a.a, c)
    }
  }

  if (isLiteral(a) && isLiteral(b)) {
    const atomA = isAtom(a) ? a : (<Not>a).a
    const atomB = isAtom(b) ? b : (<Not>b).a
    switch (compare(atomA, atomB)) {
      // sort different atoms
      case -1: return new Or(a, b)
      case +1: return new Or(b, a)
      // reduce equal atoms
      case 0:
        if ((a instanceof Not) === (b instanceof Not)) {
          // idempotence
          return a;
        }
        else {
          // law of excluded middle
          return True
        }
    }
  }

  // none of the laws can be applied 
  return new Or(a, b)
}

function and (a: Model, b: Model) {
  // either side is constant
  if (a === True) return b
  if (b === True) return a
  if (a === False) return False
  if (b === False) return False

  // right association - convert it to left association
  if (b instanceof And) return and(and(a, b.a), b.b)

  // left association
  if (a instanceof And) {
    const c = and(a.b, b)
    if (c instanceof And) {
      return new And(and(a.a, c.a), c.b)
    }
    else {
      return and(a.a, c)
    }
  }

  if (isLiteral(a) && isLiteral(b)) {
    const atomA = isAtom(a) ? a : (<Not>a).a
    const atomB = isAtom(b) ? b : (<Not>b).a
    switch (compare(atomA, atomB)) {
      // sort different atoms
      case -1: return new And(a, b)
      case +1: return new And(b, a)
      case 0:
        // reduce equal atoms
        if ((a instanceof Not) === (b instanceof Not)) {
          // idempotence
          return a;
        }
        else {
          // law of non-contradiction
          return False
        }
    }
  }

  // none of the laws can be applied 
  return new And(a, b)
}

function not (a: Model) {
  // the argument is a constant
  if (a === True) return False
  if (a === False) return True

  // De Morgan laws
  if (a instanceof Or) return and(not(a.a), not(a.b))
  if (a instanceof And) return or(not(a.a), not(a.b))

  // double negation elimination
  if (a instanceof Not) return a.a

  // none of the laws can be applied 
  return new Not(a)
}

function isLiteral (a: Model): boolean {
  return isAtom(a) || a instanceof Not && isAtom(a.a)
}

function isAtom (a: Model): boolean {
  return !(a instanceof Or || a instanceof And || a instanceof Not)
}
