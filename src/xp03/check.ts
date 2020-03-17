import { Model, NormalModel, Rank } from './types'
import { bottom, undef, Sequence, FunctionType, SymbolInstance, SymbolType, Typing, ModelClass, Prod, LowerMeet } from './model'
import { BinaryDispatcher } from './dispatcher'

// Check the type of a term in a context.
export function check (term: Model, type: Model): NormalModel {
  return checker.get(term, type)(term, type)
}

export const checker = new BinaryDispatcher<(term: Model, type: Model) => NormalModel>()
  .addClass(ModelClass, (term, type) => {
    return bottom
  })
  .addClassPair(SymbolInstance, SymbolType, (term: SymbolInstance, type: SymbolType) => {
    if (term.chars === type.chars) {
      return new Typing(term, type).ranked(Rank.Neutral)
    }
    else {
      return bottom
    }
  })
  .addClassPair(ModelClass, LowerMeet, (term: Model, type: LowerMeet) => {
    // rtl lower join
    const bn = check(term, type.b)
    if (bn.rank > Rank.Bottom) return bn
    return check(term, type.a)
  })
