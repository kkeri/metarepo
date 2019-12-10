import { Model, Name } from './model'
import { Comparison } from './types'



// Compares two atoms.
export function compare (a: Model, b: Model): Comparison {
  if (a instanceof Name && b instanceof Name) return compareStrings(a.name, b.name)
  throw new Error(`can't compare atoms`)
}

export function compareStrings (a: string, b: string): Comparison {
  if (a < b) return -1
  if (a > b) return 1
  return 0
}
