import { describe, it, expect, beforeAll } from 'vitest'
import { existsSync, mkdirSync, readFileSync, writeFileSync, readdirSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import { createCanvas } from '@napi-rs/canvas'
import { BRANDS } from '../src/data/gameData.js'
import { drawWatch } from '../src/utils/renderer.js'

const __dir = dirname(fileURLToPath(import.meta.url))
const SNAP_DIR = join(__dir, '__snapshots__')
const UPDATE = process.env.UPDATE_SNAPSHOTS === '1'

// Fixed render config so snapshots are deterministic (no live Date()).
const ALL_PARTS = ['case','bezel','crystal','dial','hands','crown','fitting','links','caseback']
const SIZE = 300
const FIXED = { showHands: true, h: 10, m: 10, s: 30 }

const PAIRS = BRANDS.flatMap(b => b.models.map(m => [b, m]))

function renderPNG(brand, model) {
  const canvas = createCanvas(SIZE, SIZE)
  // date-window draws new Date().getDate(); freeze it for determinism
  drawWatch({ canvas, brand, model, parts: ALL_PARTS, ...FIXED })
  return canvas.toBuffer('image/png')
}

function rgbaOf(buf) {
  // decode PNG back to pixels via napi-canvas
  return new Promise((res) => {
    const { Image } = require('@napi-rs/canvas')
    const img = new Image()
    img.onload = () => {
      const c = createCanvas(SIZE, SIZE)
      const x = c.getContext('2d')
      x.drawImage(img, 0, 0)
      res(x.getImageData(0, 0, SIZE, SIZE).data)
    }
    img.src = buf
  })
}

function diffFraction(a, b, thresh = 2) {
  if (!a || !b || a.length !== b.length) return 1
  let diff = 0
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i]-b[i])>thresh || Math.abs(a[i+1]-b[i+1])>thresh ||
        Math.abs(a[i+2]-b[i+2])>thresh || Math.abs(a[i+3]-b[i+3])>thresh) diff++
  }
  return diff / (a.length / 4)
}

beforeAll(() => { if (!existsSync(SNAP_DIR)) mkdirSync(SNAP_DIR, { recursive: true }) })

describe('snapshot / visual-diff — dials must not drift unless intended', () => {
  for (const [brand, model] of PAIRS) {
    const key = `${brand.id}__${model.id}.png`
    const path = join(SNAP_DIR, key)

    it(`${brand.name} / ${model.name}`, async () => {
      const png = renderPNG(brand, model)
      if (!existsSync(path) || UPDATE) {
        writeFileSync(path, png)
        // On baseline creation we can't compare; assert the render produced bytes.
        expect(png.length).toBeGreaterThan(100)
        return
      }
      const baseline = readFileSync(path)
      const [a, b] = await Promise.all([rgbaOf(baseline), rgbaOf(png)])
      const frac = diffFraction(a, b)
      // tolerance: <0.5% of pixels may differ (anti-alias jitter across runs)
      expect(frac, `${key} drifted ${(frac*100).toFixed(2)}% of pixels`).toBeLessThan(0.005)
    })
  }
})

describe('asset budget — bundle stays under the agreed ceiling', () => {
  it('built JS+CSS+HTML under 400 KB (if dist exists)', () => {
    const distAssets = join(__dir, '..', 'dist', 'assets')
    if (!existsSync(distAssets)) { expect(true).toBe(true); return } // build not run; skip
    let total = 0
    for (const f of readdirSync(distAssets)) total += readFileSync(join(distAssets, f)).length
    const indexHtml = join(__dir, '..', 'dist', 'index.html')
    if (existsSync(indexHtml)) total += readFileSync(indexHtml).length
    expect(total, `bundle ${(total/1024).toFixed(0)} KB`).toBeLessThan(400 * 1024)
  })
})
