import { readFileSync } from 'fs'
import { makeRecipe } from 'ohm-js/src/main.js'
import { Diagnostics } from '../util/diag'

export class OhmParser {
  ohmParser
  semantics

  constructor (
    // Parser recipe built by script/build-ohm.js
    recipePath: string,
    // Model actions.
    actions: {}
  ) {
    // this is the recommended way of loading an Ohm parser
    const recipe = readFileSync(recipePath, 'utf-8')
    this.ohmParser = makeRecipe(eval(recipe)) // eslint-disable-line
    this.semantics = this.ohmParser.createSemantics()
    this.semantics.addOperation('model', actions)
  }

  parse (str: string, opts: {
    diag: Diagnostics,
    rule?: string,
  } = {
      diag: new Diagnostics(),
    }) {
    const result = this.ohmParser.match(str, opts.rule)
    if (result.failed()) {
      opts.diag.error(null, 'PARSE_ERROR', result.message)
      return null
    } else {
      return this.semantics(result).model()
    }
  }
}
