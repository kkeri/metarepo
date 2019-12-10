import { test } from 'tap'
import { Model } from '../types'
import { Diagnostics } from '../../util/diag'
import { ohmParser } from '../ohmParser'
import { ParseContext, parse } from '../parse'
import { createStateStorage } from '../useState'
import { parseRules } from '../parseRules'
import * as model from '../model'
import { createJoin } from '../join'
import { createMeet } from '../meet'

function ohmParse (str: string): Model {
  const diag = new Diagnostics()
  const model = ohmParser.parse(str, { diag })
  return model
}

function xpParse (model: Model, source: string): Model {
  const parseCtx: ParseContext = {
    sourceName: 'source',
    source,
    pos: 0,
    join: createJoin(),
    meet: createMeet(),
    useState: createStateStorage(),
    rules: parseRules,
  }
  return parse(parseCtx, model)
}

test('NullType', t => {
  t.type(xpParse(new model.NullType(), ''), model.Missing)
  t.type(xpParse(new model.NullType(), 'ul'), model.Missing)
  t.type(xpParse(new model.NullType(), 'null'), model.NullConstant)
  t.end()
})

test('BooleanType', t => {
  t.type(xpParse(new model.BooleanType(), ''), model.Missing)
  t.type(xpParse(new model.BooleanType(), '.'), model.Missing)
  t.same(xpParse(new model.BooleanType(), 'true'), new model.BooleanConstant(true))
  t.same(xpParse(new model.BooleanType(), 'false'), new model.BooleanConstant(false))
  t.same(xpParse(new model.BooleanType(), 'trueee'), new model.BooleanConstant(true))
  t.end()
})

test('NumberType', t => {
  t.type(xpParse(new model.NumberType(), ''), model.Missing)
  t.type(xpParse(new model.NumberType(), '.'), model.Missing)
  t.same(xpParse(new model.NumberType(), '1'), new model.NumberConstant(1))
  t.same(xpParse(new model.NumberType(), '3.3'), new model.NumberConstant(3.3))
  t.same(xpParse(new model.NumberType(), '3.3xxx'), new model.NumberConstant(3.3))
  t.end()
})

test('NameType', t => {
  t.same(xpParse(new model.NameType(), ''), new model.Missing(new model.NameType()))
  t.same(xpParse(new model.NameType(), '.'), new model.Missing(new model.NameType()))
  t.same(xpParse(new model.NameType(), '3'), new model.Missing(new model.NameType()))
  t.same(xpParse(new model.NameType(), 'a'), new model.NameConstant('a'))
  t.same(xpParse(new model.NameType(), 'abc123'), new model.NameConstant('abc123'))
  t.same(xpParse(new model.NameType(), '_'), new model.NameConstant('_'))
  t.end()
})

test('RegExpConstant', t => {
  const s1 = new model.RegExpConstant(/abc|123/)
  t.same(xpParse(s1, ''), new model.Missing(s1))
  t.same(xpParse(s1, '.'), new model.Missing(s1))
  t.same(xpParse(s1, 'abc'), new model.StringConstant('abc'))
  t.same(xpParse(s1, '123'), new model.StringConstant('123'))
  t.same(xpParse(s1, 'abc123'), new model.StringConstant('abc'))
  t.end()
})

test('Or', t => {
  const s1 = new model.Or(new model.NumberType(), new model.BooleanType())
  t.same(xpParse(s1, ''),
    new model.Missing(s1)
  )
  t.same(xpParse(s1, 'a 1'),
    new model.Missing(s1)
  )
  t.same(xpParse(s1, '1 true'),
    new model.NumberConstant(1)
  )
  t.same(xpParse(s1, '2 a'),
    new model.NumberConstant(2)
  )
  t.same(xpParse(s1, 'true'),
    new model.BooleanConstant(true)
  )
  t.same(xpParse(s1, 'true a'),
    new model.BooleanConstant(true)
  )
  t.end()
})

test('And', t => {
  const s1 = new model.And(new model.NumberType(), new model.BooleanType())
  t.same(xpParse(s1, ''),
    new model.Missing(s1.a)
  )
  t.same(xpParse(s1, '1'),
    new model.Missing(s1.b)
  )
  t.same(xpParse(s1, 'true 2'),
    new model.Missing(s1.a)
  )
  t.same(xpParse(s1, '1 2'),
    new model.Missing(s1.b)
  )
  t.same(xpParse(s1, '1 true'),
    new model.And(new model.NumberConstant(1), new model.BooleanConstant(true), 0)
  )
  t.same(xpParse(s1, '1true'),
    new model.And(new model.NumberConstant(1), new model.BooleanConstant(true), 0)
  )
  t.same(xpParse(s1, '2 false 1 true'),
    new model.And(new model.NumberConstant(2), new model.BooleanConstant(false), 0)
  )
  t.end()
})
