import { BinaryDispatcher } from './dispatcher'
import { BinaryOperation, Rank, Forkable, Combinator } from './types'
import * as model from './model'
import { createForkingCombinator } from './combinator'

export function createJoin<Context extends Forkable<Context>> (
  disp: BinaryDispatcher<BinaryOperation> = joinDispatcher,
): Combinator<Context> {
  return createForkingCombinator(
    (a, b) => {
      if (a.rank != null && b.rank != null) {
        if (a.rank > b.rank) return a
        if (a.rank < b.rank) return b
      }
      return disp.get(a, b)(a, b)
    },
    a => a.rank !== null && a.rank >= Rank.Success,
  )
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
