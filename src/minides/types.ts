import { Model } from './model';

export type UnaryOp = (a: Model) => Model
export type BinaryOp = (a: Model, b: Model) => Model

export type BinaryPred = (a: Model, b: Model) => boolean
