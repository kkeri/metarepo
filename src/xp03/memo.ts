import { MemoizerFn } from './types'

const leafKey = Symbol('leaf')

export function createMemoizer (): MemoizerFn {
  const root = new Map()
  return (keys, init) => {
    let map = root
    for (const key of keys) {
      let child = map.get(key)
      if (!child) {
        child = new Map()
        map.set(key, child)
      }
      map = child
    }
    let leaf = map.get(leafKey)
    if (!leaf) {
      leaf = typeof init === 'function' ? init() : init
      map.set(leafKey, leaf)
    }
    return leaf
  }
}
