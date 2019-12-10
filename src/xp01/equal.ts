import { Model, Or, And, Not, Name } from './model'

// Syntactic equality
export function equal (a: Model, b: Model): boolean {
  if (a instanceof Or && b instanceof Or) return equal(a.a, b.a) && equal(a.b, b.b)
  if (a instanceof And && b instanceof And) return equal(a.a, b.a) && equal(a.b, b.b)
  if (a instanceof Not && b instanceof Not) return equal(a.a, b.a)
  if (a instanceof Name && b instanceof Name) return a.name === b.name
  if (a === b) return true
  return false
}
