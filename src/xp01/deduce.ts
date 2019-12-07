import { Model, Or, And, True, False } from './model';
import { equal } from './equal';
import { LogicalNormalForm, BinaryOp } from './types';

export function makeDeduce ({ or, and, not }: LogicalNormalForm): BinaryOp {

  function deduce (a: Model, b: Model): Model {
    // identity
    if (equal(a, b)) return True

    // law of non-contradiction
    if (equal(not(a), b)) return False

    // combinations
    let result = False
    // disjunction introduction
    if (b instanceof Or) result = or(result, or(deduce(a, b.a), deduce(a, b.b)))
    // disjunction elimination
    if (a instanceof Or) result = or(result, and(deduce(a.a, b), deduce(a.b, b)))
    // conjunction introduction
    if (b instanceof And) result = or(result, and(deduce(a, b.a), deduce(a, b.b)))
    // conjunction elimination
    if (a instanceof And) result = or(result, or(deduce(a.a, b), deduce(a.b, b)))
    return result !== False ? result : b
  }

  return deduce
}
