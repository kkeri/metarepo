import { BinaryDispatcher } from './dispatcher'
import { DeferredModel, Rank, NormalModel, Model } from './types'
import { undef, Missing, Sum, ModelBase } from './model'
import * as modelClasses from './model'
import { ReduceContext } from './types'

export function maxCombinator (threshold: number): { new(items: DeferredModel[]): Model } {

  return class MaxCombinator extends ModelBase {

    constructor (
      public items: DeferredModel[],
    ) {
      super()
    }

    reduce (ctx: ReduceContext): NormalModel {
      let maxRank = Rank.Undefined
      let nfs: NormalModel[] = []
      nextItem: for (let i = 0; i < this.items.length; ++i) {
        // normalize the next operand
        const item = this.items[i]
        const localCtx = ctx.fork()
        const nf = typeof item === 'function'
          ? item().reduce(localCtx)
          : item.reduce(localCtx)
        if (nf.rank >= threshold) {
          return nf
        }
        else if (nf.rank < maxRank) {
          continue
        }
        else if (nf.rank > maxRank) {
          maxRank = nf.rank
          nfs = [nf]
        }
        else {
          // try to aggregate normal forms of equal rank
          for (let j = 0; j < nfs.length; ++j) {
            const nfj = nfs[j]
            const join = joiner.get(nf, nfj)(nf, nfj)
            if (join !== undef) {
              // the normal form is joined with a previous one
              nfs[j] = join
              continue nextItem
            }
          }
          nfs.push(nf)
        }
      }
      return this.ranked(maxRank).inContext(ctx)
    }
  }
}

export const UpperJoin = maxCombinator(Rank.Top)

export const LowerJoin = maxCombinator(Rank.Bottom + 1)

export const joiner = new BinaryDispatcher<(a: NormalModel, b: NormalModel) => NormalModel>()
  .addClass(Object, (a, b) => {
    return undef
  })
  .addClasses(modelClasses, {
    Missing: (a: Missing, b: Missing) => {
      return new Missing(new Sum(a.a, b.a))
    },
  })
