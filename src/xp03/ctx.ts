import { Forkable, Rank, NormalModel, DeferredModel, ReduceContext } from './types'
import { LowerMeet } from './meet'

// This is a lower meet with extras.
export class ReduceContextClass implements ReduceContext {
  premises = new LowerMeet([])

  constructor (
    public parent?: ReduceContextClass
  ) { }

  fork () {
    return new ReduceContextClass(this)
  }

  // Extends the context with a new term.
  extend (item: DeferredModel) {
    const nf = typeof item === 'function'
      ? item().reduce(this)
      : item.reduce(this)
    this.premises.merge(nf)
  }

  reset () {
    this.premises = new LowerMeet([])
  }

  forEachPremise (fn) {
    this.premises.all.forEach(fn)
  }
}
