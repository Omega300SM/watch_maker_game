// ════════════════════════════════════════════════════════════════════════════
//  HOROLOGY — FLEXIBLE SUBDIAL SYSTEM (Phase B)
//  Replaces the legacy hard-coded 3-at-3/6/9 registers with a loop over
//  spec.subdials[]. Each entry:
//    { posAngle:deg (0 = up/12 o'clock, clockwise), radius:0..0.5 of dial r,
//      ring:bool, hand:bool, scale:'tachymeter'|'minute'|'hour'|null,
//      handAngle:deg (static pose), color?:hex }
//
//  PARITY: legacy renderer drew NO subdials, and the default spec has
//  subdials:[]. So this loop is a no-op for unauthored models — zero drift.
// ════════════════════════════════════════════════════════════════════════════

import { lighten, darken } from './colour.js'

// cx,cy = dial centre; r = full watch radius (subdial radius is relative to it)
export function drawSubdials(ctx, spec, cx, cy, r, baseColor, indexColor) {
  const list = spec?.subdials
  if (!Array.isArray(list) || list.length === 0) return []
  const zones = []

  for (const sd of list) {
    const ang = ((sd.posAngle || 0) - 90) * Math.PI / 180 // 0deg = up
    const dist = (sd.dist != null ? sd.dist : 0.42) * r    // centre offset from dial centre
    const sr = (sd.radius || 0.16) * r                     // subdial radius
    const scx = cx + Math.cos(ang) * dist
    const scy = cy + Math.sin(ang) * dist
    zones.push({ x: scx, y: scy, r: sr })
    const face = sd.color || darken(baseColor === 'transparent' ? '#111118' : baseColor, 12)

    // recessed well
    const g = ctx.createRadialGradient(scx-sr*0.3, scy-sr*0.3, 0, scx, scy, sr)
    g.addColorStop(0, lighten(face, 10)); g.addColorStop(1, darken(face, 8))
    ctx.fillStyle = g
    ctx.beginPath(); ctx.arc(scx, scy, sr, 0, Math.PI*2); ctx.fill()

    if (sd.ring !== false) {
      ctx.strokeStyle = darken(face, 18); ctx.lineWidth = Math.max(0.8, sr*0.06)
      ctx.beginPath(); ctx.arc(scx, scy, sr, 0, Math.PI*2); ctx.stroke()
    }

    // tick scale
    const ticks = sd.scale === 'tachymeter' ? 12 : (sd.scale === 'hour' ? 12 : 20)
    if (sd.scale) {
      ctx.strokeStyle = indexColor; ctx.lineWidth = 0.8
      for (let i = 0; i < ticks; i++) {
        const a = (i / ticks) * Math.PI * 2 - Math.PI/2
        const big = i % (ticks/4 < 1 ? 1 : Math.round(ticks/4)) === 0
        const l = big ? sr*0.22 : sr*0.12
        ctx.beginPath()
        ctx.moveTo(scx + Math.cos(a)*sr*0.9, scy + Math.sin(a)*sr*0.9)
        ctx.lineTo(scx + Math.cos(a)*(sr*0.9 - l), scy + Math.sin(a)*(sr*0.9 - l))
        ctx.stroke()
      }
    }

    // register hand (static pose for a still image)
    if (sd.hand !== false) {
      const ha = ((sd.handAngle || 30) - 90) * Math.PI / 180
      ctx.strokeStyle = sd.handColor || indexColor; ctx.lineWidth = Math.max(1, sr*0.07); ctx.lineCap = 'round'
      ctx.beginPath(); ctx.moveTo(scx, scy)
      ctx.lineTo(scx + Math.cos(ha)*sr*0.7, scy + Math.sin(ha)*sr*0.7); ctx.stroke()
      ctx.fillStyle = sd.handColor || indexColor
      ctx.beginPath(); ctx.arc(scx, scy, sr*0.08, 0, Math.PI*2); ctx.fill()
    }
  }
  return zones
}
