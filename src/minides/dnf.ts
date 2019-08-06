import { Model, Or, And, Not, True, False, Name } from './model';
import { equal } from './equal';

let depth = 0

function checkDepth () {
  if (depth > 10) {
    // console.log('depth:', depth)
  }
}

export function or (a: Model, b: Model) {
  checkDepth()
  depth++
  try {
    if (a === False) return b
    if (b === False) return a
    if (a === True) return True
    if (b === True) return True
    if (isLiteral(a) && isLiteral(b)) {
      if (equal(a, b)) return a
      if (equal(not(a), b)) return True
    }
    // if (a instanceof And) return and(or(a.a, b), or(a.b, b))
    // if (b instanceof And) return and(or(a, b.a), or(a, b.b))
  } finally {
    depth--
  }
  return new Or(a, b)
}

export function and (a: Model, b: Model) {
  checkDepth()
  depth++
  try {
    if (a === True) return b
    if (b === True) return a
    if (a === False) return False
    if (b === False) return False
    if (isLiteral(a) && isLiteral(b)) {
      if (equal(a, b)) return a
      if (equal(not(a), b)) return False
    }
    if (a instanceof Or) return or(and(a.a, b), and(a.b, b))
    if (b instanceof Or) return or(and(a, b.a), and(a, b.b))
  } finally {
    depth--
  }
  return new And(a, b)
}

export function not (a: Model) {
  checkDepth()
  depth++
  try {
    if (a === True) return False
    if (a === False) return True
    if (a instanceof Or) return and(not(a.a), not(a.b))
    if (a instanceof And) return or(not(a.a), not(a.b))
    if (a instanceof Not) return a.a
  } finally {
    depth--
  }
  return new Not(a)
}

function isLiteral (a: Model) {
  return a instanceof Name || a instanceof Not && a.a instanceof Name
}
