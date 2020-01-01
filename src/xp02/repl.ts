import * as colors from 'colors'
import * as readline from 'readline'
import { Diagnostics } from '../util/diag'
import { PrettyFormatter } from '../util/format'
import { OhmParser } from '../util/ohmParser'
import { ModelPrinter } from '../util/printer'
import { printActions } from './operation/print'
import stream = require('stream')
import { ohmParser } from './ohmParser'
import { normalize } from './operation/normalize'
import { apply } from './operation/apply'
import { lookup } from './operation/lookup'
import { equal } from './operation/equal'
import { createNativeDefs } from './native'
import { createStateStorage } from './useState'
import { OperationContext } from './types'
import { Product } from './model'

export const styles = {
  operator: colors.cyan,
  name: colors.white,
  keyword: colors.yellow,
  number: colors.yellow,
  string: colors.green,
  comment: colors.gray,
}

export const formatOptions = {
  indentSize: 2,
  breakLimit: 0,
  lineBreak: '\n'
}

interface ReplState {
  ctx: OperationContext
  parser: OhmParser
  formatter: PrettyFormatter
  assertions: number
  failures: number
  exit: (() => void)
}

const nativeDefs = createNativeDefs()

export function repl ({
  input = process.stdin,
  output = process.stdout,
  formatter,
  ctx,
}: {
  input: stream.Readable
  output: stream.Writable
  formatter: PrettyFormatter
  ctx: OperationContext
},
) {
  const rl = readline.createInterface({ input, output })
  const state: ReplState = {
    ctx,
    parser: ohmParser,
    formatter,
    assertions: 0,
    failures: 0,
    exit: () => rl.close()
  }
  output.write(`XP02 - Type .h for help.\n`)
  rl.prompt(true)
  rl.on('line', (line) => {
    try {
      processLine(line, state)
    } catch (e) {
      state.formatter.emit(e).br()
    }
    rl.prompt(true)
  }).on('close', () => {
    state.formatter.br()
    process.exit(0)
  })
}

function processLine (line, state: ReplState) {
  line = line.trim()
  if (line.length === 0) {
    // skip empty lines
  } else if (/^.*\/\//.test(line)) {
    // skip comment lines starting with //
  } else if (/^\.[a-zA-Z]/.test(line)) {
    // commands start with .
    processCommand(line, state)
  } else {
    // everything else goes to the interpreter
    processStatement(line, state)
  }
}

function processCommand (line, state: ReplState) {
  const parts: string[] = line.trim().substr(1).split(/\s+/)
  const args: string[] = parts.splice(1).join(' ').split(',').map(arg => arg.trim())
  switch (parts[0]) {

    case 'l':
    case 'list':
      listPremises(state)
      break

    case 'r':
    case 'reset':
      state.ctx.scope = nativeDefs
      state.formatter.emit('----------------').br()
      break

    case 'h':
    case 'help':
      help(state)
      break

    case 'x':
    case 'exit':
      state.exit()
      break
    default:
      state.formatter.emit('What do you mean?\n').br()
  }
}

function processStatement (str: string, state: ReplState) {
  const e = parseExpression(str, state)
  if (e) {
    const n = normalize(e, state.ctx)
    printModel(n, state).br()
  }
}


// helper functions


function parseExpression (str: string, state: ReplState) {
  const diag = new Diagnostics()
  const stmt = state.parser.parse(str, { diag, rule: 'Expression' })
  if (!stmt) {
    for (const msg of diag.messages) {
      state.formatter.emit(msg.message).br()
    }
  }
  return stmt
}

function listPremises (state: ReplState) {
  if (state.ctx.scope instanceof Product) {
    for (const elem of state.ctx.scope) printModel(elem, state).br()
  }
  else {
    printModel(state.ctx.scope, state).br()
  }
  return state.formatter
}

function printModel (obj, state: ReplState) {
  state.ctx.printer?.print(obj)
  return state.formatter
}

function help (state: ReplState) {
  state.formatter.emit(`
  .l, .list           Lists premises
  .r, .reset          Clears premises
  .h, .help           Prints the list of commands
  .x, .exit           Quits read-eval-print loop
`).br()
}
