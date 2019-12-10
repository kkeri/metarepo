import { BinaryDispatcher } from './dispatcher'
import { Model, BinaryOperation } from './types'
import * as model from './model'

export function createMeet (
  disp: BinaryDispatcher<BinaryOperation> = meetDispatcher
): BinaryOperation {
  return function meet (a: Model, b: Model): Model {
    if (a.rank != null && b.rank != null) {
      if (a.rank < b.rank) return a
      if (a.rank > b.rank) return b
    }
    return disp.get(a, b)(a, b)
  }
}

export const meetDispatcher = new BinaryDispatcher<(a: Model, b: Model) => Model>()
  .addClass(Object, (a, b) => {
    return new model.And(a, b, a.rank)
  })
  .addClasses(model, {

    Missing: (a: model.Missing, b: model.Missing) => {
      return new model.Missing(new model.And(a.a, b.a, a.a.rank))
    },
  })
