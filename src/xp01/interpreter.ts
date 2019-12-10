import { makeDeduce } from './deduce'
import { cnf } from './cnf'
import { dnf } from './dnf'
import { onf } from './onf'

// select normal form
export const nf = dnf

export const deduce = makeDeduce(nf)
