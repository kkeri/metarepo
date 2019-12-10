import { Model, BinaryPredicate, BinaryOperation } from './types'
import * as allModels from './model'
import { Or, Failure, Binding } from './model'
import { UnaryDispatcher } from './dispatcher'

export function createLookup ({ equal, dispatcher }: {
  equal: BinaryPredicate,
  dispatcher: UnaryDispatcher<LookupMethod>,
}): BinaryOperation {
  const ctx = {
    equal,
    lookup
  }
  function lookup (env: Model, key: Model): Model {
    return dispatcher.get(env)(ctx, env, key) || new Failure(env,
      'LOOKUP_FAILED',
      `failed to look up`
    )
  }
  return lookup
}

export interface LookupContext {
  lookup: BinaryOperation
  equal: BinaryPredicate
}

export type LookupMethod = (
  ctx: LookupContext,
  env: Model,
  key: Model
) => Model | null

export const lookupDispatcher: UnaryDispatcher<LookupMethod> = new UnaryDispatcher<LookupMethod>()
  .addClass(Object, () => {
    return null
  })
  .addClasses(allModels, {
    Or: (ctx, env: Or, key) => {
      return new Or(ctx.lookup(env.b, key), ctx.lookup(env.a, key))
    },
    And: (ctx, env: Or, key) => {
      return ctx.lookup(env.b, key) || ctx.lookup(env.a, key)
    },
    Binding: (ctx, env: Binding, key) => {
      return ctx.equal(env.key, key) ? env.value : null
    }
  })
