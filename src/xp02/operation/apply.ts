import { Model, OperationContext } from '../types'
import { UnaryDispatcher } from '../dispatcher'
import { NativeFunction } from '../native'

// Applies a function to an argument.
// Returns null if the function is not applicable to the argument.
export function apply (fn: Model, arg: Model, ctx: OperationContext): Model | null {
  return disp.get(fn)?.call(fn, arg, ctx) ?? null
}

export const disp = new UnaryDispatcher<(arg: Model, ctx: OperationContext) => Model>()
  .addClass(NativeFunction, function (arg, ctx) {
    return this.apply(arg, ctx)
  })
