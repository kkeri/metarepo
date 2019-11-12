import { UseStateFunction } from './types'

const local = Symbol('local')

// Creates a state storage.
export function createStateStorage (): UseStateFunction {
  const root = new Map()
  // Returns a state object for the provided key sequence.
  return function useState (keys: any[]): any {
    let map = root
    for (const key of keys) {
      let child = map.get(key)
      if (!child) {
        child = new Map()
        map.set(key, child)
      }
      map = child
    }
    let state = map.get(local)
    if (!state) {
      state = {}
      map.set(local, state)
    }
    return state
  }
}
