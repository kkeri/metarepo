import { Model, NormalModel, Rank } from './types'
import { bottom, FunctionType, SymbolInstance, SymbolType, Typing, ModelClass, Prod, LowerMeet, Sequence } from './model'
import { BinaryDispatcher } from './dispatcher'
import { check } from './check'

// Infer the type of a term in a context.
export function infer (a: Model, b: Model): NormalModel {
  return inferrer.get(a, b)(a, b)
}

export const inferrer = new BinaryDispatcher<(a: Model, b: Model) => NormalModel>()
  .addClass(ModelClass, (a, b) => {
    return bottom
  })

  .addClassPair(ModelClass, LowerMeet, (a: Model, b: LowerMeet) => {
    // lower join
    const an = infer(a, b.a)
    if (an.rank > Rank.Bottom) return an
    return infer(a, b.b)
  })

  .addClassPair(SymbolInstance, SymbolType, (a: SymbolInstance, b: SymbolType) => {
    if (a.chars === b.chars) {
      return new Typing(a, b)
    }
    else {
      return bottom
    }
  })
  .addClassPair(SymbolInstance, FunctionType, (a: SymbolInstance, b: FunctionType) => {
    // lower meet
    const an = check(a, b.a)
    if (an.rank <= Rank.Bottom) return an
    return new Typing(an, b.b)
  })

  .addClassPair(Sequence, FunctionType, (a: SymbolInstance, b: FunctionType) => {
    // lower meet
    const an = check(a, b.a)
    if (an.rank <= Rank.Bottom) return an
    return new Typing(an, b.b)
  })
