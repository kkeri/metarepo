import { join } from 'path'
import * as model from './model'
import { OhmParser } from '../util/ohmParser'
import { ArrowCombinator } from './arrow'

// Structural parser
export const parser: OhmParser = new OhmParser(join(__dirname, './xp03-recipe.js'), {

  Module (items, _sc_) {
    return items.model()
  },

  Typing_default (a, op, b) {
    return new model.Typing(a.model(), b.model())
  },

  Fn_default (items) {
    const list = items.model()
    if (list.length === 1) {
      return list[0]
    }
    else {
      return new ArrowCombinator(list)
    }
  },

  Seq_default (items) {
    const list = items.model()
    if (list.length === 1) {
      return list[0]
    }
    else {
      return new model.Seq(list)
    }
  },

  Parens (_lb_, term, _rb_) {
    return term.model()
  },

  Symbol (ident) {
    return new model.Symbol(ident.model())
  },

  SymbolType (symbol) {
    return new model.SymbolType(symbol.model())
  },

  // lexer

  true (chars) {
    return model.truth
  },

  false (chars) {
    return model.falsehood
  },

  identifier (start, rest) {
    return this.source.contents
  },

  symbol (_lq_, chars, _rq_) {
    return chars.source.contents
  },

  NonemptyListOf (x, _, xs) {
    return [x.model()].concat(xs.model())
  },

  EmptyListOf () {
    return []
  },

  _terminal () {
    return this.source.contents
  }
})
