import { BinaryDispatcher } from './dispatcher'
import { BinaryOperation, Model } from './types'
import * as model from './model'

export function createJoin (
  disp: BinaryDispatcher<BinaryOperation> = joinDispatcher
): BinaryOperation {
  return function join (a: Model, b: Model): Model {
    if (a.rank != null && b.rank != null) {
      if (a.rank > b.rank) return a
      if (a.rank < b.rank) return b
    }
    return disp.get(a, b)(a, b)
  }
}

export const joinDispatcher = new BinaryDispatcher<BinaryOperation>()
  .addClass(Object, (a, b) => {
    return new model.Or(a, b, a.rank)
  })
  .addClasses(model, {
    Missing: (a: model.Missing, b: model.Missing) => {
      return new model.Missing(new model.Or(a.a, b.a, a.a.rank))
    },
  })
