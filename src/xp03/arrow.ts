import { DeferredModel, Rank, NormalModel } from './types'
import { ModelBase } from './model'
import { ReduceContext } from './types'

export class ArrowCombinator extends ModelBase {

  constructor (
    public items: DeferredModel[],
  ) {
    super()
  }

  reduce (ctx: ReduceContext): NormalModel {
    for (let i = 0; i < this.items.length; ++i) {
      // normalize the next operand
      const item = this.items[i]
      const nf = typeof item === 'function'
        ? item().reduce(ctx)
        : item.reduce(ctx)
      this.items[i] = nf
    }
    return this.ranked(Rank.Neutral).inContext(ctx)
  }
}
