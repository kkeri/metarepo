import { Rank, Model, NormalModel, DeferredModel } from './types'
import { ReduceContext } from './types'

export abstract class ModelBase implements Model {
  rank: Rank | null = null
  ctx?: ReduceContext

  parse (ctx: Model, src: Model): Model {
    return bottom
  }

  reduce (ctx: ReduceContext): NormalModel {
    if (this.rank !== null) {
      return this as NormalModel
    }
    else {
      return bottom
    }
  }

  parseInThis (goal: Model, src: Model): Model {
    return bottom
  }

  // Looks up a name in this model.
  lookup (name: Symbol) {
    return bottom
  }

  equals (other: Model): boolean {
    return false
  }

  ranked (rank: Rank): NormalModel {
    this.rank = rank
    // Typescript doesn't support monotonic typing
    return this as NormalModel
  }

  inContext (ctx: ReduceContext): this {
    this.ctx = ctx
    return this
  }
}

export class Constant extends ModelBase {
  kind: 'constant'

  constructor (
    public rank: Rank
  ) {
    super()
  }
}

export class Empty extends ModelBase {
  kind: 'empty'
  rank = Rank.Neutral

  constructor () {
    super()
  }
}

export class Missing extends ModelBase {
  rank = Rank.Bottom

  constructor (
    public a: Model
  ) {
    super()
  }
}

export class Or extends ModelBase {
  kind: 'or'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class And extends ModelBase {
  kind: 'and'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class Sum extends ModelBase {
  kind: 'sum'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class Prod extends ModelBase {
  kind: 'prod'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class Typing extends ModelBase {
  kind: 'binding'

  constructor (
    public a: Model,
    public b: Model,
  ) {
    super()
  }
}

export class Fn extends ModelBase {
  kind: 'fn'

  constructor (
    public items: Model[],
  ) {
    super()
  }
}

export class Seq extends ModelBase {
  kind: 'seq'

  constructor (
    public items: DeferredModel[],
  ) {
    super()
  }

  reduce (ctx: ReduceContext): NormalModel {
    for (let i = 0; i < this.items.length; ++i) {
      // normalize the next operand
      const item = this.items[i]
      const nf = typeof item === 'function'
        ? item().reduce(ctx)
        : item.reduce(ctx)
      this.items[i] = nf
    }
    return this.ranked(Rank.Neutral).inContext(ctx)
  }
}

export class Parens extends ModelBase {
  kind: 'parens'

  constructor (
    public a: Model[],
  ) {
    super()
  }
}

export class SymbolType extends ModelBase {
  kind: 'symbolType'

  constructor (
    public chars: string,
  ) {
    super()
  }

  reduce () {
    return this.ranked(0)
  }
}

export class Symbol extends ModelBase {
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

export { UpperJoin, LowerJoin } from './join'
export { UpperMeet, LowerMeet } from './meet'
export { ArrowCombinator } from './arrow'
