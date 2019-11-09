import { ReplClass } from '../../util/repl'
import { createReadStream } from 'fs'
import { createParser } from '../parser'
import { onf as nf } from '../onf';
import { PrettyFormatter } from '../../util/format';
import { ModelPrinter } from '../../util/printer';
import { printActions } from '../print';
import { Diagnostics } from '../../util/diag';

const input = process.argv[2]
  ? createReadStream(process.argv[2])
  : process.stdin
const output = process.stdout
const parser = createParser(nf)
const formatter = new PrettyFormatter(output, 0, {
  indentSize: 2,
  breakLimit: 0,
  lineBreak: '\n'
})
const printer = new ModelPrinter({
  formatter: formatter,
  actions: printActions
})
const repl = new ReplClass(input, output)

repl.on('line', line => {
  const model = parseStatement(line)
  if (model) {
    printer.print(model).br()
  }
})

function parseStatement (str: string) {
  const diag = new Diagnostics()
  const stmt = parser.parse(str, { diag, rule: 'Statement' })
  if (!stmt) {
    for (const msg of diag.messages) {
      formatter.emit(msg.message).br()
    }
  }
  return stmt
}
