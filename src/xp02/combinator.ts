import {
  Forkable, Combinator, BinaryOperation, UnaryPredicate
} from './types'

// Generic combinator

export function createShortcutCombinator<Context> (
  combine: BinaryOperation,
  shortcut: UnaryPredicate,
): Combinator<Context> {
  return (a, b) => ctx => {
    const ar = a(ctx)
    if (shortcut(ar)) return ar
    const br = b(ctx)
    if (shortcut(br)) return br
    return combine(ar, br)
  }
}

export function createForkingCombinator<Context extends Forkable<Context>> (
  combine: BinaryOperation,
  shortcut: UnaryPredicate,
): Combinator<Context> {
  return (a, b) => ctx => {
    const ar = a(ctx.fork())
    if (shortcut(ar)) return ar
    const br = b(ctx.fork())
    if (shortcut(br)) return br
    return combine(ar, br)
  }
}
