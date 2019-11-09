import { join } from 'path'
import * as model from './model'
import { OhmParser } from '../util/parser';

export const ohmParser = new OhmParser(join(__dirname, './xp02-recipe.js'), {

  Module (list, _sc_) {
    return list.model()
  },

  // expression

  SemicolonList_default (left, op, right) {
    return new model.Meet(left.model(), right.model())
  },
  CommaList_default (left, op, right) {
    return new model.Join(left.model(), right.model())
  },
  Join_default (left, op, right) {
    return new model.Join(left.model(), right.model())
  },
  Meet_default (left, op, right) {
    return new model.Meet(left.model(), right.model())
  },
  Choice_default (left, op, right) {
    return new model.Choice(left.model(), right.model())
  },
  Application_default (left, op, right) {
    return new model.Application(left.model(), right.model())
  },
  BracketBlock (_lb_, body, _comma_, _rb_) {
    return new model.BracketBlock(body.model())
  },
  BraceBlock (_lb_, body, _sc_, _rb_) {
    return new model.BraceBlock(body.model())
  },
  ParenBlock (_lb_, body, _comma_, _rb_) {
    return body.model()
  },
  MemberRef (left, op, right) {
    return new model.MemberRef(left.model(), right.model())
  },
  Name (ident) {
    return new model.Name(ident.model())
  },

  // lexer

  identifier (start, rest) {
    return this.source.contents
  },
  number (sign, int, _point_, frac, exp) {
    return new model.Literal(parseFloat(this.source.contents))
  },
  natural (chars) {
    return parseInt(this.source.contents)
  },
  singleQuotedString (quote1, chars, quote2) {
    return new model.Literal(chars.source.contents)
  },
  doubleQuotedString (quote1, chars, quote2) {
    return new model.Literal(chars.source.contents)
  },
  regexp (slash1, body, slash2, flags) {
    return new model.Failure(new model.Literal(this.source.contents),
      'NOT_IMPLEMENTED', 'regular expression is not implemented')
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
