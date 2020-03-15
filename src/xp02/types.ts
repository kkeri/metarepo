import { EventEmitter } from 'events'
import stream = require('stream')
import { ModelPrinter } from '../util/printer'

export interface Model {
  rank: Rank | null
}

export interface NormalModel extends Model {
  rank: Rank
}

export enum Rank {
  Success = 2,
  True = 1,
  Middle = 0,
  False = -1,
  Failure = -2,
}

export type UnaryOperation<T> = (a: T) => T
export type BinaryOperation<T> = (a: T, b: T) => T

export type UnaryPredicate<T> = (a: T) => boolean
export type BinaryPredicate<T> = (a: T, b: T) => boolean

export type Combinator<Context> = BinaryOperation<(ctx: Context) => Model>

export interface Forkable<T> {
  fork (): T
}

export interface EqualContext {
  equal: (a: Model, b: Model, ctx: EqualContext) => boolean
}

export interface OperationContext {

  // operations

  normalize (a: Model, ctx: OperationContext): Model
  apply (a: Model, b: Model, ctx: OperationContext): Model | null
  lookup (key: Model, env: Model, ctx: OperationContext): Model | null

  // predicates

  equal: (a: Model, b: Model, ctx: EqualContext) => boolean

  // state

  scope: Model
  useState: UseStateFunction
  printer?: ModelPrinter
}

export type UseStateFunction = (keys: any[]) => any

export interface ReduceContext {
  env?: Model
  options: reduceOptions
}

export interface reduceOptions {
  // Debug hooks.
  hooks?: EventEmitter
  // Standard streams.
  stdin?: stream.Writable
  stdout?: stream.Writable
}

export interface LogicalNormalizer<T> {
  join: BinaryOperation<T>
  meet: BinaryOperation<T>
  complement: UnaryOperation<T>
}
