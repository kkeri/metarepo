import * as assert from 'assert'

export class UnaryDispatcher<T> {
  map = new Map<object, T>()

  get (o: object): T {
    o = Object.getPrototypeOf(o)
    while (o) {
      const t = this.map.get(o)
      if (t) return t
      o = Object.getPrototypeOf(o)
    }
    throw new Error('Cannot dispatch object')
  }

  // add (actions) {
  //   if (Array.isArray(actions)) {
  //     for (let item of actions) this.map.set(item[0], item[1])
  //   } else if (actions instanceof ExternalProperty) {
  //     for (let [k, v] of actions.map) this.map.set(k, v)
  //   } else if (actions instanceof Map) {
  //     for (let [k, v] of actions) this.map.set(k, v)
  //   } else if (typeof actions === 'object') {
  //     for (let name in actions) this.map.set(name, actions[name])
  //   }
  //   return this
  // }

  addClasses (ctors, values: { [index: string]: T }) {
    for (let name in values) {
      let ctor = ctors[name]
      assert(ctor, `constructor ${name} is not found`)
      this.map.set(ctor.prototype, values[name])
    }
    return this
  }

  addClass (ctor, value: T) {
    this.map.set(ctor.prototype, value)
    return this
  }
}

export class BinaryDispatcher<T> {
  map = new Map<object, Map<object, T>>()

  get (l: object, r: object): T {
    l = Object.getPrototypeOf(l)
    while (l) {
      const t = this.map.get(l)
      if (t) return getRight(r, t)
      l = Object.getPrototypeOf(l)
    }
    throw new Error('Cannot dispatch object')
  }

  addClasses (ctors, values: { [index: string]: T }) {
    for (let name in values) {
      let ctor = ctors[name]
      assert(ctor, `constructor ${name} is not found`)
      this.addPair(ctor.prototype, ctor.prototype, values[name])
    }
    return this
  }

  addClass (ctor, value: T) {
    this.addPair(ctor.prototype, ctor.prototype, value)
    return this
  }

  addPair (pl: object, pr: object, t: T) {
    let subMap = this.map.get(pl)
    if (!subMap) {
      subMap = new Map()
      this.map.set(pl, subMap)
    }
    subMap.set(pr, t)
  }
}

function getRight<T> (r: object, map: Map<object, T>): T {
  r = Object.getPrototypeOf(r)
  while (r) {
    const t = map.get(r)
    if (t) return t
    r = Object.getPrototypeOf(r)
  }
  throw new Error('Cannot dispatch object')
}
