import { EventEmitter } from 'events'
import stream = require('stream')

export enum Rank {
  Top = 2,
  True = 1,
  Neutral = 0,
  False = -1,
  Bottom = -2,
  Undefined = -Infinity
}

export interface Model {
  rank: Rank | null
  ctx?: ReduceContext
  reduce (ctx: ReduceContext): NormalModel
  parse (ctx: Model, src: Model): Model
  parseInThis (goal: Model, src: Model): Model
  // Looks up a name in this model.
  lookup (name: Model): Model
  // Simple structural equality.
  equals (other: Model): boolean
  ranked (rank: Rank): NormalModel
  inContext (ctx: ReduceContext): this
}

export interface NormalModel extends Model {
  rank: Rank
}

export type DeferredModel = Model | (() => Model)

// Returns a state object for the provided key sequence.
export type MemoizerFn = (keys: any[], init: (() => any) | any) => any

export interface GlobalContext {
  // Debug hooks.
  hooks?: EventEmitter
  // Standard streams.
  stdin?: stream.Writable
  stdout?: stream.Writable
}

export type UnaryOperation = (a: Model) => Model
export type BinaryOperation = (a: Model, b: Model) => Model

export type UnaryPredicate = (a: Model) => boolean
export type BinaryPredicate = (a: Model, b: Model) => boolean

// abilities

export interface Forkable<T> {
  // Forks this stateful object.
  // The fork and the original one can be mutated independently. 
  fork (): T
}

export interface Shrinkable {
  peek (): Model
  get (): Model
}

export interface Growable {
  findFirst (test: (m: Model) => Model): Model
  findLast (test: (m: Model) => Model): Model
  put (m: Model): void
}

export interface ReduceContext extends Forkable<ReduceContext> {
  parent?: ReduceContext
  fork (): ReduceContext
  // Extends the context with a new item.
  extend (item: DeferredModel): void
  // Clears premises.
  reset (): void
  forEachPremise (fn: (model: Model) => void): void
}

export interface NaryCombinator extends Model {
  // List of merged elements.
  all: NormalModel[]
  // Merge a new element.
  merge (nf: NormalModel): void
}
