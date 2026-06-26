import { describe, it, expect } from 'vitest'
import { BRANDS } from '../src/data/gameData.js'
import { DIAL_SPECS, resolveDialSpec, validateDialSpec } from '../src/data/dialSpecs.js'

const HEROES = ['submariner','daytona','speedmaster','nautilus','royaloak','grandcomp']
const find = id => { for (const b of BRANDS) for (const m of b.models) if (m.id===id) return [b,m] }

describe('Phase D — hero references are authored and valid', () => {
  for (const id of HEROES) {
    it(`${id} has an authored spec`, () => {
      expect(DIAL_SPECS[id], `${id} present in DIAL_SPECS`).toBeTruthy()
    })
    it(`${id} resolves to a valid bespoke spec`, () => {
      const [b,m] = find(id)
      const spec = resolveDialSpec(b, m)
      expect(spec.bespoke).toBe(true)
      const { valid, errors } = validateDialSpec(spec, id)
      expect(errors).toEqual([])
      expect(valid).toBe(true)
    })
  }

  it('chronographs declare 3 subdials', () => {
    expect(DIAL_SPECS.daytona.subdials.length).toBe(3)
    expect(DIAL_SPECS.speedmaster.subdials.length).toBe(3)
  })
  it('diver + integrated sports declare a date aperture', () => {
    expect(DIAL_SPECS.submariner.complicationsLayout.aperture).toBe('date')
    expect(DIAL_SPECS.nautilus.complicationsLayout.aperture).toBe('date')
    expect(DIAL_SPECS.royaloak.complicationsLayout.aperture).toBe('date')
  })
  it('grand complication uses roman numerals and breguet hands', () => {
    expect(DIAL_SPECS.grandcomp.numerals.set).toBe('roman')
    expect(DIAL_SPECS.grandcomp.handset).toBe('breguet')
  })
  it('an unauthored model id still falls back to non-bespoke', () => {
    const spec = resolveDialSpec({ name:'T', id:'t' }, { id:'__none__', dial:'Black', complication:'Date' })
    expect(spec.bespoke).toBe(false)
  })
})
