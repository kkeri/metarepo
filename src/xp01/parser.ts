import { join } from 'path'
import * as model from './model'
import { OhmParser } from '../util/ohmParser';
import { LogicalNormalForm } from './types';

export function createParser ({ or, and, not }: LogicalNormalForm): OhmParser {
  return new OhmParser(join(__dirname, './xp01-recipe.js'), {

    Module (body, _sc_) {
      return body.model()
    },

    // expression

    StatementList_default (left, op, right) {
      return and(left.model(), right.model())
    },
    Or_default (left, op, right) {
      return or(left.model(), right.model())
    },
    And_default (left, op, right) {
      return and(left.model(), right.model())
    },
    Not_default (op, right) {
      return not(right.model())
    },
    Parentheses (_lb_, body, _rb_) {
      return body.model()
    },
    Name (ident) {
      return new model.Name(ident.model())
    },

    // lexer

    true (chars) {
      return model.True
    },
    false (chars) {
      return model.False
    },
    identifier (start, rest) {
      return this.source.contents
    },
    _terminal () {
      return this.source.contents
    }
  })
}
