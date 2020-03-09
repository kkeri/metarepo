import stream = require('stream')
import { createCommandProcessor } from '../util/iface'
import { ReadLineClass } from '../util/readLine'

// Starts a read-eval-print loop.
// Returns a promise that resolves when the REPL is closed.
export function repl (
  input: stream.Readable = process.stdin,
  output: stream.Writable = process.stdout,
  createProcessor: createCommandProcessor,
): Promise<void> {
  const readline = new ReadLineClass(input, output)
  const processCommand = createProcessor(() => readline.close(), output)
  readline.prompt()
  readline.on('line', line => processCommand(line))
  readline.on('close', () => output.write(`exit read-eval-print loop\n`))
  return new Promise(resolve => readline.once('close', resolve))
}
