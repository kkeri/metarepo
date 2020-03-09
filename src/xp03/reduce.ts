import { Model, NormalModel } from './types'
import { bottom, undef } from './model'
import { BinaryDispatcher } from './dispatcher'

export function reduce (a: Model, b: Model): NormalModel {
  return bottom
}

export const reducer = new BinaryDispatcher<(a: Model, b: Model) => NormalModel>()
  .addClass(Object, (a, b) => {
    return undef
  })

