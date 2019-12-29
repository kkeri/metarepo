import { join } from 'path'
import * as model from './model'
import { OhmParser } from '../util/ohmParser'

export const ohmParser = new OhmParser(join(__dirname, './xp02-recipe.js'), {

  Module (list, _sc_) {
    return list.model()
  },

  // expression

  Join_default (left, op, right) {
    return new model.Or(left.model(), right.model())
  },
  Meet_default (left, op, right) {
    return new model.And(left.model(), right.model())
  },
  BracketBlock (_lb_, body, _comma_, _rb_) {
    return new model.BracketBlock(body.model()[0] || new model.Bottom())
  },
  BracketList_default (left, op, right) {
    return new model.BracketList(left.model(), right.model())
  },
  BraceBlock (_lb_, body, _sc_, _rb_) {
    return new model.BraceBlock(body.model()[0] || new model.Top())
  },
  BraceList_default (left, op, right) {
    return new model.BraceList(left.model(), right.model())
  },
  ParenBlock (_lb_, body, _comma_, _rb_) {
    return new model.ParenBlock(body.model()[0])
  },
  ParenList_default (left, op, right) {
    return new model.ParenList(left.model(), right.model())
  },
  Sequence_default (left, _space_, right) {
    return new model.Sequence(left.model(), right.model())
  },
  MemberRef (left, op, right) {
    return new model.MemberRef(left.model(), right.model())
  },
  Name (ident) {
    return new model.NameConstant(ident.model())
  },

  // lexer

  identifier (start, rest) {
    return this.source.contents
  },
  number (sign, int, _point_, frac, exp) {
    return new model.NumberConstant(parseFloat(this.source.contents))
  },
  natural (chars) {
    return parseInt(this.source.contents)
  },
  singleQuotedString (quote1, chars, quote2) {
    return new model.StringConstant(chars.source.contents)
  },
  doubleQuotedString (quote1, chars, quote2) {
    return new model.StringConstant(chars.source.contents)
  },
  regexp (slash1, body, slash2, flags) {
    return new model.RegExpConstant(this.source.contents)
  },
  regexpFlags (chars) {
    return this.source.contents
  },
  true (chars) {
    return model.True
  },
  false (chars) {
    return model.False
  },
  _terminal () {
    return this.source.contents
  }
})
