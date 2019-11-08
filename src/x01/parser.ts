import { ParserRules, ParseContext, Model } from './types'

export class ParseContextClass implements ParseContext {
  caches = new Map<Model, Map<number, any>>()
  pos = 0

  constructor (
    public source: string,
    public rules: ParserRules,
  ) { }

  useCache (node: Model): Map<number, any> {
    let cache = this.caches.get(node)
    if (!cache) {
      cache = new Map<number, any>()
      this.caches.set(node, cache)
    }
    return cache
  }

  save () {
    return this.pos
  }

  restore (point) {
    this.pos = point
  }
}
