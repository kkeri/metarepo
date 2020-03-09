import { BinaryDispatcher } from './dispatcher'
import { DeferredModel, Rank, NormalModel, ReduceContext, NaryCombinator } from './types'
import { undef, Missing, Sum, ModelBase } from './model'
import * as modelClasses from './model'

export function minCombinator (threshold: number): { new(items: DeferredModel[]): NaryCombinator } {

  return class MinCombinator extends ModelBase {
    all: NormalModel[] = []

    constructor (
      public items: DeferredModel[],
    ) {
      super()
    }

    reduce (ctx: ReduceContext): NormalModel {
      for (let i = 0; i < this.items.length; ++i) {
        // adhere to shortcut semantics, don't evaluate irrelevant operands
        if (this.rank !== null && this.rank <= threshold) break
        // normalize the next operand
        const item = this.items[i]
        const nf = typeof item === 'function'
          ? item().reduce(ctx)
          : item.reduce(ctx)
        this.merge(nf)
      }
      return this.inContext(ctx) as NormalModel
    }

    merge (nf: NormalModel): void {
      if (this.rank === null) {
        // this is the first item
        this.rank = nf.rank
        this.all = [nf]
      }
      else if (this.rank <= threshold) {
        // already finished by shortcut
      }
      else if (nf.rank > this.rank) {
        // item is too weak
      }
      else if (nf.rank < this.rank) {
        // item is stronger than all precedents
        this.rank = nf.rank
        this.all = [nf]
      }
      else {
        // try to aggregate normal forms of equal rank
        for (let j = 0; j < this.all.length; ++j) {
          const nfj = this.all[j]
          const meet = meeter.get(nf, nfj)(nf, nfj)
          if (meet !== undef) {
            // the normal form is joined with a previous one
            this.all[j] = meet
            return
          }
        }
        this.all.push(nf)
      }
    }
  }
}

export const UpperMeet = minCombinator(Rank.Top - 1)

export const LowerMeet = minCombinator(Rank.Bottom)

export const meeter = new BinaryDispatcher<(a: NormalModel, b: NormalModel) => NormalModel>()
  .addClass(Object, (a, b) => {
    return undef
  })
  .addClasses(modelClasses, {
    Missing: (a: Missing, b: Missing) => {
      return new Missing(new Sum(a.a, b.a))
    },
  })
