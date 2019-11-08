import { resolve, reflect } from './interpreter';
import { Model, Context } from './iface';
import * as model from './model'

export class NativeFunction extends model.ModelClass {
  constructor (
    public apply: ((arg: Model, env: Model, ctx: Context) => Model)
  ) {
    super()
    this.rank = 0
  }
}

// class ArgumentBinder extends model.ModelClass {
//   constructor (
//     public name: Model
//   ) {
//     super()
//   }

//   reduce (env, ctx) {
//     if (!ctx.args) {
//       return new model.Failure(this, 'NO_ARGUMENT', 'too few arguments')
//     }
//     return new model.Binding(this.name, evaluate(nextArgument(ctx.args), ctx))
//   }
// }

// Disruptively extracts the next argument from the context.
// Note that a function is always called with at least one argument.
function nextArgument (ctx) {
  let args = ctx.args
  if (args instanceof model.Sequence) {
    let arg = args.a
    ctx.args = args.b
    return arg
  }
  else if (args) {
    let arg = args
    ctx.args = null
    return arg
  }
  else {
    return null
  }
}

// Disruptively extracts all remaining arguments from the context.
function restArguments (ctx) {
  let args = ctx.args
  ctx.args = null
  return args
}

export function nativeDefs (): Model {
  let defs: Model = new model.Success(model.Null, 'MEET_SEQUENCE', 'native functions')
  for (let name in builtins) {
    let def = new model.Binding(
      reflect(new model.Name(name)),
      builtins[name]
    )
    defs = new model.Meet(defs, def)
  }
  return defs
}

let builtins = {
  bind: new NativeFunction((arg, env) => {
    let name = reflect(arg)
    if (name instanceof model.Name) {
      return new NativeFunction((value, env) => {
        return new model.Binding(name, value)
      })
    }
    else {
      return new model.Failure(name, 'NAME_REQUIRED', 'name required')
    }
  }),
  lambda: new NativeFunction((arg, env) => {
    let name = arg.reflect()
    if (name instanceof model.Name) {
      return new NativeFunction((arg, env) => {
        return new model.Abstraction(name, arg)
      })
    }
    else {
      return new model.Failure(name, 'NAME_REQUIRED', 'name required')
    }
  }),
  // argument: new NativeFunction((ctx) => {
  //   let name = nextArgument(ctx)
  //   if (!(name instanceof model.Name)) {
  //     return new model.Failure(this, 'NAME_REQUIRED', 'name required')
  //   }
  //   return new ArgumentBinder(name)
  // }),
  print: new NativeFunction((arg, env, ctx) => {
    console.log(resolve(arg, env, ctx))
    return model.True
  }),
  add: new NativeFunction((arg, env, ctx) => {
    let a = resolve(arg, env, ctx)
    if (a instanceof model.Literal) {
      return new NativeFunction((arg, env, ctx) => {
        let b = resolve(arg, env, ctx)
        if (a instanceof model.Literal && b instanceof model.Literal) {
          return new model.Literal(a.value + b.value)
        }
        else {
          return new model.Failure(b, 'LITERAL_REQUIRED', 'literal required')
        }
      })
    }
    else {
      return new model.Failure(a, 'LITERAL_REQUIRED', 'literal required')
    }
  }),
}
