import { Model, Rank, OperationContext } from './types'
import * as model from './model'

export class NativeFunction implements Model {
  rank = Rank.Middle

  constructor (
    public apply: ((arg: Model, ctx: OperationContext) => Model)
  ) { }
}

export function createNativeDefs (): Model {
  let defs: Model = new model.Top()
  for (let name in nativeDefs) {
    let def = new model.Binding(
      new model.NameConstant(name),
      nativeDefs[name]
    )
    defs = new model.Product(defs, def)
  }
  return defs
}

const nativeDefs = {
  bind: new NativeFunction((name, ctx) => {
    if (name instanceof model.NameConstant) {
      return new NativeFunction((value, ctx) => {
        return new model.Binding(name, value)
      })
    }
    else {
      return new model.Failure(name, 'NAME_REQUIRED', 'name required')
    }
  }),
  print: new NativeFunction((arg, ctx) => {
    const norm = ctx.normalize(arg, ctx)
    ctx.printer?.print(norm).br()
    return new model.Top()
  }),
  lambda: new NativeFunction((name, ctx) => {
    if (name instanceof model.NameConstant) {
      return new NativeFunction((arg, ctx) => {
        return new model.Abstraction(name, arg)
      })
    }
    else {
      return new model.Failure(name, 'NAME_REQUIRED', 'name required')
    }
  }),
  add: new NativeFunction((arg, ctx) => {
    let a = ctx.normalize(arg, ctx)
    if (a instanceof model.NumberConstant) {
      return new NativeFunction((arg, ctx) => {
        let b = ctx.normalize(arg, ctx)
        if (a instanceof model.NumberConstant &&
          b instanceof model.NumberConstant
        ) {
          return new model.NumberConstant(a.value + b.value)
        }
        else {
          return new model.Failure(b, 'NUMBER_REQUIRED', 'number required')
        }
      })
    }
    else {
      return new model.Failure(a, 'NUMBER_REQUIRED', 'number required')
    }
  }),
}