import { Model, Or, And, Not, True, False } from './model'
import { equal } from './equal'
import { LogicalNormalForm } from './types'

// Disjunctive normal form

export const dnf: LogicalNormalForm = { or, and, not }

function or (a: Model, b: Model) {
  // either side is constant
  if (a === False) return b
  if (b === False) return a
  if (a === True) return True
  if (b === True) return True

  if (isLiteral(a) && isLiteral(b)) {
    // idempotence
    if (equal(a, b)) return a
    // law of excluded middle
    if (equal(not(a), b)) return True
  }

  // distribution - not applied in DNF
  // if (a instanceof And) return and(or(a.a, b), or(a.b, b))
  // if (b instanceof And) return and(or(a, b.a), or(a, b.b))

  // none of the laws can be applied 
  return new Or(a, b)
}

function and (a: Model, b: Model) {
  // either side is constant
  if (a === True) return b
  if (b === True) return a
  if (a === False) return False
  if (b === False) return False

  if (isLiteral(a) && isLiteral(b)) {
    // idempotence
    if (equal(a, b)) return a
    // law of non-contradiction
    if (equal(not(a), b)) return False
  }

  // distribution
  if (a instanceof Or) return or(and(a.a, b), and(a.b, b))
  if (b instanceof Or) return or(and(a, b.a), and(a, b.b))

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
