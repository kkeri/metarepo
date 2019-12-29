import { ActionMap } from '../../util/action'
import * as model from '../model'
import { Model } from '../types'
import { NativeFunction } from '../native'

type BinaryModel = Model & { a: Model, b: Model }

function* tree (m: Model, cls: Function): IterableIterator<Model> {
  if (m instanceof cls && 'a' in m && 'b' in m) yield* children(m); else yield m
}

function* children<M extends BinaryModel> (m: M): IterableIterator<Model> {
  yield* tree(m.a, m.constructor)
  yield* tree(m.b, m.constructor)
}

export const printActions = new ActionMap().addClasses(model, {

  BracketBlock (printer) {
    printer.fmt.block(tree(this.contents, model.BracketList),
      elem => printer.print(elem, 0), bracketBlock)
  },

  BraceBlock (printer) {
    printer.fmt.block(tree(this.contents, model.BraceList),
      elem => printer.print(elem, 0), braceBlock)
  },

  ParenBlock (printer) {
    printer.fmt.block(tree(this.contents, model.ParenList),
      elem => printer.print(elem, 0), parenBlock)
  },

  // values

  Top (printer) {
    printer.id('Top')
  },

  Bottom (printer) {
    printer.id('Bottom')
  },

  Success (printer) {
    printer.id('Success').parenList([this.model, this.code])
  },

  Failure (printer) {
    printer.id('Failure').parenList([this.model, this.code])
  },

  NumberConstant (printer) {
    printer.print(this.value)
  },

  NameConstant (printer) {
    printer.id(this.name)
  },

  MemberRef (printer, prec, ) {
    printer.operation(operator.memberRef, prec, this.base, this.name)
  },

  // operations

  Or (printer, prec) {
    printer.operation(operator.join, prec, this.a, this.b)
  },

  And (printer, prec) {
    printer.operation(operator.meet, prec, this.a, this.b)
  },

  Binding (printer, prec) {
    printer.id('bind').ws().print(this.key).ws().print(this.value)
  },

  Sequence (printer, prec) {
    printer.operation(operator.app, prec, this.a, this.b)
  },

  Application (printer, prec) {
    printer.operation(operator.app, prec, this.a, this.b)
  },
}).addClasses({ NativeFunction }, {
  NativeFunction (printer) {
    printer.fmt.emit('<NativeFunction>')
  },
})
  .addClasses({ Object }, {
    Object (printer) {
      printer.id(this.constructor.name).print('{}')
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