import * as colors from 'colors';
import * as readline from 'readline';
import { Diagnostics } from '../util/diag';
import { PrettyFormatter } from '../util/format';
import { OhmParser } from '../util/ohmParser';
import { ModelPrinter } from '../util/printer';
import { equal } from './equal';
import { deduce, nf } from './interpreter';
import { And, Model, True } from './model';
import { createParser } from './parser';
import { printActions } from './print';
import stream = require('stream');

export const styles = {
  operator: colors.cyan,
  name: colors.white,
  keyword: colors.yellow,
  number: colors.yellow,
  string: colors.green,
  comment: colors.gray,
}

const formatOptions = {
  indentSize: 2,
  breakLimit: 0,
  lineBreak: '\n'
}

interface ReplState {
  parser: OhmParser
  formatter: PrettyFormatter
  // output: stream.Writable
  antecedent: Model
  assertions: number
  failures: number
  exit: (() => void)
}

export function repl (
  input: stream.Readable = process.stdin,
  output: stream.Writable = process.stdout
) {
  const rl = readline.createInterface({ input, output })
  const state: ReplState = {
    parser: createParser(nf),
    formatter: new PrettyFormatter(output, 0, formatOptions),
    // output,
    antecedent: True,
    assertions: 0,
    failures: 0,
    exit: () => rl.close()
  }
  rl.prompt(true)
  rl.on('line', (line) => {
    try {
      evalLine(line, state)
    } catch (e) {
      state.formatter.emit(e).br()
    }
    rl.prompt(true)
  }).on('close', () => {
    state.formatter.br()
    process.exit(0)
  })
}

function evalLine (line, state: ReplState) {
  line = line.trim()
  if (line.length === 0) {
    // do nothing with an empty line
  } else if (/^.*\/\//.test(line)) {
    // skip comments starting with #
  } else if (/^\.[a-zA-Z]/.test(line)) {
    // commands start with .
    evalCommand(line, state)
  } else {
    // everything else goes to the interpreter
    evalStatement(line, state)
  }
}

function evalCommand (line, state: ReplState) {
  let args: string[] = line.trim().substr(1).split(/\s+/)
  switch (args[0]) {

    // inspect

    case 'l':
    case 'list':
      printAntecedent(state)
      break

    case 'a':
    case 'assert': {
      const a = parseStatement(args.splice(1).join(' ').trim(), state)
      if (a) {
        assert(deduce(state.antecedent, a), state)
      }
      else {
        state.formatter.emit(`usage: .assert a`).br()
      }
      break
    }

    case 'eq': {
      const terms = args.splice(1).join(' ').split(',')
      const a = parseStatement(terms[0].trim(), state)
      const b = parseStatement(terms[1].trim(), state)
      if (a && b) {
        assertEquality(deduce(state.antecedent, a), deduce(state.antecedent, b), state)
      }
      else {
        state.formatter.emit(`usage: .eq a, b`).br()
      }
      break
    }

    // modify

    case 'r':
    case 'reset':
      state.antecedent = True
      state.formatter.emit('----------------').br()
      break

    // other

    case 'summary':
      if (state.failures) {
        state.formatter.emit(`${state.failures} of ${state.assertions} assertions have failed`).br()
      }
      break

    case 'x':
    case 'exit':
      state.exit()
      break
    default:
      state.formatter.emit('What do you mean?\n').br()
  }
}

function evalStatement (str: string, state: ReplState) {
  const stmt = parseStatement(str, state)
  if (stmt) {
    append(stmt, state)
  }
}

function append (a: Model, state: ReplState) {
  try {
    const result = deduce(state.antecedent, a)
    printModel(result, state).br()
    state.antecedent = nf.and(state.antecedent, result)
  }
  catch (e) {
    state.formatter.emit(e.toString()).br()
  }
}

function assert (a: Model, state: ReplState) {
  state.assertions++
  try {
    const result = deduce(state.antecedent, a)
    if (equal(result, True)) {
      return
    }
    else {
      state.failures++
      state.formatter.emit(`assertion failed: `)
      printModel(a, state).br()
      state.formatter.emit(`result: `)
      printModel(result, state).br()
    }
  }
  catch (e) {
    state.formatter.emit(e.toString()).br()
  }
}

function assertEquality (a: Model, b: Model, state: ReplState) {
  state.assertions++
  try {
    if (equal(a, b)) {
      return
    }
    else {
      state.failures++
      state.formatter.emit(`assertion failed: `)
      printModel(a, state)
      state.formatter.emit(' != ')
      printModel(b, state).br()
    }
  }
  catch (e) {
    state.formatter.emit(e.toString()).br()
  }
}

function parseStatement (str: string, state: ReplState) {
  const diag = new Diagnostics()
  const stmt = state.parser.parse(str, { diag, rule: 'Statement' })
  if (!stmt) {
    for (const msg of diag.messages) {
      state.formatter.emit(msg.message).br()
    }
  }
  return stmt
}

function printAntecedent (state: ReplState) {
  if (state.antecedent instanceof And) {
    for (const elem of state.antecedent) printModel(elem, state).br()
  }
  else {
    printModel(state.antecedent, state).br()
  }
  return state.formatter
}

function printModel (obj, state: ReplState) {
  const printer = new ModelPrinter({
    formatter: state.formatter,
    actions: printActions,
    styles: styles,
  })
  printer.print(obj)
  return state.formatter
}
