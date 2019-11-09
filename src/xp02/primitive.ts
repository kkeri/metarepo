import { ModelClass, BottomClass } from './model'

export class NumberType extends ModelClass {
  static regexp = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/y
  rank = 0

  parse (pc) {
    const match = pc.matchRegexp(NumberType.regexp)
    if (match) return new NumberLiteral(Number(match))
    return new BottomClass()
  }
}

export class NumberLiteral extends ModelClass {
  rank = 0

  constructor (
    public value: number
  ) {
    super()
  }

  parse (pc) {
    const match = pc.matchRegexp(NumberType.regexp)
    if (match && Number(match) === this.value) return this
    return new BottomClass()
  }
}

export class StringLiteral extends ModelClass {
  rank = 0

  constructor (
    public value: string
  ) {
    super()
  }

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
