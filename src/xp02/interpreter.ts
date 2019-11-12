import * as model from './model'
import { Model, ReduceContext, NormalModel } from './types'

// Resolves an expression in an environment.
// If the environment provides sufficient information,
// the function returns the normal form of the expression,
// Otherwise it returns a redex.
// The resolve function specialized to an environment is idempotent:
// resolve' m = resolve m e; resolve' (resolve' m) = resolve' m
// export function reduce (expr: Model, env: Model, ctx: ReduceContext,
//   parent?: Model, prop?: string): Model {
//   let hooks = ctx.options.hooks
//   let from = expr
//   if (hooks) hooks.emit('beforeEvaluate', from, parent, prop)
//   while (isRedex(expr)) {
//     let r = expr.reduce(env, ctx)
//     if (r === expr) break
//     expr = r
//   }
//   if (hooks) {
//     hooks.emit('afterEvaluate', expr, parent, prop)
//     hooks.emit('evaluate', from, expr, parent, prop)
//   }
//   return expr
// }

// Applies a function to an argument.
export function apply (fn: Model, args: Model): Model {
  return new model.Application(fn, args)
}

export function and (a: Model, b: Model): Model {
  if (a === b) return a; else return new model.And(a, b)
}

export function or (a: Model, b: Model): Model {
  if (a === b) return a; else return new model.Or(a, b)
}

// export function equal (a: Model, b: Model): boolean {
//   if (a === b) return true
//   if (a.rank !== b.rank) return false
//   if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
//   return a.equal(b)
// }

// export function createContext (ctx: ReduceContext, env?: Model & Monoid): ReduceContext {
//   let newCtx = Object.assign({}, ctx)
//   if (env) newCtx.env = env
//   return newCtx
// }

// export function isApplicable (model: Model): boolean {
//   return typeof model.apply === 'function'
// }

// export function isRedex (model: Model): boolean {
//   return model.rank === undefined
// }

// export function isNormalForm (model: Model): model is NormalModel {
//   return model.rank !== undefined
// }
