import { Model, Rank } from './types'

// constant

export const True = new (class { })()
export const False = new (class { })()
export const Top = new (class { })()
export const Bottom = new (class { })()

export class NullType {
  rank = 0
}

export class NullConstant {
  rank = 0
}

export class BooleanType {
  rank = 0
}

export class BooleanConstant {
  rank = 0

  constructor (
    public value: boolean
  ) { }
}

export class NumberType {
  rank = 0
}

export class NumberConstant {
  rank = 0

  constructor (
    public value: number
  ) { }
}

export class StringType {
  rank = 0

  constructor (
    public value: string
  ) { }
}

export class StringConstant {
  rank = 0

  constructor (
    public value: string
  ) { }

  parse (pc) {
    if (pc.source.substr(pc.pos, this.value.length) === this.value) {
      pc.pos += this.value.length
      return this
    }
    else {
      return new BottomClass()
    }
  }
}

export class RegExpType {
  static regexp = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/y
  rank = 0

  parse (pc) {
    const match = pc.matchRegexp(RegExpType.regexp)
    if (match) return new RegExpConstant(match)
    return new BottomClass()
  }
}

export class RegExpConstant {
  rank = 0

  constructor (
    public value: string
  ) { }

  parse (pc) {
    if (pc.source.substr(pc.pos, this.value.length) === this.value) {
      pc.pos += this.value.length
      return this
    }
    else {
      return new BottomClass()
    }
  }
}


// module structure

export class BracketBlock {
  constructor (
    public contents: Model
  ) { }
}

export class BraceBlock {
  constructor (
    public contents: Model
  ) { }
}

export class Binding {
  constructor (
    public name: Model,
    public value: Model
  ) { }
}

export class NameType {
  rank = 0
}

export class NameConstant {
  constructor (
    public name: string,
    public rank: Rank | null = null
  ) { }
}

export class MemberRef {
  constructor (
    public base: Model,
    public name: Model,
  ) { }
}

// values

export class TopClass {
  rank = Rank.Success

  constructor () { }
}

export class BottomClass {
  rank = Rank.Failure

  constructor () { }
}

export class Missing {
  rank = Rank.Failure

  constructor (
    public a: Model
  ) { }
}

export class Success {
  rank = Rank.Success

  constructor (
    public model,
    public code,
    public message
  ) { }
}

export class Failure {
  rank = Rank.Failure

  constructor (
    public model,
    public code,
    public message
  ) { }
}

// Combinators

export class Or {
  constructor (
    public a: Model,
    public b: Model,
    public rank: Rank | null = null
  ) { }
}

export class And {
  constructor (
    public a: Model,
    public b: Model,
    public rank: Rank | null = null
  ) { }
}

export class Not {
  constructor (
    public a: Model,
    public rank: Rank | null = null
  ) { }
}

export class Abstraction {
  rank = Rank.Middle

  constructor (
    public a: Model,
    public b: Model,
  ) { }
}

export class Application {
  rank = Rank.Middle

  constructor (
    public a: Model,
    public b: Model,
  ) { }
}
