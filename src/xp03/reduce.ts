import { BinaryDispatcher } from './dispatcher'
import { infer } from './infer'
import { FunctionType, ModelClass, SymbolInstance, SymbolType, undef } from './model'
import { Model, NormalModel, Rank } from './types'

export function reduce (a: Model, b: Model): NormalModel {
  return reducer.get(a, b)(a, b)
}

export const reducer = new BinaryDispatcher<(a: Model, b: Model) => NormalModel>()
  .addClass(ModelClass, (a, b) => {
    return a.ranked(Rank.Neutral)
  })

  .addClassPair(SymbolInstance, ModelClass, (a: SymbolInstance, b: ModelClass) => {
    return infer(a, b)
  })
