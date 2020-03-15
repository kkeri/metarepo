import { BinaryDispatcher } from './dispatcher'
import { Model, BinaryOperation, Rank, Forkable, Combinator } from './types'
import * as model from './model'
import { createShortcutCombinator } from './combinator'

export function createMeet<Context extends Forkable<Context>> (
  disp: BinaryDispatcher<BinaryOperation<Model>> = meetDispatcher,
): Combinator<Context> {
  return createShortcutCombinator(
    (a, b) => {
      if (a.rank != null && b.rank != null) {
        if (a.rank < b.rank) return a
        if (a.rank > b.rank) return b
      }
      return disp.get(a, b)?.(a, b) ?? new model.Bottom()
    },
    a => a.rank !== null && a.rank <= Rank.Failure,
  )
}

export const meetDispatcher = new BinaryDispatcher<(a: Model, b: Model) => Model>()
  .addClass(Object, (a, b) => {
    return new model.Product(a, b, a.rank)
  })
  .addClasses(model, {

    Missing: (a: model.Missing, b: model.Missing) => {
      return new model.Missing(new model.Product(a.a, b.a, a.a.rank))
    },
  })
