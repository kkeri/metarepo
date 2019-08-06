import { ActionMap } from '../util/action'
import * as model from './model'

export const printActions = new ActionMap().addClasses(model, {

  Or (printer, prec) {
    printer.operation(operator.or, prec, this.a, this.b)
  },

  And (printer, prec) {
    printer.operation(operator.and, prec, this.a, this.b)
  },

  Not (printer, prec) {
    printer.operation(operator.not, prec, this.a)
  },

  Name (printer) {
    printer.id(this.name)
  },

  Truth (printer) {
    printer.id("true")
  },

  Falsehood (printer) {
    printer.id("false")
  },
})

const operator = {
  or: {
    precedence: 100,
    fixity: 'in',
    symbol: '\\/',
  },
  and: {
    precedence: 200,
    fixity: 'in',
    symbol: '/\\',
  },
  not: {
    precedence: 300,
    fixity: 'pre',
    symbol: '~',
  },
}
