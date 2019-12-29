import * as model from '../model'
import { Model, OperationContext } from '../types'
import { UnaryDispatcher } from '../dispatcher'

export function normalize (a: Model, ctx: OperationContext): Model {
  while (true) {
    const method = disp.get(a)
    if (!method) return a
    const r = method.call(a, ctx)
    if (r === a) return a
    a = r
  }
}

export const disp = new UnaryDispatcher<(ctx: OperationContext) => Model>().addClasses(model, {

  // surface syntax

  Sequence (ctx) {
    return new model.Application(this.a, this.b)
  },
  NameConstant (ctx) {
    return ctx.lookup(ctx.scope, this, ctx) ??
      new model.Failure(this, 'NAME_NOT_FOUND', 'name not found')
  },
  BracketBlock (ctx) {
    return ctx.normalize(this.contents, ctx)
  },
  BraceBlock (ctx) {
    const scope = ctx.scope
    try {
      return ctx.normalize(this.contents, ctx)
    }
    finally {
      ctx.scope = scope
    }
  },
  BraceList (ctx) {
    return new model.Top()
  },
  ParenBlock (ctx) {
    return ctx.normalize(this.contents, ctx)
  },

  // deep model

  Application (ctx) {
    // interpret sequences as applications
    const ar = ctx.normalize(this.a, ctx)
    const r = ctx.apply(ar, this.b, ctx)
    if (r) {
      return r
    }
    else {
      return new model.Failure(this, 'NOT_APPLICABLE',
        'function is not applicable to the argument')
    }
  },
  Binding (ctx) {
    ctx.scope = new model.And(ctx.scope, this)
    return new model.Top()
  },
})
