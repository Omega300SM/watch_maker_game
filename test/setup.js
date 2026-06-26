import { createCanvas } from '@napi-rs/canvas'

// The renderer calls canvas.getContext('2d') and standard 2D API. napi-canvas
// implements roundRect, gradients, text, etc., so the real renderer runs
// unmodified. We expose a factory the suites use.
export function makeCanvas(w = 420, h = 420) {
  return createCanvas(w, h)
}

// Render any renderer fn that takes { canvas, ... } and return raw RGBA bytes.
export function renderToBytes(fn, args, w = 420, h = 420) {
  const canvas = makeCanvas(w, h)
  fn({ canvas, ...args })
  const ctx = canvas.getContext('2d')
  return ctx.getImageData(0, 0, w, h).data // Uint8ClampedArray
}

// Mean per-channel absolute difference between two RGBA buffers (0..255).
export function meanDiff(a, b) {
  if (a.length !== b.length) return Infinity
  let sum = 0
  for (let i = 0; i < a.length; i++) sum += Math.abs(a[i] - b[i])
  return sum / a.length
}

// Fraction of pixels differing by more than `thresh` on any channel.
export function diffFraction(a, b, thresh = 2) {
  if (a.length !== b.length) return 1
  let diff = 0, px = a.length / 4
  for (let i = 0; i < a.length; i += 4) {
    if (Math.abs(a[i]-b[i])>thresh || Math.abs(a[i+1]-b[i+1])>thresh ||
        Math.abs(a[i+2]-b[i+2])>thresh || Math.abs(a[i+3]-b[i+3])>thresh) diff++
  }
  return diff / px
}

globalThis.__horologyTestEnv = true
