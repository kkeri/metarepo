import { ActionMap } from '../util/action'
import * as model from '../graphcode/model'
import * as native from './native'

export const printActions = new ActionMap().addClasses(model, {

  BracketBlock (printer) {
    printer.fmt.block(model.Join.tree(this.contents),
      elem => printer.print(elem, operator.join.precedence), bracketBlock)
  },

  BraceBlock (printer) {
    printer.fmt.block(model.Meet.tree(this.contents),
      elem => printer.print(elem, operator.meet.precedence), braceBlock)
  },

  // values

  Literal (printer) {
    printer.print(this.value)
  },

  Name (printer) {
    printer.id(this.name)
  },

  MemberRef (printer, prec, ) {
    printer.operation(operator.memberRef, prec, this.base, this.name)
  },

  // operations

  Join (printer, prec) {
    printer.operation(operator.join, prec, this.a, this.b)
  },

  Meet (printer, prec) {
    printer.operation(operator.meet, prec, this.a, this.b)
  },

  Choice (printer, prec) {
    printer.operation(operator.choice, prec, this.a, this.b)
  },

  Sequence (printer, prec) {
    printer.operation(operator.app, prec, this.a, this.b)
  },

  Application (printer, prec) {
    printer.operation(operator.app, prec, this.a, this.b)
  },
}).addClasses(native, {

  NativeFunction (printer) {
    printer.fmt.emit('<NativeFunction>')
  },
})

const braceBlock = {
  open: { value: '{' },
  close: '}',
  beforeFirst: { value: ' ', breakValue: '' },
  afterLast: { value: ' ', breakValue: '' },
  terminator: { value: '; ', breakValue: '' }
}

const parenBlock = {
  open: '(',
  close: ')',
  separator: ','
}

const bracketBlock = {
  open: '[',
  close: ']',
  separator: ','
}

const term = { value: ';', breakValue: '' }

const operator = {
  join: {
    precedence: 100,
    fixity: 'in',
    symbol: '\\/',
  },
  meet: {
    precedence: 200,
    fixity: 'in',
    symbol: '/\\',
  },
  choice: {
    precedence: 300,
    fixity: 'in',
    symbol: '\\\\',
  },
  app: {
    precedence: 400,
    fixity: 'in',
    symbol: ' ',
    noPadding: true,
  },
  memberRef: {
    precedence: 500,
    fixity: 'in',
    symbol: '.',
    noPadding: true,
  },
}
