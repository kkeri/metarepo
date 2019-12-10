import { EventEmitter } from 'events'
import stream = require('stream')

export interface Model {
  // The binding environment if the model is bound to one.
  env?: Model
  // Rank, defined iff the model is normalized.
  rank?: Rank
  // Resolves the expression in an environment.
  resolve (env: Model, ctx: Context): Model
  // Reverse operation of `reduce`.
  // Returns a normalized representation of the model.
  // The operation is shallow.
  reflect (): Model
  // If name is bound in this environment, returns the value bound to it.
  // Otherwise returns null.
  lookup (name: Model): Model | null
  // Applies this model as function to another one as argument.
  // `env` is a fresh, local environment.
  apply?(arg: Model, env: Model, ctx: Context): Model
  // Returns the equality of this and another model.
  // `other` is guaranteed to be an instance of the same class.
  equal (other: Model): Model
  // // Binds the model to an environment.
  // // The model will be evaluated in the binding environment.
  // // If called again, the new context must be the join of the old
  // // and the new one.
  // bound (env: Model): Model
  // Marks the model as strict value of a given rank.
  ranked (rank): Model
  // Returns a shallow copy of the model.
  shallowCopy (): this
}

export function isApplicable (model: Model): boolean {
  return typeof model.apply === 'function'
}

export function isRedex (model: Model): boolean {
  return model.rank === undefined
}

export enum Rank {
  Success = 2,
  True = 1,
  Middle = 0,
  False = -1,
  Failure = -2,
}

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
  updateLeft (value: Model, ctx: Context): Model
  // Updates the current value with the old value as the left and
  // the new value as the right operand of the monoid operation.
  // Increments version of the monoid.
  updateRight (value: Model, ctx: Context): Model
}

export interface Context {
  env: Model & Monoid
  options: ContextOptions
}

export interface ContextOptions {
  // Debug hooks.
  hooks?: EventEmitter
  // Standard streams.
  stdin?: stream.Writable
  stdout?: stream.Writable
}
