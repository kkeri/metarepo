import * as model from './model'
import { UnaryDispatcher } from './dispatcher'
import { matchString, matchRegexp, ParserRule, parse, skipSpace } from './parser'
import { Rank } from './types'
import { } from './join'
import { } from './meet'

const numberRegExp = /[-+]?[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?/y
const booleanRegExp = /true|false/y

export const parseRules = new UnaryDispatcher<ParserRule>().addClasses(model, {

  NullType: (ctx, syntax) => {
    return matchString(ctx, 'null')
      ? new model.NullConstant()
      : new model.Missing(syntax)
  },

  BooleanType: (ctx, syntax) => {
    const match = matchRegexp(ctx, booleanRegExp)
    return match
      ? new model.BooleanConstant(Boolean(match === 'true'))
      : new model.Missing(syntax)
  },

  NumberType: (ctx) => {
    const match = matchRegexp(ctx, numberRegExp)
    return match
      ? new model.NumberConstant(Number(match))
      : new model.Missing(new model.NumberType())
  },

  Or: (ctx, syntax: model.Or) => {
    const pos = ctx.pos

    const a = parse(ctx, syntax.a)
    if (a.rank != null && a.rank > Rank.Failure) return a
    ctx.pos = pos

    const b = parse(ctx, syntax.b)
    if (b.rank != null && b.rank > Rank.Failure) return b
    ctx.pos = pos

    return ctx.join(a, b)
  },

  And: (ctx, syntax: model.And) => {
    skipSpace(ctx)
    const a = parse(ctx, syntax.a)
    if (a.rank != null && a.rank <= Rank.Failure) return a

    skipSpace(ctx)
    const b = parse(ctx, syntax.b)
    if (b.rank != null && b.rank <= Rank.Failure) return b

    return ctx.meet(a, b)
  },
})
