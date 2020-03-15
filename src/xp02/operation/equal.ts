import * as model from '../model'
import { Model, EqualContext } from '../types'
import { UnaryDispatcher } from '../dispatcher'

// Asserts syntactic equality of two models.
export function equal (a: Model, b: Model, ctx: EqualContext): boolean {
  if (a === b) return true
  if (a.rank !== b.rank) return false
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
  const method = disp.get(a)
  if (method) return method(a, b, ctx)
  throw new Error(`Missing equality method`)
}

const disp = new UnaryDispatcher<(a: Model, b: Model, ctx: EqualContext) => boolean>().addClasses(model, {
  NameConstant (a: model.NameConstant, b: model.NameConstant) {
    return a.name === b.name
  }
})
