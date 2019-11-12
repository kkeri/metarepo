import { EventEmitter } from 'events'
import stream = require('stream')
import { BinaryDispatcher } from './dispatcher'

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

export type UnaryOperation = (a: Model) => Model
export type BinaryOperation = (a: Model, b: Model) => Model

export interface Context {
  join: BinaryOperation
  meet: BinaryOperation
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
