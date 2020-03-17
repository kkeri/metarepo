import { BinaryDispatcher } from './dispatcher'
import { NormalModel } from './types'
import { undef, Missing, Sum } from './model'
import * as modelClasses from './model'

export const joiner = new BinaryDispatcher<(a: NormalModel, b: NormalModel) => NormalModel>()
  .addClass(Object, (a, b) => {
    return undef
  })
  .addClasses(modelClasses, {
    Missing: (a: Missing, b: Missing) => {
      return new Missing(new Sum(a.a, b.a))
    },
  })
