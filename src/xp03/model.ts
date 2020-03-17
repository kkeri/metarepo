import { Rank, Model, NormalModel, DeferredModel } from './types'
import { ReduceContext } from './types'

export abstract class ModelClass implements Model {
  rank: Rank | null = null
  ctx?: ReduceContext

  parse (ctx: Model, src: Model): Model {
    return bottom
  }

  parseInThis (goal: Model, src: Model): Model {
    return bottom
  }

  equals (other: Model): boolean {
    return false
  }

  ranked (rank: Rank): NormalModel {
    if (this.rank === null) this.rank = rank
    // Typescript doesn't support monotonic typing
    return this as NormalModel
  }

  inContext (ctx: ReduceContext): this {
    this.ctx = ctx
    return this
  }
}

export class Constant extends ModelClass {
  kind: 'constant'

  constructor (
    public rank: Rank
  ) {
    super()
  }
}

export class Empty extends ModelClass {
  kind: 'empty'
  rank = Rank.Neutral

  constructor () {
    super()
  }
}

export class Missing extends ModelClass {
  rank = Rank.Bottom

  constructor (
    public a: Model
  ) {
    super()
  }
}

export class Or extends ModelClass {
  kind: 'or'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class And extends ModelClass {
  kind: 'and'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class Sum extends ModelClass {
  kind: 'sum'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class Prod extends ModelClass {
  kind: 'prod'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class UpperJoin extends ModelClass {
  kind: 'upperJoin'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* UpperJoin.tree(this.a)
    yield* UpperJoin.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof UpperJoin) yield* model; else yield model
  }
}

export class LowerJoin extends ModelClass {
  kind: 'lowerJoin'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* LowerJoin.tree(this.a)
    yield* LowerJoin.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof LowerJoin) yield* model; else yield model
  }
}

export class UpperMeet extends ModelClass {
  kind: 'upperMeet'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* UpperMeet.tree(this.a)
    yield* UpperMeet.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof UpperMeet) yield* model; else yield model
  }
}

export class LowerMeet extends ModelClass {
  kind: 'lowerMeet'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* LowerMeet.tree(this.a)
    yield* LowerMeet.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof LowerMeet) yield* model; else yield model
  }
}

export class Typing extends ModelClass {
  kind: 'binding'
  rank = Rank.Neutral

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class FunctionType extends ModelClass {
  kind: 'fn'
  rank = Rank.Neutral

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class Sequence extends ModelClass {
  kind: 'seq'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class Parens extends ModelClass {
  kind: 'parens'

  constructor (
    public a: Model[],
  ) {
    super()
  }
}

export class SymbolType extends ModelClass {
  kind: 'symbolType'
  rank = Rank.Neutral

  constructor (
    public chars: string,
  ) {
    super()
  }

  reduce () {
    return this.ranked(0)
  }
}

export class SymbolInstance extends ModelClass {
  kind: 'name'

  constructor (
    public chars: string,
  ) {
    super()
  }

  norm (ctx: NormalModel) {
    return ctx instanceof SymbolType && ctx.chars === this.chars
      ? top
      : bottom
  }
}

export const top = new Constant(Rank.Top)

export const bottom = new Constant(Rank.Bottom)

export const truth = new Constant(Rank.True)

export const falsehood = new Constant(Rank.False)

// Denotes undefined result of a model level operation.
export const undef = new Constant(Rank.Undefined)
