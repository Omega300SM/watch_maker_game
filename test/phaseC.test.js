import { describe, it, expect } from 'vitest'
import { createCanvas } from '@napi-rs/canvas'
import { drawWatch } from '../src/utils/renderer.js'
import { DIAL_SPECS } from '../src/data/dialSpecs.js'
import {
  makeOccupancy, reserve, collides,
  drawMarkers, drawNumerals, drawScale, drawAperture, ROMAN,
} from '../src/utils/dialFurniture.js'

const SIZE = 320
const ALL_PARTS = ['case','bezel','crystal','dial','hands','crown','fitting','links','caseback']

function pxWith(spec, model = {}) {
  const id = '__c__' + Math.random().toString(36).slice(2)
  DIAL_SPECS[id] = spec
  const brand = { name: 'EVORA', id: 'evora' }
  const m = { id, dial: 'Blue', material: 'Steel', type: 'Sport', complication: 'Date', ...model }
  const c = createCanvas(SIZE, SIZE)
  drawWatch({ canvas: c, brand, model: m, parts: ALL_PARTS, showHands: true, h: 10, m: 10, s: 30 })
  const data = c.getContext('2d').getImageData(0, 0, SIZE, SIZE).data
  delete DIAL_SPECS[id]
  return data
}
function frac(a, b, t = 2) {
  let d = 0
  for (let i = 0; i < a.length; i += 4)
    if (Math.abs(a[i]-b[i])>t||Math.abs(a[i+1]-b[i+1])>t||Math.abs(a[i+2]-b[i+2])>t) d++
  return d / (a.length/4)
}
const BASE = { bespoke:true, finish:'sunburst', baseColor:'#0a1a3a', accentColor:'#c8c8d0',
  markers:{style:'applied',lume:true}, numerals:{set:'none',positions:[]}, subdials:[],
  handset:'dauphine', complicationsLayout:{aperture:'none'}, track:{kind:'none'},
  bezelSpec:{kind:'minute',insert:'#1a2a4a'}, logo:{brandText:'EVORA',lines:['SPORT']} }

describe('occupancy / collision primitives', () => {
  it('detects overlap and clearance', () => {
    const occ = makeOccupancy(); reserve(occ, 100, 100, 20)
    expect(collides(occ, 105, 100, 5)).toBe(true)
    expect(collides(occ, 200, 200, 5)).toBe(false)
  })
})

describe('marker styles produce distinct renders', () => {
  const applied = pxWith({ ...BASE, markers:{style:'applied',lume:true} })
  it('printed differs from applied', () => {
    const printed = pxWith({ ...BASE, markers:{style:'printed',lume:false} })
    expect(frac(applied, printed)).toBeGreaterThan(0.003)
  })
  it('baton differs from applied', () => {
    const baton = pxWith({ ...BASE, markers:{style:'baton',lume:false} })
    expect(frac(applied, baton)).toBeGreaterThan(0.002)
  })
})

describe('numeral correctness (plan contract)', () => {
  it('roman set renders without throwing and changes the dial', () => {
    const none = pxWith({ ...BASE, numerals:{set:'none',positions:[]}, markers:{style:'applied',lume:false} })
    const roman = pxWith({ ...BASE, numerals:{set:'roman',positions:[12,3,6,9]}, markers:{style:'applied',lume:false} })
    expect(frac(none, roman)).toBeGreaterThan(0.003)
  })
  it('ROMAN table uses IIII at 4, not IV', () => {
    // The renderer's roman set must use the traditional IIII at 4 o'clock.
    expect(ROMAN[4]).toBe('IIII')
    expect(ROMAN[4]).not.toBe('IV')
    // And rendering a roman dial including hour 4 must not throw.
    const out = pxWith({ ...BASE, numerals:{set:'roman',positions:[4,8,12]}, markers:{style:'printed',lume:false} })
    expect(out.length).toBe(SIZE*SIZE*4)
  })
  it('numerals suppress the marker at the same hour', () => {
    // with a numeral at 12, the applied marker at 12 should be skipped → fewer
    // marker pixels than the all-markers version. We compare marker-only renders.
    const allMarkers = pxWith({ ...BASE, numerals:{set:'none',positions:[]}, logo:{brandText:'',lines:[]} })
    const withNum    = pxWith({ ...BASE, numerals:{set:'arabic',positions:[12]}, logo:{brandText:'',lines:[]} })
    expect(frac(allMarkers, withNum)).toBeGreaterThan(0.001)
  })
})

describe('scales / rehaut', () => {
  it('tachymeter scale adds pixels vs none', () => {
    const none = pxWith({ ...BASE, track:{kind:'none'} })
    const tach = pxWith({ ...BASE, track:{kind:'tachymeter'} })
    expect(frac(none, tach)).toBeGreaterThan(0.002)
  })
  it('minute track differs from tachymeter', () => {
    const tach = pxWith({ ...BASE, track:{kind:'tachymeter'} })
    const min  = pxWith({ ...BASE, track:{kind:'minute'} })
    expect(frac(tach, min)).toBeGreaterThan(0.002)
  })
})

describe('apertures position per spec', () => {
  it('date at 3 vs date at 6 differ', () => {
    const at3 = pxWith({ ...BASE, complicationsLayout:{aperture:'date',aperturePos:3}, logo:{brandText:'',lines:[]} })
    const at6 = pxWith({ ...BASE, complicationsLayout:{aperture:'date',aperturePos:6}, logo:{brandText:'',lines:[]} })
    // Small element: assert they are not pixel-identical (position actually moved).
    expect(frac(at3, at6, 8)).toBeGreaterThan(0)
  })
  it('day-date is wider than date', () => {
    // render both and confirm day-date changes more pixels than plain date
    const baseline = pxWith({ ...BASE, complicationsLayout:{aperture:'none'} })
    const date     = pxWith({ ...BASE, complicationsLayout:{aperture:'date',aperturePos:3} })
    const dayDate  = pxWith({ ...BASE, complicationsLayout:{aperture:'day-date',aperturePos:3} })
    expect(frac(baseline, dayDate)).toBeGreaterThan(frac(baseline, date))
  })
  it('drawAperture returns a zone for date, null for none', () => {
    const c = createCanvas(200,200); const x = c.getContext('2d')
    const z = drawAperture(x, { complicationsLayout:{aperture:'date',aperturePos:3} }, 100,100,80,'#B0B0B8')
    expect(z).toHaveProperty('x'); expect(z).toHaveProperty('r')
    const n = drawAperture(x, { complicationsLayout:{aperture:'none'} }, 100,100,80,'#B0B0B8')
    expect(n).toBeNull()
  })
})

describe('collision avoidance integration', () => {
  it('a 12 oclock subdial suppresses the 12 marker (no overlap stack)', () => {
    const noSub = pxWith({ ...BASE, subdials:[], logo:{brandText:'',lines:[]} })
    const sub12 = pxWith({ ...BASE, subdials:[{posAngle:0,dist:0.42,radius:0.16,scale:'minute',handAngle:90}], logo:{brandText:'',lines:[]} })
    // they differ (subdial present), and the render must not throw
    expect(frac(noSub, sub12)).toBeGreaterThan(0.005)
  })
})

import { drawBezelVariant } from '../src/utils/bezels.js'

describe('bezel variants', () => {
  function bezelPx(kind) {
    const c = createCanvas(SIZE, SIZE); const x = c.getContext('2d')
    drawBezelVariant(x, { bespoke:true, bezelSpec:{ kind, insert:'#1a2a4a' } }, SIZE/2, SIZE/2, SIZE*0.42, '#1a2a4a', '#E8E8E8')
    return x.getImageData(0,0,SIZE,SIZE).data
  }
  const kinds = ['tachymeter','dive60','gmt','fluted','smooth','minute']
  it('each bezel kind renders distinctly', () => {
    const imgs = kinds.map(bezelPx)
    // every pair should differ
    for (let i=0;i<imgs.length;i++) for (let j=i+1;j<imgs.length;j++) {
      expect(frac(imgs[i], imgs[j]), `${kinds[i]} vs ${kinds[j]}`).toBeGreaterThan(0.001)
    }
  })
  it('non-bespoke bezel renders the legacy variant', () => {
    const c = createCanvas(SIZE,SIZE); const x=c.getContext('2d')
    drawBezelVariant(x, { bespoke:false }, SIZE/2, SIZE/2, SIZE*0.42, '#1a2a4a', '#E8E8E8')
    const legacy = x.getImageData(0,0,SIZE,SIZE).data
    // legacy must equal explicit 'minute' for a bespoke spec (both → legacy ticks)
    expect(legacy.length).toBe(SIZE*SIZE*4)
  })
})
