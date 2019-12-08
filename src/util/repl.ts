import * as readline from 'readline'
import { EventEmitter } from 'events'
import stream = require('stream')

interface Repl extends EventEmitter {
  // Emitted when the user enters a new line.
  emit (event: 'line', line: string): boolean
  // Emitted when the REPL is closed.
  emit (event: 'close'): boolean

  on (event: 'line', listener: (line: string) => void): this
  on (event: 'close', listener: () => void): this

  once (event: 'line', listener: (line: string) => void): this
  once (event: 'close', listener: () => void): this
}

// Generic read-eval-print loop.
export class ReplClass extends EventEmitter implements Repl {
  rl: readline.Interface

  constructor (
    input: stream.Readable = process.stdin,
    output: stream.Writable = process.stdout
  ) {
    super()
    this.rl = readline.createInterface({ input, output })
    this.rl.prompt(true)
    this.rl
      .on('line', (line) => {
        this.emit('line', line)
        this.rl.prompt(true)
      })
      .on('close', () => {
        this.emit('close')
      })
  }

  setPrompt (prompt: string): void {
    // todo
  }

  write (str: string): void {
    this.rl.write(str)
  }

  writeLine (str: string): void {
    this.rl.write(str)
    this.rl.write('\n')
  }

  close () {
    this.rl.close()
  }
}
