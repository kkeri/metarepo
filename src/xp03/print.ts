import { ActionMap } from '../util/action'
import * as model from './model'
import { OperatorMap } from '../util/printer'

export const printActions = new ActionMap().addClasses(model, {

  Typing (printer, prec) {
    printer.operation(operator.eq, prec, this.a, this.b)
  },

  ArrowCombinator (printer, prec) {
    printer.infixList(operator.arrow, prec, this.items)
  },

  Seq (printer) {
    printer.print(this.items)
  },

  // Or (printer, prec) {
  //   printer.operation(operator.or, prec, this.a, this.b)
  // },

  // And (printer, prec) {
  //   printer.operation(operator.and, prec, this.a, this.b)
  // },

  // Not (printer, prec) {
  //   printer.operation(operator.not, prec, this.a)
  // },

  Name (printer) {
    printer.id(this.chars)
  },

  SymbolType (printer) {
    printer.fmt.emit('`' + this.chars + '`', printer.styles.string)
  },

  Constant (printer) {
    switch (this.rank) {
      case 2: printer.id("success"); break
      case 1: printer.id("true"); break
      case 0: printer.id("neutral"); break
      case -1: printer.id("false"); break
      case -2: printer.id("failure"); break
    }
  },
})

const operator: OperatorMap = {
  eq: {
    precedence: 50,
    fixity: 'in',
    symbol: '=',
  },
  arrow: {
    precedence: 60,
    fixity: 'in',
    symbol: '->',
  },
  or: {
    precedence: 100,
    fixity: 'in',
    symbol: '\\/',
    parens: true,
  },
  and: {
    precedence: 100,
    fixity: 'in',
    symbol: '/\\',
    parens: true,
  },
  not: {
    precedence: 300,
    fixity: 'pre',
    symbol: '~',
  },
}
