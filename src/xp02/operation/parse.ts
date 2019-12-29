import { Model, Rank, OperationContext } from '../types'
import { UnaryDispatcher } from '../dispatcher'
import { Failure } from '../model'

export type ParserRule = (ctx: ParseContext, syntax: Model) => Model

export type RestorePoint = number

export interface ParseContext extends OperationContext {
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
  // todo: use the current scope for name resolution
  return ctx.rules.get(syntax)?.(ctx, syntax) ??
    new Failure(syntax, 'RULE_NOT_FOUND', 'parse rule not found')
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
