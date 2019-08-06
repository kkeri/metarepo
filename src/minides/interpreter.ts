import { makeDeduce } from './deduce';
import { or, and, not } from './dnf';

export const deduce = makeDeduce(or, and, not)
export { or, and, not } from './dnf';
