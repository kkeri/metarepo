import { readFileSync } from 'fs'
import { join } from 'path'
import { makeRecipe } from 'ohm-js/src/main.js'
import { Diagnostics } from '../util/diag'
import * as model from './model'

var ohmParser
var semantics

function initParser () {
  const recipePath = join(__dirname, '../ohm/metahack-recipe.js')
  const recipe = readFileSync(recipePath, 'utf-8')

  // this is the recommended way to load an Ohm parser
  ohmParser = makeRecipe(eval(recipe)) // eslint-disable-line

  semantics = ohmParser.createSemantics()
  semantics.addOperation('model', modelActions)
}

export function parse (str: string, opts: {
  diag: Diagnostics,
  rule?: string,
} = {
    diag: new Diagnostics(),
  }) {
  if (!ohmParser) initParser()
  let mr = ohmParser.match(str, opts.rule)
  if (mr.failed()) {
    opts.diag.error(null, 'PARSE_ERROR', mr.message)
    return null
  } else {
    return semantics(mr).model()
  }
}

const modelActions = {

  Module (stmts, _sc_) {
    return stmts.model()
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
}
