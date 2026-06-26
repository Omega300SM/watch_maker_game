import { describe, it, expect } from 'vitest'
import { existsSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createCanvas } from '@napi-rs/canvas'
import { BRANDS } from '../src/data/gameData.js'
import { DIAL_SPECS, resolveDialSpec, validateDialSpec } from '../src/data/dialSpecs.js'
import { drawWatch } from '../src/utils/renderer.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const SNAP_DIR = join(__dir, '__snapshots__')
const PAIRS = BRANDS.flatMap(b => b.models.map(m => [b, m]))
const PARTS = ['case','bezel','crystal','dial','hands','crown','fitting','links','caseback']

describe('Phase E — full catalogue is bespoke', () => {
  it('every catalogue model has an authored dial spec', () => {
    const missing = PAIRS.filter(([,m]) => !DIAL_SPECS[m.id]).map(([,m]) => m.id)
    expect(missing).toEqual([])
  })

  it('every model resolves to a valid bespoke spec', () => {
    for (const [b, m] of PAIRS) {
      const spec = resolveDialSpec(b, m)
      expect(spec.bespoke, `${m.id} bespoke`).toBe(true)
      const { errors } = validateDialSpec(spec, m.id)
      expect(errors, `${m.id} errors`).toEqual([])
    }
  })

  it('every model has a committed snapshot baseline', () => {
    for (const [b, m] of PAIRS) {
      const p = join(SNAP_DIR, `${b.id}__${m.id}.png`)
      expect(existsSync(p), `baseline ${b.id}__${m.id}.png`).toBe(true)
    }
  })

  it('baseline count matches catalogue size (no orphans)', () => {
    const pngs = readdirSync(SNAP_DIR).filter(f => f.endsWith('.png'))
    expect(pngs.length).toBe(PAIRS.length)
  })
})

describe('Phase E — render determinism', () => {
  it('same model renders identically across two calls (fixed time)', () => {
    const [b, m] = PAIRS[0]
    const r = () => {
      const c = createCanvas(200, 200)
      drawWatch({ canvas: c, brand: b, model: m, parts: PARTS, showHands: true, h: 10, m: 10, s: 30 })
      return c.getContext('2d').getImageData(0,0,200,200).data
    }
    const a = r(), c2 = r()
    let diff = 0
    for (let i=0;i<a.length;i++) if (a[i]!==c2[i]) diff++
    expect(diff).toBe(0)
  })
})

describe('Phase E — feature coverage across catalogue', () => {
  it('exercises all bezel kinds in use', () => {
    const kinds = new Set(Object.values(DIAL_SPECS).map(s => s.bezelSpec?.kind))
    expect(kinds.has('gmt')).toBe(true)       // GMT-Master
    expect(kinds.has('dive60')).toBe(true)    // divers
    expect(kinds.has('tachymeter')).toBe(true)// chronographs
    expect(kinds.has('fluted')).toBe(true)    // Datejust / RO
    expect(kinds.has('smooth')).toBe(true)    // dress
  })
  it('exercises day-date aperture somewhere', () => {
    const apertures = Object.values(DIAL_SPECS).map(s => s.complicationsLayout?.aperture)
    expect(apertures).toContain('day-date')
  })
  it('exercises multiple finishes', () => {
    const finishes = new Set(Object.values(DIAL_SPECS).map(s => s.finish))
    expect(finishes.size).toBeGreaterThanOrEqual(4)
  })
})
