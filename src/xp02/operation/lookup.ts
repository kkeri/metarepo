import { Model, OperationContext } from '../types'
import * as allModels from '../model'
import { UnaryDispatcher } from '../dispatcher'

export function lookup (env: Model, key: Model, ctx: OperationContext): Model | null {
  return disp.get(env)?.call(env, key, ctx) ?? null
}

export const disp = new UnaryDispatcher<(key: Model, ctx: OperationContext) => Model | null>()
  .addClasses(allModels, {
    Product (key, ctx) {
      return ctx.lookup(this.b, key, ctx) || ctx.lookup(this.a, key, ctx)
    },
    Binding (key, ctx) {
      return ctx.equal(this.key, key, ctx) ? this.value : null
    }
  })
