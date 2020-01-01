import { Model, Rank, BinaryPredicate } from './types'

// constant

export class True implements Model {
  rank = 1
  equals () { return true }
}

export class False implements Model {
  rank = -1
  equals () { return true }
}

export class Top implements Model {
  rank = Rank.Success
  equals () { return true }
}

export class Bottom implements Model {
  rank = Rank.Failure
  equals () { return true }
}

export class NullType implements Model {
  rank = 0
  equals () { return true }
}

export class NullConstant implements Model {
  rank = 0
  equals () { return true }
}

export class BooleanType implements Model {
  rank = 0
  equals () { return true }
}

export class BooleanConstant implements Model {
  rank = 0

  constructor (
    public value: boolean
  ) { }

  equals (other: BooleanConstant) {
    return this.value === other.value
  }
}

export class NumberType implements Model {
  rank = 0
  equals () { return true }
}

export class NumberConstant implements Model {
  rank = 0

  constructor (
    public value: number
  ) { }

  equals (other: NumberConstant) {
    return this.value === other.value
  }
}

export class StringType implements Model {
  rank = 0
  equals () { return true }
}

export class StringConstant implements Model {
  rank = 0

  constructor (
    public value: string
  ) { }

  equals (other: StringConstant) {
    return this.value === other.value
  }

  parse (pc) {
    if (pc.source.substr(pc.pos, this.value.length) === this.value) {
      pc.pos += this.value.length
      return this
    }
    else {
      return new Bottom()
    }
  }
}

export class RegExpType implements Model {
  static regexp = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/y
  rank = 0
  equals () { return true }

  parse (pc) {
    const match = pc.matchRegexp(RegExpType.regexp)
    if (match) return new RegExpConstant(match)
    return new Bottom()
  }
}

// This regex is always sticky.
export class RegExpConstant implements Model {
  rank = 0
  regexp: RegExp

  constructor (
    regexp: string | RegExp
  ) {
    this.regexp = typeof regexp === 'string'
      ? new RegExp(regexp, 'y')
      : new RegExp(regexp.source, regexp.flags + 'y')
  }

  equals (other: RegExpConstant) {
    return this.regexp.source === other.regexp.source &&
      this.regexp.flags === other.regexp.flags
  }
}


// module structure

export class BracketBlock implements Model {
  rank = null

  constructor (
    public contents: Model
  ) { }

  equals (other: BracketBlock, equal: BinaryPredicate<Model>) {
    return equal(this.contents, other.contents)
  }
}

export class BracketList implements Model {
  constructor (
    public a: Model,
    public b: Model,
    public rank: Rank | null = null
  ) { }

  equals (other: BracketList, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }
}

export class BraceBlock implements Model {
  rank = null

  constructor (
    public contents: Model
  ) { }

  equals (other: BraceBlock, equal: BinaryPredicate<Model>) {
    return equal(this.contents, other.contents)
  }
}

export class BraceList implements Model {
  constructor (
    public a: Model,
    public b: Model,
    public rank: Rank | null = null
  ) { }

  equals (other: BraceList, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }
}

export class ParenBlock implements Model {
  rank = null

  constructor (
    public contents: Model
  ) { }

  equals (other: ParenBlock, equal: BinaryPredicate<Model>) {
    return equal(this.contents, other.contents)
  }
}

export class ParenList implements Model {
  constructor (
    public a: Model,
    public b: Model,
    public rank: Rank | null = null
  ) { }

  equals (other: ParenList, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }
}

export class Binding implements Model {
  rank = null

  constructor (
    public key: Model,
    public value: Model
  ) { }

  equals (other: Binding, equal: BinaryPredicate<Model>) {
    return equal(this.key, other.key) && equal(this.value, other.value)
  }
}

export class NameType implements Model {
  rank = 0
  equals () { return true }
}

export class NameConstant implements Model {
  constructor (
    public name: string,
    public rank: Rank | null = null
  ) { }

  equals (other: NameConstant, equal: BinaryPredicate<Model>) {
    return this.name === other.name
  }
}

export class MemberRef implements Model {
  rank = null

  constructor (
    public base: Model,
    public name: Model,
  ) { }

  equals (other: MemberRef, equal: BinaryPredicate<Model>) {
    return equal(this.base, other.base) && equal(this.name, other.name)
  }
}

// values

export class Optional implements Model {
  rank = null

  constructor (
    public a: Model
  ) { }

  equals (other: Optional, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
  }
}

export class Missing implements Model {
  rank = Rank.Failure

  constructor (
    public a: Model
  ) { }

  equals (other: Missing, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
  }
}

export class Success implements Model {
  rank = Rank.Success

  constructor (
    public model,
    public code,
    public message
  ) { }

  equals (other: Success, equal: BinaryPredicate<Model>) {
    return equal(this.model, other.model)
      && equal(this.code, other.code)
      && equal(this.message, other.message)
  }
}

export class Failure implements Model {
  rank = Rank.Failure

  constructor (
    public model,
    public code,
    public message
  ) { }

  equals (other: Failure, equal: BinaryPredicate<Model>) {
    return equal(this.model, other.model)
      && equal(this.code, other.code)
      && equal(this.message, other.message)
  }
}

// Combinators

export class Sum implements Model {
  constructor (
    public a: Model,
    public b: Model,
    public rank: Rank | null = null
  ) { }

  equals (other: Sum, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* Sum.tree(this.a)
    yield* Sum.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof Sum) yield* model; else yield model
  }
}

export class Product implements Model {
  constructor (
    public a: Model,
    public b: Model,
    public rank: Rank | null = null
  ) { }

  equals (other: Product, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* Product.tree(this.a)
    yield* Product.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof Product) yield* model; else yield model
  }
}

export class Not implements Model {
  constructor (
    public a: Model,
    public rank: Rank | null = null
  ) { }

  equals (other: Not, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
  }
}

export class Abstraction implements Model {
  rank = Rank.Middle

  constructor (
    public a: Model,
    public b: Model,
  ) { }

  equals (other: Abstraction, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }
}

export class Application implements Model {
  rank = Rank.Middle

  constructor (
    public a: Model,
    public b: Model,
  ) { }

  equals (other: Application, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }
}

export class Sequence implements Model {
  rank = Rank.Middle

  constructor (
    public a: Model,
    public b: Model,
  ) { }

  equals (other: Application, equal: BinaryPredicate<Model>) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }
}
