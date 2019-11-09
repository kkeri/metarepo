import { EventEmitter } from 'events'
import stream = require('stream')

export interface Model {
  rank?: Rank
  parse (pc: ParseContext): Model
  reduce (env: Model, pc: ReduceContext): Model
  apply?(arg: Model, env: Model, ctx: ReduceContext): Model
  lookup (name): Model | null
  reflect (): Model
  equal (other: Model): boolean
  ranked (rank: Rank): NormalModel
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

export interface ParseContext {
  // The source text.
  source: string
  // The current parsing position.
  pos: number
  // Returns the cache for a specific model.
  useCache (node: Model): Map<number, any>
  // Saves the current state of the context.
  save (): RestorePoint
  // Restores a previous state of the context.
  restore (point: RestorePoint)
  // Parses a string. Returns a failure object on failure.
  matchString (str: string): boolean
  // Parses a sticky regular expression. 'regexp' must have the sticky flag set. 
  // On success returns the matching string.
  matchRegexp (regexp: RegExp): string | null
  // Skips white space.
  skipSpace (): void
}

export type ParserRules = { [index: string]: Model }

export type RestorePoint = number

// An updatable state that is associated with a monoid operation.
// The value is updated via the monoid operation.
export interface Monoid {
  // Current value of the monoid.
  value: Model
  // Current version of the monoid.
  version: number
  // Updates the current value with the old value as the right and
  // the new value as the left operand of the monoid operation.
  // Increments version of the monoid.
  updateLeft (value: Model, ctx: ReduceContext): Model
  // Updates the current value with the old value as the left and
  // the new value as the right operand of the monoid operation.
  // Increments version of the monoid.
  updateRight (value: Model, ctx: ReduceContext): Model
}
