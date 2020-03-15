import { normalize } from './operation/normalize'
import { apply } from './operation/apply'
import { lookup } from './operation/lookup'
import { equal } from './operation/equal'
import { createNativeDefs } from './native'
import { createStateStorage } from './useState'
import { OperationContext } from './types'
import { repl, formatOptions, styles } from './repl'
import { createReadStream } from 'fs'
import { PrettyFormatter } from '../util/format'
import { ModelPrinter } from '../util/printer'
import { printActions } from './operation/print'

const input = process.argv[2]
  ? createReadStream(process.argv[2])
  : process.stdin

const output = process.stdout

const formatter = new PrettyFormatter(output, 0, formatOptions)

const printer = new ModelPrinter({
  formatter,
  actions: printActions,
  styles: styles,
})

const ctx: OperationContext = {
  normalize,
  apply,
  equal,
  lookup,
  scope: createNativeDefs(),
  useState: createStateStorage(),
  printer,
}

repl({ input, output, formatter, ctx })
