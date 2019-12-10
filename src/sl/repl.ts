import * as colors from 'colors'
import { EventEmitter } from 'events'
import * as readline from 'readline'
import { Diagnostics } from '../util/diag'
import { PrettyFormatter } from '../util/format'
import { Context, Model, Monoid } from './iface'
import { resolve } from './interpreter'
import * as model from './model'
import { nativeDefs } from './native'
import { parse } from './parser'
import { printActions } from './printActions'
import { ModelPrinter } from '../util/printer'
import stream = require('stream')

const formatOptions = {
  indentSize: 2,
  breakLimit: 0,
  lineBreak: '\n'
}

interface ReplState {
  rl: readline.ReadLine
  output: stream.Writable
  ctx: Context
  lastEnv: Model & Monoid
  envStack: (Model & Monoid)[]
}

export function repl ({
  input = process.stdin,
  output = process.stdout
} = {}) {
  const rl = readline.createInterface({ input, output })
  let ctx = {
    env: new model.Environment(),
    options: {}
  }
  ctx.env.updateRight(nativeDefs(), ctx)
  ctx.env = new model.Environment(ctx.env)
  let state: ReplState = {
    rl,
    output,
    ctx,
    lastEnv: ctx.env,
    envStack: [],
  }
  rl.prompt(true)
  rl.on('line', (line) => {
    try {
      evalLine(line, state)
    } catch (e) {
      printModel(e, state)
    }
    rl.prompt(true)
  }).on('close', () => {
    state.output.write('\n')
    process.exit(0)
  })
}

function evalLine (line, state: ReplState) {
  line = line.trim()
  if (line.length === 0) {
    // do nothing
  } else if (/^\.[a-zA-Z]/.test(line)) {
    evalCommand(line, state)
  } else {
    evalCode(line, state)
  }
}

function evalCommand (line, state: ReplState) {
  let args = line.trim().substr(1).split(/\s+/)
  switch (args[0]) {

    // inspect

    case 'l':
    case 'list':
      printModel(state.ctx.env, state)
      break

    case 'h':
      state.ctx.options.hooks = new DebugHooks(state)
      break

    case 'hn':
      state.ctx.options.hooks = undefined
      break

    // modify

    case 'en':
    case 'enter':
      state.envStack.push(state.ctx.env)
      state.ctx.env = new model.Environment(state.ctx.env)
      state.lastEnv = state.ctx.env
      break
    case 'lv':
    case 'leave':
      if (state.envStack.length) {
        state.ctx.env = state.envStack.pop()
        state.lastEnv = state.ctx.env
      } else {
        state.output.write(`can't leave the outermost context\n`)
      }
      break
    case 'fg':
    case 'forget':
      state.ctx.env = state.lastEnv
      break

    // other

    case 'exit':
      state.rl.close()
      break
    default:
      state.output.write('What do you mean?\n')
  }
}

function evalCode (line, state: ReplState) {
  const diag = new Diagnostics()
  const m = parse(line, { diag, rule: 'SemicolonList' })
  if (m) {
    try {
      state.lastEnv = state.ctx.env.shallowCopy()
      if (state.ctx.options.hooks) printText(styles.comment('--- evaluate'), state)
      let result = resolve(m, state.ctx.env, state.ctx, null, 'start')
      if (!state.ctx.options.hooks) printModel(result, state)
      if (state.ctx.options.hooks) printText(styles.comment('--- meet context'), state)
      state.ctx.env.updateRight(result, state.ctx)
    }
    catch (e) {
      printText(e.toString(), state)
    }
  }
  else {
    for (let msg of diag.messages) {
      state.output.write(msg.message)
      state.output.write('\n')
    }
  }
}

function printModel (obj, state: ReplState) {
  let printer = new ModelPrinter({
    formatter: new PrettyFormatter(state.output, 0, formatOptions),
    actions: printActions,

    styles: styles,
  })
  printer.print(obj).br()
}

function printText (text: string, state: ReplState) {
  state.output.write(text)
  state.output.write('\n')
}

// Debug hooks.
class DebugHooks extends EventEmitter {
  printer: ModelPrinter
  generateName = createNameGenerator()

  constructor (
    public state: ReplState
  ) {
    super()
    this.printer = new ModelPrinter({
      formatter: new PrettyFormatter(state.output, 0, formatOptions),
      actions: printActions,
      styles: styles,
    })
    this.on('beforeEvaluate', (model, parent, prop) => {
      let modelName = this.generateName(model, parent, prop)
      this.printer.text(`reduce ${modelName}`, styles.comment).br()
      this.printer.text(`from `, styles.comment).print(model)
      this.printer.ws().text(modelInfo(model), styles.comment).br()
      this.printer.indent()
    })
    this.on('afterEvaluate', (model, parent, prop) => {
      this.printer.unindent()
      this.printer.text(`to   `, styles.comment).print(model)
      this.printer.ws().text(modelInfo(model), styles.comment).br()
    })
    // this.on('evaluate', (from, to, parent, prop) => {
    //   let modelName = this.generateName(from, parent, prop)
    //   this.printer.text(`reduce ${modelName}`, styles.comment).br()
    //   this.printer.text(`from `, styles.comment).print(from).indent().br()
    //   this.printer.unindent().text(`to   `, styles.comment).print(to).br()
    // })
  }
}

// Creates a mapping from models to informative names.
export function createNameGenerator () {
  let nextNameIndex = 1
  let names = new Map<Model, string>()

  function generateName (model: Model, parent?: Model, prop?: string) {
    let name = names.get(model)
    if (!name) {
      if (parent && prop) {
        name = generateName(parent) + '.' + prop
      }
      else if (prop) {
        name = prop
      }
      else {
        name = indexToName(nextNameIndex++)
      }
      names.set(model, name)
    }
    return name
  }
  return generateName
}

function modelInfo (model: Model) {
  let info = '('
  info += model.constructor.name
  if ('rank' in model) info += `,${model.rank}`
  info += ')'
  return info
}

export function indexToName (index) {
  let name = ''
  while (index > 0) {
    let digit = index % 26
    name += String.fromCharCode(96 + digit)
    index = Math.floor(index / 26)
  }
  return name
}

export const styles = {
  operator: colors.cyan,
  name: colors.white,
  keyword: colors.yellow,
  number: colors.yellow,
  string: colors.green,
  comment: colors.gray,
}
