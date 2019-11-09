import { Model } from './model';

export type UnaryOp = (a: Model) => Model
export type BinaryOp = (a: Model, b: Model) => Model

export type BinaryPred = (a: Model, b: Model) => boolean

export interface LogicalNormalForm {
  or: BinaryOp
  and: BinaryOp
  not: UnaryOp
}

export type Comparison = -1 | 0 | 1