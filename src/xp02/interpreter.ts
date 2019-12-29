import * as model from './model'
import { Model } from './types'
import { ActionMap } from '../util/action'

export interface EvalContext {
  eval (a: Model, ctx: EvalContext): Model
}


export function evaluate (a: Model, ctx: EvalContext): Model {
  return evalMap.get(a).call(a, ctx)
}

export const evalMap = new ActionMap().addClasses(model, {
  Binding (ctx) {
    ctx.scope = new model.Sequence(ctx.scope, this)
    return new model.Top()
  },
}).addClasses({ Object }, {
  Object () {
    return this
  },
})
