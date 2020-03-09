import { repl } from './repl'
import { createReadStream } from 'fs'
import { createCommandProcessor } from './cmd'

const input = process.argv[2]
  ? createReadStream(process.argv[2])
  : process.stdin

repl(input, process.stdout, createCommandProcessor)
