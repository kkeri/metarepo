import { makeDeduce } from './deduce';
import { cnf } from './cnf';
import { dnf } from './dnf';
import { onf } from './onf';

export const nf = onf
export const deduce = makeDeduce(nf)
