import { describe, it, expect } from 'vitest'
import { BRANDS } from '../src/data/gameData.js'
import {
  resolveDialSpec, validateDialSpec, defaultDialSpec,
  DIAL_SPECS, REQUIRED_FIELDS, FINISHES, HANDSETS,
} from '../src/data/dialSpecs.js'

// Flatten catalogue into [brand, model] pairs
const PAIRS = BRANDS.flatMap(b => b.models.map(m => [b, m]))

describe('spec validity — every catalogue model resolves to a complete, valid spec', () => {
  it('covers all models', () => {
    expect(PAIRS.length).toBe(18) // Rolex 4 + Omega 3 + Patek 3 + AP 3 + Breitling 2 + Vacheron 3
  })

  for (const [brand, model] of PAIRS) {
    it(`${brand.name} / ${model.name} → valid spec`, () => {
      const spec = resolveDialSpec(brand, model)
      const { valid, errors } = validateDialSpec(spec, model.id)
      expect(errors).toEqual([])
      expect(valid).toBe(true)
      for (const f of REQUIRED_FIELDS) expect(spec[f]).not.toBeNull()
    })
  }
})

describe('spec enums stay in range', () => {
  it('finish enum complete', () => {
    expect(FINISHES).toContain('sunburst')
    expect(FINISHES).toContain('skeleton')
  })
  it('handset enum has 7 canonical shapes', () => {
    expect(HANDSETS.length).toBe(7)
  })
})

describe('authored specs (if any) are individually valid', () => {
  const ids = Object.keys(DIAL_SPECS)
  if (ids.length === 0) {
    it('no authored specs yet (Phase A) — vacuously valid', () => expect(true).toBe(true))
  }
  for (const id of ids) {
    it(`DIAL_SPECS["${id}"] merges to a valid spec`, () => {
      // find the owning model to derive a base
      const pair = PAIRS.find(([, m]) => m.id === id)
      expect(pair, `model "${id}" exists in catalogue`).toBeTruthy()
      const [brand, model] = pair
      const spec = resolveDialSpec(brand, model)
      const { errors } = validateDialSpec(spec, id)
      expect(errors).toEqual([])
      expect(spec.bespoke).toBe(true)
    })
  }
})

describe('resolver parity — unauthored models inherit legacy-derived defaults', () => {
  // After Phase E the whole catalogue is authored, so test the fallback MECHANISM
  // with a synthetic model id that is guaranteed absent from DIAL_SPECS.
  it('a model with no authored spec falls back to its derived default', () => {
    const brand = { name: 'TEST', id: 'test' }
    const model = { id: '__unauthored__', dial: 'Black', material: 'Steel', type: 'Sport', complication: 'Date' }
    const resolved = resolveDialSpec(brand, model)
    const dflt = defaultDialSpec(brand, model)
    expect(resolved).toEqual(dflt)
    expect(resolved.bespoke).toBe(false)
  })

  // Any catalogue models that remain unauthored (none expected after Phase E)
  // must still match their default.
  for (const [brand, model] of PAIRS) {
    if (DIAL_SPECS[model.id]) continue
    it(`${model.name} resolves identically to its default`, () => {
      expect(resolveDialSpec(brand, model)).toEqual(defaultDialSpec(brand, model))
    })
  }
})

describe('validator rejects malformed specs', () => {
  it('flags missing required fields', () => {
    const { valid, errors } = validateDialSpec({}, 'empty')
    expect(valid).toBe(false)
    expect(errors.length).toBeGreaterThanOrEqual(REQUIRED_FIELDS.length)
  })
  it('flags bad enum + bad hex + bad subdial', () => {
    const bad = {
      finish: 'glitter', baseColor: 'blue', accentColor: '#zzz',
      markers: { style: 'engraved', lume: 'yes' },
      numerals: { set: 'cyrillic', positions: [13, 0] },
      subdials: [{ posAngle: 'top', radius: 9 }],
      handset: 'spaghetti',
      bezelSpec: { kind: 'jagged', insert: 'red' },
      complicationsLayout: { aperture: 'window' },
      track: { kind: 'spiral' },
    }
    const { valid, errors } = validateDialSpec(bad, 'bad')
    expect(valid).toBe(false)
    // spot-check several independent failures were caught
    expect(errors.some(e => e.includes('finish'))).toBe(true)
    expect(errors.some(e => e.includes('baseColor'))).toBe(true)
    expect(errors.some(e => e.includes('handset'))).toBe(true)
    expect(errors.some(e => e.includes('subdials[0]'))).toBe(true)
    expect(errors.some(e => e.includes('numerals.positions'))).toBe(true)
  })
})
