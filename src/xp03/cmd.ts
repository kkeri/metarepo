import stream = require('stream')
import * as colors from 'colors'
import { Diagnostics } from '../util/diag'
import { PrettyFormatter } from '../util/format'
import { ModelPrinter } from '../util/printer'
import { ModelClass, top, LowerMeet } from './model'
import { parser } from './parser'
import { printActions } from './print'
import { CommandProcessorFn } from '../util/iface'
import { Rank, Model, NormalModel } from './types'
import { reduce } from './reduce'
import { lowerMeet } from './meet'

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

export function createCommandProcessor (
  // Exits the command interface
  exit: () => void,
  // standard output
  output: stream.Writable,
): CommandProcessorFn {
  const formatter: PrettyFormatter = new PrettyFormatter(output, 0, formatOptions)
  let ctx: NormalModel = top
  let assertions: number = 0
  let failures: number = 0

  output.write(`XP03 - Type .h for help.\n`)

  return function processLine (line) {
    line = line.trim()
    if (line.length === 0) {
      // skip empty lines
    } else if (/^.*\/\//.test(line)) {
      // skip comment lines starting with //
    } else if (/^\.[a-zA-Z]/.test(line)) {
      // commands start with .
      processCommand(line)
    } else {
      // everything else goes to the interpreter
      processStatement(line)
    }
    return ''
  }

  function processCommand (line) {
    const parts: string[] = line.trim().substr(1).split(/\s+/)
    const args: string[] = parts.splice(1).join(' ').split(',').map(arg => arg.trim())
    switch (parts[0]) {

      case 'h':
      case 'help':
        help()
        break

      case 'l':
      case 'list':
        printContext()
        break

      case 'c':
      case 'case':
        ctx = top
        break

      case 'p':
      case 'prove': {
        const a = parseStatement(args[0])
        if (a) {
          prove(a)
        }
        else {
          formatter.emit(`usage: .prove a`).br()
        }
        break
      }

      case 'eq': {
        const a = parseStatement(args[0])
        const b = parseStatement(args[1])
        if (a && b) {
          assertEquality(a, b)
        }
        else {
          formatter.emit(`usage: .eq a, b`).br()
        }
        break
      }

      case 'summary':
        if (failures) {
          formatter.emit(`${failures} of ${assertions} assertions have failed`).br()
        }
        break

      case 'r':
      case 'reset':
        ctx = top
        formatter.emit('----------------').br()
        break

      case 'x':
      case 'exit':
        exit()
        break

      default:
        formatter.emit('What do you mean?\n').br()
    }
  }

  function processStatement (str: string) {
    const stmt = parseStatement(str)
    if (stmt) {
      try {
        let result = reduce(stmt, ctx)
        printModel(result).br()
        if (result.rank > Rank.Bottom) ctx = lowerMeet(ctx, result)
      }
      catch (e) {
        formatter.emit(e.toString()).br()
      }
    }
  }

  // assertions


  function prove (a: ModelClass) {
    try {
      assertions++
      const result = a // deduce(premises, a)
      if (result.rank && result.rank >= Rank.True) {
        formatter.emit(`success`).br()
        return
      }
      else {
        failures++
        formatter.emit(colors.red(`failed to prove: `))
        printModel(a).br()
        formatter.emit(`required       : `)
        printModel(result).br()
      }
    }
    catch (e) {
      formatter.emit(e.toString()).br()
    }
  }

  function assertEquality (a: ModelClass, b: ModelClass) {
    // try {
    //   a = deduce(premises, a)
    //   b = deduce(premises, b)
    //   assertions++

    //   if (equal(a, b)) {
    //     return
    //   }
    //   else {
    //     failures++
    //     formatter.emit(colors.red(`assertion failed: `))
    //     printModel(a)
    //     formatter.emit(' != ')
    //     printModel(b).br()
    //   }
    // }
    // catch (e) {
    //   formatter.emit(e.toString()).br()
    // }
  }


  // helper functions


  function parseStatement (str: string) {
    const diag = new Diagnostics()
    const stmt = parser.parse(str, { diag, rule: 'Term' })
    if (!stmt) {
      for (const msg of diag.messages) {
        formatter.emit(msg.message).br()
      }
    }
    return stmt
  }

  function printContext () {
    if (ctx instanceof LowerMeet) {
      for (const elem of ctx) {
        printModel(elem)
        formatter.br()
      }
    }
    else {
      printModel(ctx)
      formatter.br()
    }
    return formatter
  }

  function printModel (obj) {
    const printer = new ModelPrinter({
      formatter: formatter,
      actions: printActions,
      styles: styles,
    })
    printer.print(obj)
    return formatter
  }

  function help () {
    formatter.emit(`
  .l, .list           Prints the context
  .r, .reset          Clears the context
  .c, .case           Starts a new test case in a clear context
  .p, .prove <p>      Prints error message if <p> is not true
  .eq <p1>, <p2>      Prints error message if <p1> is not equal to <p2>
  .summary            Prints a summary of assertions and exits on failure
  .h, .help           Prints the list of available commands
  .x, .exit           Quits read-eval-print loop
`).br()
  }
}
