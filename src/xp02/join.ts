import { BinaryDispatcher } from './dispatcher'
import { BinaryOperation, Rank, Forkable, Combinator, Model } from './types'
import * as model from './model'

export function createJoin (
  disp: BinaryDispatcher<BinaryOperation<Model>> = joinDispatcher
): BinaryOperation<Model> {
  return function join (a: Model, b: Model): Model {
    if (a.rank != null && b.rank != null) {
      if (a.rank > b.rank) return a
      if (a.rank < b.rank) return b
    }
    return disp.get(a, b)?.(a, b) ?? new model.Bottom()
  }
}

export const joinDispatcher = new BinaryDispatcher<BinaryOperation<Model>>()
  .addClass(Object, (a, b) => {
    return new model.Sum(a, b, a.rank)
  })
  .addClasses(model, {
    Missing: (a: model.Missing, b: model.Missing) => {
      return new model.Missing(new model.Sum(a.a, b.a, a.a.rank))
    },
  })
