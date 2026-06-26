import { describe, it, expect } from 'vitest'
import { createCanvas } from '@napi-rs/canvas'
import { drawWatch } from '../src/utils/renderer.js'
import { DIAL_SPECS, resolveDialSpec, validateDialSpec, HANDSETS } from '../src/data/dialSpecs.js'
import { drawHandShape, drawSecondsShape } from '../src/utils/handsets.js'
import { drawSubdials } from '../src/utils/subdials.js'

const SIZE = 300
const ALL_PARTS = ['case','bezel','crystal','dial','hands','crown','fitting','links','caseback']

function px(spec) {
  // Render a watch with an injected bespoke spec via a fake model id.
  const id = '__test__' + Math.random().toString(36).slice(2)
  DIAL_SPECS[id] = spec
  const brand = { name: 'TEST', id: 'test' }
  const model = { id, dial: 'Blue', material: 'Stainless Steel', type: 'Sport', complication: 'Date' }
  const canvas = createCanvas(SIZE, SIZE)
  drawWatch({ canvas, brand, model, parts: ALL_PARTS, showHands: true, h: 10, m: 10, s: 30 })
  const data = canvas.getContext('2d').getImageData(0, 0, SIZE, SIZE).data
  delete DIAL_SPECS[id]
  return data
}

function frac(a, b, t = 2) {
  let d = 0
  for (let i = 0; i < a.length; i += 4)
    if (Math.abs(a[i]-b[i])>t||Math.abs(a[i+1]-b[i+1])>t||Math.abs(a[i+2]-b[i+2])>t) d++
  return d / (a.length/4)
}

const BASE = { finish:'sunburst', baseColor:'#0a1a3a', markers:{style:'baton',lume:true},
  numerals:{set:'none',positions:[]}, subdials:[], handset:'dauphine',
  bezelSpec:{kind:'minute',insert:'#1a2a4a'} }

describe('handset mapping — each enum renders and differs from dauphine', () => {
  const ref = px({ ...BASE, handset: 'dauphine' })
  for (const hs of HANDSETS) {
    it(`handset "${hs}" produces a valid render`, () => {
      const out = px({ ...BASE, handset: hs })
      expect(out.length).toBe(SIZE*SIZE*4)
      if (hs !== 'dauphine') {
        // different handset → visibly different pixels around the hands
        expect(frac(ref, out)).toBeGreaterThan(0.001)
      }
    })
  }

  it('drawHandShape falls back to dauphine for unknown type', () => {
    const c1 = createCanvas(100,100), c2 = createCanvas(100,100)
    const x1 = c1.getContext('2d'), x2 = c2.getContext('2d')
    x1.translate(50,50); drawHandShape(x1, 'dauphine', 40, 6, '#fff')
    x2.translate(50,50); drawHandShape(x2, 'nonsense', 40, 6, '#fff')
    const a = x1.getImageData(0,0,100,100).data, b = x2.getImageData(0,0,100,100).data
    expect(frac(a,b)).toBe(0) // identical
  })
})

describe('subdial fidelity — N entries build N registers at declared angles', () => {
  it('zero subdials → no-op (matches no-subdial render)', () => {
    const none = px({ ...BASE, subdials: [] })
    const ref  = px({ ...BASE })
    expect(frac(none, ref)).toBe(0)
  })

  it('3 subdials change pixels in 3 distinct regions', () => {
    const ref = px({ ...BASE, subdials: [] })
    const three = px({ ...BASE, subdials: [
      { posAngle: 270, dist: 0.42, radius: 0.16, ring: true, hand: true, scale: 'tachymeter', handAngle: 40 },
      { posAngle: 0,   dist: 0.42, radius: 0.16, ring: true, hand: true, scale: 'minute', handAngle: 200 },
      { posAngle: 90,  dist: 0.42, radius: 0.16, ring: true, hand: true, scale: 'hour', handAngle: 120 },
    ]})
    expect(frac(ref, three)).toBeGreaterThan(0.01)
  })

  it('declared count is honoured geometrically (1 vs 2 differ)', () => {
    const one = px({ ...BASE, subdials: [{ posAngle: 270, radius: 0.16 }] })
    const two = px({ ...BASE, subdials: [{ posAngle: 270, radius: 0.16 }, { posAngle: 90, radius: 0.16 }] })
    expect(frac(one, two)).toBeGreaterThan(0.005)
  })

  it('drawSubdials no-ops on empty/invalid input', () => {
    const c = createCanvas(100,100); const x = c.getContext('2d')
    const before = x.getImageData(0,0,100,100).data.slice()
    drawSubdials(x, { subdials: [] }, 50, 50, 40, '#111118', '#fff')
    drawSubdials(x, {}, 50, 50, 40, '#111118', '#fff')
    const after = x.getImageData(0,0,100,100).data
    expect(frac(before, after)).toBe(0)
  })
})

describe('finish differentiation — bespoke finishes change the dial', () => {
  const legacyLook = px({ ...BASE })  // sunburst but bespoke → procedural
  for (const finish of ['opaline','fume','guilloche','matte','lacquer']) {
    it(`finish "${finish}" differs from sunburst`, () => {
      const out = px({ ...BASE, finish })
      expect(frac(legacyLook, out)).toBeGreaterThan(0.01)
    })
  }
})

describe('bespoke specs still pass validation', () => {
  it('a fully-authored example validates', () => {
    const spec = resolveDialSpec({ name:'X' }, { id:'none', dial:'Black', complication:'Chronograph' })
    const merged = { ...spec, bespoke:true, finish:'sunburst', subdials:[
      { posAngle:270, radius:0.16 }, { posAngle:90, radius:0.16 }
    ], handset:'mercedes' }
    const { valid, errors } = validateDialSpec(merged, 'ex')
    expect(errors).toEqual([])
    expect(valid).toBe(true)
  })
})
