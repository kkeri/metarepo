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
  premises: Model
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
    premises: True,
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
    // skip empty lines
  } else if (/^.*\/\//.test(line)) {
    // skip comment lines starting with //
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

    case 'h':
    case 'help':
      help(state)
      break

    case 'l':
    case 'list':
      listPremises(state)
      break

    case 'a':
    case 'assert': {
      const a = parseStatement(args.splice(1).join(' ').trim(), state)
      if (a) {
        assert(a, state)
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
        assertEquality(a, b, state)
      }
      else {
        state.formatter.emit(`usage: .eq a, b`).br()
      }
      break
    }

    case 'summary':
      if (state.failures) {
        state.formatter.emit(`${state.failures} of ${state.assertions} assertions have failed`).br()
      }
      break

    case 'r':
    case 'reset':
      state.premises = True
      state.formatter.emit('----------------').br()
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

// A single iteration of the incremental proof process.
function append (a: Model, state: ReplState) {
  try {
    const result = deduce(state.premises, a)
    printModel(result, state).br()
    state.premises = nf.and(state.premises, result)
  }
  catch (e) {
    state.formatter.emit(e.toString()).br()
  }
}


// assertions


function assert (a: Model, state: ReplState) {
  try {
    state.assertions++
    const result = deduce(state.premises, a)
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
  try {
    a = deduce(state.premises, a)
    b = deduce(state.premises, b)
    state.assertions++

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


// helper functions


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

function listPremises (state: ReplState) {
  if (state.premises instanceof And) {
    for (const elem of state.premises) printModel(elem, state).br()
  }
  else {
    printModel(state.premises, state).br()
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

function help (state: ReplState) {
  state.formatter.emit(`
  .l, .list           Lists set of premises
  .r, .reset          Clears premises
  .a, .assert <p>     Prints error message if <p> is not true
  .eq <p1>, <p2>      Prints error message if <p1> is not equal to <p2>
  .summary            Prints a summary of assertions and exits on failure
  .h, .help           Prints the list of commands
  .x, .exit           Quits read-eval-print loop
`).br()
}
