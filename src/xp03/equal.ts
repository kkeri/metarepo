import { Model } from './types'

export function simpleEqual (a: Model, b: Model): boolean {
  if (a === b) return true
  if (a.rank !== b.rank) return false
  if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false
  return a.equals(b)
}
