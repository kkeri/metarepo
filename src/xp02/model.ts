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

  equals (other: BracketBlock, equal: BinaryPredicate) {
    return equal(this.contents, other.contents)
  }
}

export class BraceBlock implements Model {
  rank = null

  constructor (
    public contents: Model
  ) { }

  equals (other: BraceBlock, equal: BinaryPredicate) {
    return equal(this.contents, other.contents)
  }
}

export class Binding implements Model {
  rank = null

  constructor (
    public key: Model,
    public value: Model
  ) { }

  equals (other: Binding, equal: BinaryPredicate) {
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

  equals (other: NameConstant, equal: BinaryPredicate) {
    return this.name === other.name
  }
}

export class MemberRef implements Model {
  rank = null

  constructor (
    public base: Model,
    public name: Model,
  ) { }

  equals (other: MemberRef, equal: BinaryPredicate) {
    return equal(this.base, other.base) && equal(this.name, other.name)
  }
}

// values

export class Optional implements Model {
  rank = null

  constructor (
    public a: Model
  ) { }

  equals (other: Optional, equal: BinaryPredicate) {
    return equal(this.a, other.a)
  }
}

export class Missing implements Model {
  rank = Rank.Failure

  constructor (
    public a: Model
  ) { }

  equals (other: Missing, equal: BinaryPredicate) {
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

  equals (other: Success, equal: BinaryPredicate) {
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

  equals (other: Failure, equal: BinaryPredicate) {
    return equal(this.model, other.model)
      && equal(this.code, other.code)
      && equal(this.message, other.message)
  }
}

// Combinators

export class Or implements Model {
  constructor (
    public a: Model,
    public b: Model,
    public rank: Rank | null = null
  ) { }

  equals (other: Or, equal: BinaryPredicate) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }
}

export class And implements Model {
  constructor (
    public a: Model,
    public b: Model,
    public rank: Rank | null = null
  ) { }

  equals (other: And, equal: BinaryPredicate) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }
}

export class Not implements Model {
  constructor (
    public a: Model,
    public rank: Rank | null = null
  ) { }

  equals (other: Not, equal: BinaryPredicate) {
    return equal(this.a, other.a)
  }
}

export class Abstraction implements Model {
  rank = Rank.Middle

  constructor (
    public a: Model,
    public b: Model,
  ) { }

  equals (other: Abstraction, equal: BinaryPredicate) {
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

  equals (other: Application, equal: BinaryPredicate) {
    return equal(this.a, other.a)
      && equal(this.b, other.b)
  }
}
