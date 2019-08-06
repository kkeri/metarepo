import { UnaryOp, BinaryOp } from './types';
import { Model, Or, And, True, False } from './model';
import { equal } from './equal';

export function makeDeduce (or: BinaryOp, and: BinaryOp, not: UnaryOp): BinaryOp {

  function deduce (a: Model, b: Model): Model {
    if (equal(not(a), b)) return False
    if (equal(a, b)) return True
    let result = False
    if (b instanceof Or) result = or(result, or(deduce(a, b.a), deduce(a, b.b)))
    if (b instanceof And) result = or(result, and(deduce(a, b.a), deduce(a, b.b)))
    if (a instanceof Or) result = or(result, and(deduce(a.a, b), deduce(a.b, b)))
    if (a instanceof And) result = or(result, or(deduce(a.a, b), deduce(a.b, b)))
    return result !== False ? result : b
  }

  return deduce
}
