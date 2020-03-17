import { BinaryDispatcher } from './dispatcher'
import { Rank, NormalModel } from './types'
import { undef, Missing, Sum, LowerMeet } from './model'
import * as modelClasses from './model'

export const meeter = new BinaryDispatcher<(a: NormalModel, b: NormalModel) => NormalModel>()
  .addClass(Object, (a, b) => {
    return undef
  })
  .addClasses(modelClasses, {
    Missing: (a: Missing, b: Missing) => {
      return new Missing(new Sum(a.a, b.a))
    },
  })

export function lowerMeet (a: NormalModel, b: NormalModel): NormalModel {
  if (a.rank <= Rank.Bottom) return a
  if (a.rank < b.rank) return a
  if (b.rank < a.rank) return b
  const meet = meeter.get(a, b)(a, b)
  if (meet !== undef) return meet
  return new LowerMeet(a, b).ranked(a.rank)
}
