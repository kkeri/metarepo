import { Model, Or, And, Not, True, False } from './model';
import { equal } from './equal';
import { compare } from './compare';
import { LogicalNormalForm } from './types';

export const onf: LogicalNormalForm = { or, and, not }

function or (a: Model, b: Model) {
  if (a === False) return b
  if (b === False) return a
  if (a === True) return True
  if (b === True) return True
  if (b instanceof Or) return or(or(a, b.a), b.b)
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
      case -1: return new Or(a, b)
      case +1: return new Or(b, a)
      case 0:
        if ((a instanceof Not) === (b instanceof Not)) return a; else return True
    }
  }
  return new Or(a, b)
}

function and (a: Model, b: Model) {
  if (a === True) return b
  if (b === True) return a
  if (a === False) return False
  if (b === False) return False
  if (b instanceof And) return and(and(a, b.a), b.b)
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
      case -1: return new And(a, b)
      case +1: return new And(b, a)
      case 0:
        if ((a instanceof Not) === (b instanceof Not)) return a; else return False
    }
  }
  return new And(a, b)
}

function not (a: Model) {
  if (a === True) return False
  if (a === False) return True
  if (a instanceof Or) return and(not(a.a), not(a.b))
  if (a instanceof And) return or(not(a.a), not(a.b))
  if (a instanceof Not) return a.a
  return new Not(a)
}

function isLiteral (a: Model): boolean {
  return isAtom(a) || a instanceof Not && isAtom(a.a)
}

function isAtom (a: Model): boolean {
  return !(a instanceof Or || a instanceof And || a instanceof Not)
}
