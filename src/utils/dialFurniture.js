// ════════════════════════════════════════════════════════════════════════════
//  HOROLOGY — DIAL FURNITURE (Phase C)
//  Layout-aware dial detail: markers (applied 3D / printed flat / numerals),
//  logo+text block, rehaut/tachymeter/scales, and complication apertures.
//
//  All text is rendered PROCEDURALLY on canvas (per the chosen font strategy),
//  not via an SVG rasterise step — and all marks are abstracted/original
//  (per the IP decision), never reproductions of real trade dress.
//
//  PARITY: these functions are only invoked for bespoke specs. Non-bespoke
//  dials keep the original inline legacy code in renderer.js, so unauthored
//  models do not drift.
//
//  COLLISION MODEL: a dial maintains an occupancy list of reserved discs
//  (subdials, apertures, centre pinion). Markers/indices/text test against it
//  and skip or shift when they would overlap. This is what makes authored
//  dials read cleanly instead of stacking elements on top of each other.
// ════════════════════════════════════════════════════════════════════════════

import { lighten, darken } from './colour.js'

export const ROMAN = ['', 'I','II','III','IIII','V','VI','VII','VIII','IX','X','XI','XII']

// ─── OCCUPANCY ───────────────────────────────────────────────────────────────
// Each zone: { x, y, r } in canvas px. Used to suppress markers/text that would
// collide with subdials or apertures.
export function makeOccupancy() { return [] }
export function reserve(occ, x, y, r) { occ.push({ x, y, r }); return occ }
export function collides(occ, x, y, r, pad = 0) {
  for (const z of occ) {
    const dx = x - z.x, dy = y - z.y
    if (Math.hypot(dx, dy) < z.r + r + pad) return true
  }
  return false
}

// ─── MARKERS / INDICES ───────────────────────────────────────────────────────
// style: 'applied' (3D bevelled metal), 'printed' (flat), 'baton' (legacy-like),
//        'numeral' (drawn by drawNumerals instead). lume optional pip.
export function drawMarkers(ctx, spec, cx, cy, r, indexColor, occ) {
  const m = spec.markers || {}
  const style = m.style || 'baton'
  if (style === 'numeral') return // numerals handled separately
  const numerals = spec.numerals || { set: 'none', positions: [] }

  for (let i = 0; i < 12; i++) {
    const hour = i === 0 ? 12 : i
    // skip positions carrying a numeral
    if (numerals.set !== 'none' && numerals.positions?.includes(hour)) continue
    const a = (i / 12) * Math.PI * 2 - Math.PI / 2
    const mx = cx + Math.cos(a) * r * 0.68
    const my = cy + Math.sin(a) * r * 0.68
    // collision: skip markers that fall inside a reserved zone (e.g. a subdial)
    if (occ && collides(occ, mx, my, r * 0.04)) continue
    const big = i % 3 === 0

    ctx.save(); ctx.translate(mx, my); ctx.rotate(a + Math.PI / 2)
    if (style === 'applied') {
      // bevelled metal block: light top, dark bottom for 3D read
      const w = big ? r * 0.05 : r * 0.03, h = big ? r * 0.11 : r * 0.07
      const g = ctx.createLinearGradient(-w/2, 0, w/2, 0)
      g.addColorStop(0, lighten(indexColor, 40)); g.addColorStop(0.5, indexColor); g.addColorStop(1, darken(indexColor, 40))
      ctx.fillStyle = g; ctx.fillRect(-w/2, -h/2, w, h)
      ctx.strokeStyle = darken(indexColor, 30); ctx.lineWidth = 0.5; ctx.strokeRect(-w/2, -h/2, w, h)
      if (m.lume) { ctx.fillStyle = 'rgba(200,255,200,0.55)'; ctx.fillRect(-w*0.28, -h*0.36, w*0.56, h*0.72) }
    } else if (style === 'printed') {
      // flat painted baton, slightly thinner
      ctx.fillStyle = indexColor
      const w = big ? r * 0.035 : r * 0.022, h = big ? r * 0.10 : r * 0.06
      ctx.fillRect(-w/2, -h/2, w, h)
    } else { // baton (legacy geometry)
      ctx.fillStyle = indexColor
      if (big) ctx.fillRect(-r*0.025, -r*0.055, r*0.05, r*0.04)
      else     ctx.fillRect(-r*0.015, -r*0.04,  r*0.03, r*0.03)
    }
    ctx.restore()
  }
}

// ─── NUMERALS (roman/arabic/mixed) ───────────────────────────────────────────
export function drawNumerals(ctx, spec, cx, cy, r, indexColor, occ) {
  const n = spec.numerals
  if (!n || n.set === 'none' || !Array.isArray(n.positions) || n.positions.length === 0) return
  ctx.save()
  ctx.fillStyle = indexColor
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  const fontSize = r * 0.13
  const family = n.set === 'roman' ? "'Cormorant Garamond', serif" : "'Josefin Sans', sans-serif"

  for (const hour of n.positions) {
    if (hour < 1 || hour > 12) continue
    const a = (hour / 12) * Math.PI * 2 - Math.PI / 2
    const nx = cx + Math.cos(a) * r * 0.66
    const ny = cy + Math.sin(a) * r * 0.66
    if (occ && collides(occ, nx, ny, fontSize * 0.5)) continue
    let glyph
    if (n.set === 'roman') glyph = ROMAN[hour]
    else if (n.set === 'arabic') glyph = String(hour)
    else glyph = (hour % 3 === 0) ? (n.romanAnchors ? ROMAN[hour] : String(hour)) : null // mixed: only quarters
    if (!glyph) continue
    ctx.font = `${n.set === 'roman' ? 600 : 300} ${fontSize}px ${family}`
    // upright orientation (no rotation — numerals stay readable)
    ctx.fillText(glyph, nx, ny)
  }
  ctx.restore()
}

// ─── LOGO / TEXT BLOCK ───────────────────────────────────────────────────────
// Abstracted house mark + lines. Positioned above centre by default; collision
// pushes it up if a 12 o'clock subdial is present.
export function drawLogoBlock(ctx, spec, brand, model, cx, cy, r, indexColor, occ) {
  const logo = spec.logo || {}
  const brandText = logo.brandText != null ? logo.brandText : (brand?.name || '')
  const lines = logo.lines && logo.lines.length ? logo.lines
              : (model?.type ? [String(model.type).toUpperCase()] : [])
  if (!brandText && lines.length === 0) return

  // Candidate anchor bands (y offsets from centre), tried in order. Pick the
  // first band whose text box clears all reserved zones; this lets the logo
  // sit between subdials instead of on top of them.
  const blockH = r * 0.07 * (1 + lines.length * 0.7) + r * 0.12 // emblem + text
  const candidates = [ -r * 0.34, -r * 0.50, r * 0.30, -r * 0.20 ]
  let baseY = candidates[0]
  for (const cand of candidates) {
    const testY = cy + cand
    if (!occ || !collides(occ, cx, testY, r * 0.13)) { baseY = testY; break }
    baseY = testY
  }

  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic'

  // place emblem only if there's clearance above the wordmark
  const emblemY = baseY - r * 0.12
  if (logo.emblem !== false && (!occ || !collides(occ, cx, emblemY, r * 0.06))) {
    drawEmblem(ctx, cx, emblemY, r * 0.055, indexColor)
  }

  ctx.fillStyle = indexColor
  ctx.font = `${r * 0.072}px 'Cormorant Garamond', serif`
  ctx.fillText(brandText, cx, baseY)

  ctx.globalAlpha = 0.65
  ctx.font = `${r * 0.038}px 'Josefin Sans', sans-serif`
  lines.forEach((ln, i) => ctx.fillText(ln, cx, baseY + r * 0.065 + i * r * 0.05))
  ctx.globalAlpha = 1
  ctx.restore()
}

// An original, non-trademark emblem: a faceted lozenge. Evokes "fine watch"
// without copying any maison's mark.
function drawEmblem(ctx, x, y, s, color) {
  ctx.save(); ctx.translate(x, y)
  const g = ctx.createLinearGradient(-s, 0, s, 0)
  g.addColorStop(0, lighten(color, 30)); g.addColorStop(0.5, color); g.addColorStop(1, darken(color, 30))
  ctx.fillStyle = g
  ctx.beginPath()
  ctx.moveTo(0, -s); ctx.lineTo(s * 0.6, 0); ctx.lineTo(0, s); ctx.lineTo(-s * 0.6, 0); ctx.closePath()
  ctx.fill()
  ctx.strokeStyle = darken(color, 20); ctx.lineWidth = 0.5; ctx.stroke()
  ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(0, s); ctx.moveTo(-s*0.6,0); ctx.lineTo(s*0.6,0); ctx.stroke()
  ctx.restore()
}

// ─── SCALES / REHAUT ─────────────────────────────────────────────────────────
// Printed scale around the dial edge (rehaut). kind: 'tachymeter'|'pulsometer'|
// 'minute'|'none'. Tachymeter numbers are abstracted but plausibly placed.
export function drawScale(ctx, spec, cx, cy, r, indexColor) {
  const track = spec.track || {}
  const kind = track.kind || 'none'
  if (kind === 'none') return
  const rr = r * 0.78 // rehaut radius (just inside the indices)

  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = indexColor

  if (kind === 'tachymeter') {
    const marks = [60, 70, 80, 90, 100, 120, 150, 200, 300, 400]
    const angForUPH = uph => (60 / uph) * Math.PI * 2 - Math.PI / 2 // 60s reference
    ctx.font = `${r * 0.045}px 'Josefin Sans', sans-serif`
    for (const v of marks) {
      const a = angForUPH(v)
      const tx = cx + Math.cos(a) * rr, ty = cy + Math.sin(a) * rr
      ctx.save(); ctx.translate(tx, ty); ctx.rotate(a + Math.PI / 2)
      ctx.fillText(String(v), 0, 0); ctx.restore()
    }
  } else if (kind === 'minute') {
    ctx.strokeStyle = indexColor; ctx.lineWidth = 0.7
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2 - Math.PI / 2
      const big = i % 5 === 0, l = big ? r * 0.03 : r * 0.015
      ctx.beginPath()
      ctx.moveTo(cx + Math.cos(a) * (rr + r*0.03), cy + Math.sin(a) * (rr + r*0.03))
      ctx.lineTo(cx + Math.cos(a) * (rr + r*0.03 - l), cy + Math.sin(a) * (rr + r*0.03 - l))
      ctx.stroke()
    }
  } else if (kind === 'pulsometer') {
    ctx.font = `${r * 0.04}px 'Josefin Sans', sans-serif`
    for (const v of [40, 60, 80, 100, 120]) {
      const a = ((v - 40) / 100) * Math.PI * 1.4 - Math.PI / 2
      const tx = cx + Math.cos(a) * rr, ty = cy + Math.sin(a) * rr
      ctx.fillText(String(v), tx, ty)
    }
  }
  ctx.restore()
}

// ─── APERTURES (date / day-date) ─────────────────────────────────────────────
// Positioned per spec.complicationsLayout.aperturePos (o'clock 1..12).
// Returns the reserved zone so callers can register it for collision.
export function drawAperture(ctx, spec, cx, cy, r, caseColor) {
  const cl = spec.complicationsLayout || {}
  if (cl.aperture !== 'date' && cl.aperture !== 'day-date') return null
  const pos = cl.aperturePos || 3
  const a = (pos / 12) * Math.PI * 2 - Math.PI / 2
  const dist = r * 0.5
  const ax = cx + Math.cos(a) * dist, ay = cy + Math.sin(a) * dist
  const isDayDate = cl.aperture === 'day-date'
  const dw = r * (isDayDate ? 0.16 : 0.085), dh = r * 0.062

  ctx.save()
  ctx.fillStyle = cl.apertureBg || '#f0ede8'
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(ax - dw/2, ay - dh/2, dw, dh, 2); ctx.fill() }
  else ctx.fillRect(ax - dw/2, ay - dh/2, dw, dh)
  ctx.strokeStyle = darken(caseColor, 10); ctx.lineWidth = 0.6
  if (ctx.roundRect) { ctx.beginPath(); ctx.roundRect(ax - dw/2, ay - dh/2, dw, dh, 2); ctx.stroke() }
  else ctx.strokeRect(ax - dw/2, ay - dh/2, dw, dh)

  ctx.fillStyle = '#111'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'
  ctx.font = `bold ${r * 0.055}px 'Josefin Sans', sans-serif`
  const day = new Date().getDate()
  if (isDayDate) {
    ctx.fillText('WED', ax - dw * 0.26, ay)
    ctx.fillText(String(day), ax + dw * 0.30, ay)
  } else {
    ctx.fillText(String(day), ax, ay)
  }
  ctx.restore()
  return { x: ax, y: ay, r: Math.max(dw, dh) / 2 }
}
