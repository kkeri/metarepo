import { Forkable, Model, BinaryOperation, Rank } from "./types"

export function createBacktrackJoin<Context extends Forkable<Context>> (
  join: BinaryOperation<Model>,
): BinaryOperation<(ctx: Context) => Model> {
  return (a, b) => ctx => {
    const ar = a(ctx.fork())
    if (ar.rank != null && ar.rank >= Rank.Success) return ar
    const br = b(ctx.fork())
    if (br.rank != null && br.rank >= Rank.Success) return br
    return join(ar, br)
  }
}

export function createBacktrackMeet<Context extends Forkable<Context>> (
  meet: BinaryOperation<Model>,
): BinaryOperation<(ctx: Context) => Model> {
  return (a, b) => ctx => {
    const ar = a(ctx)
    if (ar.rank != null && ar.rank <= Rank.Failure) return ar
    const br = b(ctx)
    if (br.rank != null && br.rank <= Rank.Failure) return br
    return meet(ar, br)
  }
}
