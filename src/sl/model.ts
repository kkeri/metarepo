import { Context, isApplicable, isRedex, Model, Monoid, Rank } from './iface';
import { apply, choose, equal, resolve, reflect, join, meet, thunk, createContext } from './interpreter';


// Obsoleted, use only as a reminder
export class ModelClass implements Model {
  env?: Model
  rank?: Rank

  resolve (env: Model, ctx: Context): Model {
    return this
  }

  reflect (): Model {
    return this
  }

  lookup (name): Model | null {
    return null
  }

  equal (other): Model {
    return False
  }

  // bound (env) {
  //   if (this.env) {
  //     if (this.env !== env) {
  //       return new Failure(this, 'NO_JOIN', `can't join bindings`)
  //     }
  //   }
  //   else {
  //     this.env = env
  //   }
  //   return this
  // }

  ranked (rank): Model {
    if (this.rank !== undefined) {
      return new Failure(this, 'NO_JOIN', `the model already has a rank`)
    }
    this.rank = rank
    return this
  }

  shallowCopy () {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this)
  }
}

// module structure

export class BracketBlock extends ModelClass {
  constructor (
    public contents: Model
  ) {
    super()
  }

  resolve (env, ctx) {
    return resolve(this.contents, env, ctx, this, "contents")
  }

  equal (other) {
    return equal(this.contents, other.contents)
  }
}

export class BraceBlock extends ModelClass {
  constructor (
    public contents: Model
  ) {
    super()
  }

  resolve (env, ctx) {
    let newEnv = new Environment(env)
    newEnv.updateRight(this.contents, ctx)
    return newEnv
  }

  equal (other) {
    return equal(this.contents, other.contents)
  }
}

export class Environment extends ModelClass implements Monoid {
  version = 1
  value: Model = new Success(Null, 'EMPTY_ENV', 'empty environment')
  lookupSet = new Set<string>()

  constructor (
    public parent?: Model & Monoid
  ) {
    super()
  }

  updateLeft (value, ctx): Model {
    let newValue = meet(value, this.value)
    this.value = resolve(newValue, newValue, ctx, this, 'value')
    this.version++
    return this.value
  }

  updateRight (value, ctx): Model {
    // let re = this.value // resolve(this.value, value, ctx, this, 'value')
    // let rv = resolve(value, this.value, ctx)
    this.value = resolve(meet(this.value, value), Top, ctx, this, 'value')
    this.version++
    return this.value
  }

  lookup (name) {
    if (this.lookupSet.has(name.name)) {
      // circular lookup detection
      return null
    }
    this.lookupSet.add(name.name)
    let r = this.value.lookup(name) || this.parent && this.parent.lookup(name) || null
    this.lookupSet.delete(name.name)
    return r
  }

  reflect () {
    return new BraceBlock(this.value)
  }
}

export class Thunk extends ModelClass {
  busy = false
  circular = false

  constructor (
    public value: Model,
    public env: Model & Monoid
  ) {
    super()
  }

  resolve (_, ctx) {
    if (this.busy) {
      this.circular = true
      return new Failure(this, 'CIRCULAR_REF', 'circular reference detected')
    }
    try {
      this.busy = true
      let newCtx = createContext(ctx, this.env)
      let value = resolve(this.value, this.env, newCtx, this, 'value')
      if (this.circular) return value
      this.value = value
      if (this.value instanceof Thunk) return this.value
      if (isRedex(this.value)) {
        return this
      }
      return this.value
    }
    finally {
      this.busy = false
    }
  }

  reflect () {
    return this.value.reflect()
  }
}

export class Binding extends ModelClass {
  constructor (
    public name: Model,
    public value: Model
  ) {
    super()
  }

  resolve (env, ctx) {
    let value = resolve(this.value, env, ctx, this, 'value')
    if (value === this.value) return this
    if (isRedex(value)) return new Binding(this.name, value)
    return new Binding(this.name, value).ranked(value.rank)
  }

  reflect () {
    return apply(apply(new Name('bind'), this.name), this.value)
  }

  lookup (name) {
    if (equal(this.name, reflect(name)).rank >= Rank.True) {
      return this.value
    }
    else {
      return null
    }
  }

  equal (other) {
    return meet(equal(this.name, other.name), equal(this.value, other.value))
  }
}

export class Name extends ModelClass {
  constructor (
    public name: string,
    // Binding environment version for block detection.
    public envVersion: number = 0
  ) {
    super()
  }

  resolve (env, ctx) {
    return env.lookup(this) || this
  }

  equal (other) {
    return other.name === this.name ? True : False
  }

  reflect () {
    let r = new Name(this.name)
    r.rank = Rank.Middle
    return r
  }
}

export class MemberRef extends ModelClass {
  constructor (
    public base: Model,
    public name: Model,
  ) {
    super()
  }

  resolve (env, ctx) {
    // let base = resolve(this.base, env, ctx, this, 'base')
    // if (base === this.base) return this
    // if (isRedex(base)) return new MemberRef(base, this.name)
    return this.base.lookup(this.name) || this
  }
}

// values

export class Literal extends ModelClass implements Model {
  constructor (
    public value,
    public rank: Rank = 0
  ) {
    super()
  }

  equal (other) {
    return this.value === other.value ? True : False
  }
}

export class Failure extends ModelClass {
  rank = Rank.Failure

  constructor (
    public model,
    public code,
    public message
  ) {
    super()
  }

  reflect () {
    return apply(apply(new Name('fail'), new Literal(this.code)), this.model)
  }

  equal (other) {
    return meet(
      this.code === other.code ? True : False,
      equal(this.model, other.model)
    )
  }
}

export class TopClass extends ModelClass {
  rank = Rank.Success

  constructor () {
    super()
  }

  reflect () {
    return new Name('Top')
  }
}

export class Success extends ModelClass {
  rank = Rank.Success

  constructor (
    public model,
    public code,
    public message
  ) {
    super()
  }

  reflect () {
    return apply(apply(new Name('succeed'), new Literal(this.code)), this.model)
  }

  equal (other) {
    return this.message === other.message ? True : False
  }
}

// operations

export class Join extends ModelClass {
  constructor (
    public a,
    public b
  ) {
    super()
  }

  resolve (_, ctx) {
    let newEnv = new Environment(ctx.env)
    let newCtx = createContext(ctx, newEnv)
    let a = resolve(this.a, newEnv, newCtx, this, 'a')
    if (!isRedex(a) && a.rank && a.rank >= Rank.Success) return a

    newEnv = new Environment(ctx.env)
    newCtx = createContext(ctx, newEnv)
    let b = resolve(this.b, newEnv, newCtx, this, 'b')
    if (!isRedex(b) && b.rank && b.rank >= Rank.Success) return b

    if (a.rank === undefined || b.rank === undefined || isRedex(a) || isRedex(b)) {
      if (a === this.a && b === this.b) {
        return this
      }
      else {
        return join(a, b)
      }
    }

    // a hack of lattice join
    if (a.rank > b.rank) return a
    if (b.rank > a.rank) return b
    if (a.rank !== 0 && equal(a, b).rank >= Rank.True) return a
    return join(a, b).ranked(a.rank)
  }

  reflect () {
    return join(this.a, this.b)
  }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* Join.tree(this.a)
    yield* Join.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof Join) yield* model; else yield model
  }
}

export class Meet extends ModelClass {
  constructor (
    public a,
    public b
  ) {
    super()
  }

  resolve (env, ctx) {
    let a = resolve(this.a, env, ctx, this, 'a')
    if (!isRedex(a) && a.rank <= Rank.Failure) return a
    let b = resolve(this.b, env, ctx, this, 'b')
    if (!isRedex(b) && b.rank <= Rank.Failure) return b

    if (isRedex(a) || isRedex(b)) {
      if (a === this.a && b === this.b) {
        return this
      }
      else {
        return meet(a, b)
      }
    }

    // a hack of lattice meet
    if (a.rank < b.rank) return a
    if (b.rank < a.rank) return b
    if (a.rank !== 0 && equal(a, b).rank >= Rank.True) return a
    return meet(a, b).ranked(a.rank)
  }

  reflect () {
    return meet(this.a, this.b)
  }

  lookup (name) {
    // one of three ways to refer to a variable in an environment:
    // this one returns the most recent binding of the variable.
    return this.b.lookup(name) || this.a.lookup(name)
  }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* Meet.tree(this.a)
    yield* Meet.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof Meet) yield* model; else yield model
  }
}

export class Choice extends ModelClass {
  constructor (
    public a,
    public b
  ) {
    super()
  }

  resolve (decl, ctx) {
    let newEnv = new Environment(ctx.env)
    let newCtx = createContext(ctx, newEnv)
    let a = resolve(this.a, newEnv, newCtx, this, 'a')
    if (isRedex(a)) {
      if (a === this.a) {
        return this
      }
      else {
        return choose(a, this.b)
      }
    }
    if (a.rank > Rank.Failure) return a
    return this.b
  }

  reflect () {
    return choose(this.a, this.b)
  }

}

export class Sequence extends ModelClass {
  constructor (
    public a,
    public b
  ) {
    super()
  }

  resolve (env, ctx) {
    let a = resolve(this.a, env, ctx, this, 'a')
    if (!isRedex(a) && a.rank <= Rank.Failure) return a
    let b = resolve(this.b, env, ctx, this, 'b')
    if (!isRedex(b) && b.rank <= Rank.Failure) return b

    if (isRedex(a) || isRedex(b)) {
      if (a === this.a && b === this.b) {
        return this
      }
      else {
        return new Sequence(a, b)
      }
    }

    // todo: clarify, what should be the rank of the result
    return new Sequence(a, b).ranked(Rank.Middle)
  }

  reflect () {
    return new Sequence(this.a, this.b)
  }
}

export class Abstraction extends ModelClass {
  constructor (
    public a,
    public b
  ) {
    super()
    this.rank = Rank.Middle
  }

  reflect () {
    return apply(apply(new Name('lambda'), this.a), this.b)
  }

  apply (arg, env, ctx) {
    return meet(new Binding(this.a, arg), this.b)
  }
}

export class Application extends ModelClass {
  constructor (
    public a,
    public b
  ) {
    super()
  }

  resolve (decl, ctx) {
    let a = resolve(this.a, decl, ctx, this, 'a')
    if (a === this.a && isRedex(a)) return this

    if (isRedex(a)) {
      return new Application(a, this.b)
    }
    else if (isApplicable(a)) {
      return a.apply(thunk(this.b, ctx.env), new Environment(ctx.env), ctx)
    }
    else {
      return new Failure(a, 'FUNCTION_REQUIRED', 'function required')
    }
  }

  reflect () {
    return new Application(this.a, this.b)
  }
}

// constant

export const True = new Literal(true, Rank.True)
export const Top = new TopClass()
export const False = new Literal(false, Rank.False)
export const Null = new Literal(null, Rank.Middle)
