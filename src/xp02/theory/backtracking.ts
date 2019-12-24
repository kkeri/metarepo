import { Rank, Forkable, Context, LogicalNormalForm, Combinator } from '../types'
import { createForkingCombinator, createShortcutCombinator } from '../combinator'

export interface BackTrackContext extends Context, Forkable<BackTrackContext> {
}

export function createChoice (nf: LogicalNormalForm, ): Combinator<BackTrackContext> {
  return createForkingCombinator(
    nf.or,
    a => a.rank !== null && a.rank >= Rank.Success,
  )
}

export function createSequence (nf: LogicalNormalForm, ): Combinator<BackTrackContext> {
  return createShortcutCombinator(
    nf.and,
    a => a.rank !== null && a.rank <= Rank.Failure,
  )
}
