import { ParserRules, ParseContext, Model } from './types'

export class ParseContextClass implements ParseContext {
  caches = new Map<Model, Map<number, any>>()
  pos = 0
  space = /[ \t\r\n]*/y

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

  matchString (value: string) {
    if (this.source.substr(this.pos, value.length) === value) {
      this.pos += value.length
      return true
    }
    return false
  }

  matchRegexp (regexp: RegExp) {
    regexp.lastIndex = this.pos
    const matches = regexp.test(this.source)
    if (matches) {
      this.pos = regexp.lastIndex
      return matches[0]
    }
    return null
  }

  skipSpace () {
    this.space.lastIndex = this.pos
    this.space.test(this.source)
    this.pos = this.space.lastIndex
  }
}
