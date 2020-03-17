import { ActionMap } from '../util/action'
import * as model from './model'
import { OperatorMap } from '../util/printer'

export const printActions = new ActionMap().addClasses(model, {

  Typing (printer, prec) {
    if (prec < operator.typing.precedence) {
      printer.operation(operator.typing, prec, this.a, this.b)
    }
    else {
      printer.print(this.a, prec)
    }
  },

  FunctionType (printer, prec) {
    printer.operation(operator.arrow, prec, this.a, this.b)
  },

  Sequence (printer, prec) {
    printer.operation(operator.seq, prec, this.a, this.b)
  },

  SymbolInstance (printer) {
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
  typing: {
    precedence: 40,
    fixity: 'in',
    symbol: ':',
  },
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
  seq: {
    precedence: 400,
    fixity: 'in',
    symbol: ' ',
    noPadding: true,
  },
}
