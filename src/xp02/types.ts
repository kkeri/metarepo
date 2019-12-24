import { EventEmitter } from 'events'
import stream = require('stream')

export interface Model {
  rank: Rank | null
  // Simple structural equality.
  equals (other: Model, equal: BinaryPredicate): boolean
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

export type UnaryOperation = (a: Model) => Model
export type BinaryOperation = (a: Model, b: Model) => Model

export type UnaryPredicate = (a: Model) => boolean
export type BinaryPredicate = (a: Model, b: Model) => boolean

export type Combinator<Context> =
  (a: (ctx: Context) => Model, b: (ctx: Context) => Model) => (ctx: Context) => Model

export interface Context {
  useState: UseStateFunction
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

export interface Forkable<T> {
  // Forks this state.
  fork (): T
}

export interface LogicalNormalForm {
  or: BinaryOperation
  and: BinaryOperation
  not: BinaryOperation
}


