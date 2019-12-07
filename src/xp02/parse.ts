import { Model, Rank, Context } from './types'
import { UnaryDispatcher } from './dispatcher'

export type ParserRule = (ctx: ParseContext, syntax: Model) => Model

export type RestorePoint = number

export interface ParseContext extends Context {
  // The source text.
  source: string
  // Name of source for diagnostics.
  sourceName: string
  // The current parsing position.
  pos: number
  // A parser function for all model types.
  rules: UnaryDispatcher<ParserRule>
}

// parses a syntax model at the current position.
export function parse (ctx: ParseContext, syntax: Model): Model {
  return ctx.rules.get(syntax)(ctx, syntax)
}


export function matchString (ctx: ParseContext, value: string) {
  if (ctx.source.substr(ctx.pos, value.length) === value) {
    ctx.pos += value.length
    return true
  }
  return false
}

export function matchRegexp (ctx: ParseContext, regexp: RegExp) {
  regexp.lastIndex = ctx.pos
  const matches = regexp.exec(ctx.source)
  if (matches) {
    ctx.pos = regexp.lastIndex
    return matches[0]
  }
  return null
}

const space = /[ \t\r\n]*/y

export function skipSpace (ctx: ParseContext, ) {
  space.lastIndex = ctx.pos
  space.test(ctx.source)
  ctx.pos = space.lastIndex
}

export class SyntaxExpectation {
  rank = Rank.Failure
  sourceName: string
  pos: number

  constructor (
    ctx: ParseContext,
    public model: Model,
  ) {
    this.sourceName = ctx.sourceName
    this.pos = ctx.pos
  }
}
