// ════════════════════════════════════════════════════════════════════════════
//  HOROLOGY — HANDSET LIBRARY (Phase B)
//  Parametric hour/minute hand profiles dispatched by spec.handset enum.
//  Each profile is drawn in a local frame: origin at the pivot, the hand
//  pointing "up" (toward -Y). Caller translates+rotates into place.
//
//  PARITY: the 'dauphine' profile reproduces the legacy drawHand() exactly so
//  unauthored models (which default to 'dauphine') don't drift.
// ════════════════════════════════════════════════════════════════════════════

import { lighten, darken } from './colour.js'

const LUME = 'rgba(200,255,200,0.6)'

// Public: draw an hour or minute hand of a given handset type.
// ctx already translated to pivot & rotated so +len is "up" (-Y after rotate).
// We draw in the rotated frame: length runs along -Y.
export function drawHandShape(ctx, type, len, w, color, opts = {}) {
  const lume = opts.lume !== false
  switch (type) {
    case 'mercedes':  return mercedes(ctx, len, w, color, lume)
    case 'sword':     return sword(ctx, len, w, color, lume)
    case 'alpha':     return alpha(ctx, len, w, color, lume)
    case 'baton':     return baton(ctx, len, w, color, lume)
    case 'snowflake': return snowflake(ctx, len, w, color, lume)
    case 'breguet':   return breguet(ctx, len, w, color, lume)
    case 'dauphine':
    default:          return dauphine(ctx, len, w, color, lume)
  }
}

// ─── DAUPHINE (legacy-exact) ─────────────────────────────────────────────────
function dauphine(ctx, len, w, color, lume) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0); ctx.lineTo(-w/2, -len*0.15); ctx.lineTo(-w*0.3, -len)
  ctx.lineTo(0, -len-w*0.1); ctx.lineTo(w*0.3, -len); ctx.lineTo(w/2, -len*0.15)
  ctx.closePath(); ctx.fill()
  if (lume) { ctx.fillStyle = LUME; ctx.fillRect(-w*0.2, -len*0.9, w*0.4, len*0.6) }
  ctx.fillStyle = darken(color, 20); ctx.fillRect(-w*0.3, 0, w*0.6, len*0.1)
}

// ─── MERCEDES (Rolex-style: tapered hand with a circular lume disc near tip) ──
function mercedes(ctx, len, w, color, lume) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0); ctx.lineTo(-w*0.55, -len*0.12); ctx.lineTo(-w*0.32, -len*0.78)
  ctx.lineTo(0, -len); ctx.lineTo(w*0.32, -len*0.78); ctx.lineTo(w*0.55, -len*0.12)
  ctx.closePath(); ctx.fill()
  // lume-filled circle (the "mercedes" disc) at ~0.6 len
  const cr = w * 1.15, cyl = -len * 0.6
  ctx.beginPath(); ctx.arc(0, cyl, cr, 0, Math.PI*2)
  ctx.fillStyle = color; ctx.fill()
  ctx.strokeStyle = darken(color, 15); ctx.lineWidth = 0.6; ctx.stroke()
  if (lume) { ctx.fillStyle = LUME; ctx.beginPath(); ctx.arc(0, cyl, cr*0.72, 0, Math.PI*2); ctx.fill() }
  ctx.fillStyle = darken(color, 20); ctx.fillRect(-w*0.4, 0, w*0.8, len*0.1)
}

// ─── SWORD (straight tapered triangle, broad base) ───────────────────────────
function sword(ctx, len, w, color, lume) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(-w*0.6, 0); ctx.lineTo(0, -len); ctx.lineTo(w*0.6, 0)
  ctx.closePath(); ctx.fill()
  if (lume) { ctx.fillStyle = LUME; ctx.beginPath()
    ctx.moveTo(-w*0.28, -len*0.1); ctx.lineTo(0, -len*0.82); ctx.lineTo(w*0.28, -len*0.1)
    ctx.closePath(); ctx.fill() }
  ctx.fillStyle = darken(color, 20); ctx.fillRect(-w*0.35, 0, w*0.7, len*0.08)
}

// ─── ALPHA (slim leaf, pointed) ──────────────────────────────────────────────
function alpha(ctx, len, w, color, lume) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(0, 0)
  ctx.quadraticCurveTo(-w*0.7, -len*0.45, 0, -len)
  ctx.quadraticCurveTo(w*0.7, -len*0.45, 0, 0)
  ctx.closePath(); ctx.fill()
  if (lume) { ctx.fillStyle = LUME
    ctx.beginPath(); ctx.moveTo(0,-len*0.2)
    ctx.quadraticCurveTo(-w*0.32,-len*0.5,0,-len*0.85)
    ctx.quadraticCurveTo(w*0.32,-len*0.5,0,-len*0.2); ctx.closePath(); ctx.fill() }
  ctx.fillStyle = darken(color, 20); ctx.fillRect(-w*0.3, 0, w*0.6, len*0.1)
}

// ─── BATON (plain rectangle, modern) ─────────────────────────────────────────
function baton(ctx, len, w, color, lume) {
  ctx.fillStyle = color
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(-w*0.4, -len, w*0.8, len, w*0.2); ctx.fill() }
  else ctx.fillRect(-w*0.4, -len, w*0.8, len)
  if (lume) { ctx.fillStyle = LUME; ctx.fillRect(-w*0.22, -len*0.9, w*0.44, len*0.7) }
  ctx.fillStyle = darken(color, 20); ctx.fillRect(-w*0.4, 0, w*0.8, len*0.1)
}

// ─── SNOWFLAKE (Tudor-style square-shouldered hand with big lume) ────────────
function snowflake(ctx, len, w, color, lume) {
  ctx.fillStyle = color
  ctx.beginPath()
  ctx.moveTo(-w*0.22, 0)
  ctx.lineTo(-w*0.22, -len*0.5)
  ctx.lineTo(-w*0.9,  -len*0.62)   // left shoulder point
  ctx.lineTo(-w*0.22, -len*0.74)
  ctx.lineTo(-w*0.22, -len*0.86)
  ctx.lineTo(0,       -len)         // tip
  ctx.lineTo(w*0.22,  -len*0.86)
  ctx.lineTo(w*0.22,  -len*0.74)
  ctx.lineTo(w*0.9,   -len*0.62)    // right shoulder point
  ctx.lineTo(w*0.22,  -len*0.5)
  ctx.lineTo(w*0.22,  0)
  ctx.closePath(); ctx.fill()
  if (lume) { ctx.fillStyle = LUME
    ctx.beginPath(); ctx.moveTo(-w*0.5,-len*0.62); ctx.lineTo(0,-len*0.5); ctx.lineTo(w*0.5,-len*0.62)
    ctx.lineTo(0,-len*0.74); ctx.closePath(); ctx.fill() }
  ctx.fillStyle = darken(color, 20); ctx.fillRect(-w*0.3, 0, w*0.6, len*0.1)
}

// ─── BREGUET (open "pomme"/moon tip, classic dress) ──────────────────────────
function breguet(ctx, len, w, color, lume) {
  ctx.strokeStyle = color; ctx.lineWidth = Math.max(1, w*0.28); ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -len*0.78); ctx.stroke()
  // hollow moon/pomme ring near tip
  const ry = -len*0.8, rr = w*0.85
  ctx.beginPath(); ctx.arc(0, ry, rr, 0, Math.PI*2)
  ctx.lineWidth = Math.max(0.8, w*0.22); ctx.stroke()
  // pointer beyond the ring
  ctx.beginPath(); ctx.moveTo(0, ry-rr); ctx.lineTo(0, -len); ctx.lineWidth = Math.max(1, w*0.2); ctx.stroke()
  ctx.fillStyle = darken(color, 20); ctx.fillRect(-w*0.3, 0, w*0.6, len*0.1)
}

// ─── SECONDS HANDS ───────────────────────────────────────────────────────────
// Legacy-exact default ('lollipop'): thin red with a counterweight disc.
export function drawSecondsShape(ctx, type, len, color = '#E02020') {
  ctx.strokeStyle = color; ctx.lineWidth = 1.2; ctx.lineCap = 'round'
  ctx.beginPath(); ctx.moveTo(0, len*0.25); ctx.lineTo(0, -len); ctx.stroke()
  ctx.fillStyle = color
  if (type === 'lollipop' || type === undefined) {
    ctx.beginPath(); ctx.arc(0, -len*0.85, len*0.04, 0, Math.PI*2); ctx.fill()
  } else if (type === 'counterweight') {
    ctx.beginPath(); ctx.arc(0, len*0.18, len*0.05, 0, Math.PI*2); ctx.fill()
  }
}
