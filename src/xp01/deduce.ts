import { Model, Or, And, True, False } from './model';
import { equal } from './equal';
import { LogicalNormalForm, BinaryOp } from './types';

export function makeDeduce ({ or, and, not }: LogicalNormalForm): BinaryOp {

  function deduce (a: Model, b: Model): Model {
    // conjunction introduction
    if (b instanceof And) return and(deduce(a, b.a), deduce(a, b.b))

    // conjunction elimination
    if (a instanceof And) return or(deduce(a.a, b), deduce(a.b, b))

    // disjunction introduction
    if (b instanceof Or) return or(deduce(a, b.a), deduce(a, b.b))

    // disjunction elimination
    if (a instanceof Or) return and(deduce(a.a, b), deduce(a.b, b))

    // identity
    if (equal(a, b)) return True

    // law of non-contradiction
    if (equal(not(a), b)) return False

    // none of the rules can be applied
    return b
  }

  return deduce
}
