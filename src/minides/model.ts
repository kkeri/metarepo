
export interface Model { }

// operations

export class Or implements Model {
  constructor (public a: Model, public b: Model) { }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* Or.tree(this.a)
    yield* Or.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof Or) yield* model; else yield model
  }
}

export class And implements Model {
  constructor (public a: Model, public b: Model) { }

  *[Symbol.iterator] (): IterableIterator<Model> {
    yield* And.tree(this.a)
    yield* And.tree(this.b)
  }

  static *tree (model): IterableIterator<Model> {
    if (model instanceof And) yield* model; else yield model
  }
}

export class Not implements Model {
  constructor (public a: Model) { }
}

export class Truth implements Model { }

export class Falsehood implements Model { }

export class Name implements Model {
  constructor (public name: string) { }
}

export const True = new Truth()
export const False = new Falsehood()
