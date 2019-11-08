import { makeDeduce } from './deduce';
import { onf as nf } from './onf';

export const deduce = makeDeduce(nf)
export { onf as nf } from './onf';
