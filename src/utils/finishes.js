// ════════════════════════════════════════════════════════════════════════════
//  HOROLOGY — DIAL FINISHES (Phase B)
//  Fills the dial face per spec.finish. Draws into ctx with the dial already
//  established as a clip-free circle at (cx,cy,radius=rd).
//
//  PARITY RULE: when spec.bespoke === false, every finish reproduces the legacy
//  radial gradient exactly (offset highlight at -0.2,-0.2; lighten(base,15)→base)
//  so unauthored models do not drift. Rich procedural textures only render for
//  authored (bespoke) specs.
// ════════════════════════════════════════════════════════════════════════════

import { lighten, darken } from './colour.js'

// cx,cy = dial centre; rd = dial radius (0.82*r in the main renderer)
export function applyFinish(ctx, spec, cx, cy, rd, baseColor) {
  const base = baseColor && baseColor !== 'transparent' ? baseColor : '#111118'

  // Legacy path (parity) — used for all non-bespoke dials regardless of finish.
  if (!spec || !spec.bespoke) {
    legacyRadial(ctx, cx, cy, rd, base)
    return
  }

  switch (spec.finish) {
    case 'sunburst':  return sunburst(ctx, cx, cy, rd, base, spec.accentColor)
    case 'opaline':   return opaline(ctx, cx, cy, rd, base)
    case 'fume':      return fume(ctx, cx, cy, rd, base)
    case 'guilloche': return guilloche(ctx, cx, cy, rd, base, spec.accentColor)
    case 'matte':     return matte(ctx, cx, cy, rd, base)
    case 'lacquer':   return lacquer(ctx, cx, cy, rd, base)
    default:          return legacyRadial(ctx, cx, cy, rd, base)
  }
}

function fillCircle(ctx, cx, cy, rd) {
  ctx.beginPath(); ctx.arc(cx, cy, rd, 0, Math.PI*2); ctx.fill()
}

// ─── LEGACY (exact reproduction of the original dial gradient) ───────────────
function legacyRadial(ctx, cx, cy, rd, base) {
  const dg = ctx.createRadialGradient(cx-rd*0.244, cy-rd*0.244, 0, cx, cy, rd)
  // NOTE: original used r*0.2 offset where rd=r*0.82 → 0.2/0.82 = 0.2439 of rd
  dg.addColorStop(0, lighten(base, 15)); dg.addColorStop(1, base)
  ctx.fillStyle = dg; fillCircle(ctx, cx, cy, rd)
}

// ─── SUNBURST (radial brushed rays from centre) ──────────────────────────────
function sunburst(ctx, cx, cy, rd, base, accent) {
  // base wash
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, rd)
  g.addColorStop(0, lighten(base, 22)); g.addColorStop(0.7, base); g.addColorStop(1, darken(base, 14))
  ctx.fillStyle = g; fillCircle(ctx, cx, cy, rd)
  // brushed rays
  ctx.save()
  ctx.beginPath(); ctx.arc(cx, cy, rd, 0, Math.PI*2); ctx.clip()
  ctx.translate(cx, cy)
  const rays = 220
  for (let i = 0; i < rays; i++) {
    const a = (i / rays) * Math.PI * 2
    ctx.strokeStyle = i % 2 ? `rgba(255,255,255,0.05)` : `rgba(0,0,0,0.06)`
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a)*rd, Math.sin(a)*rd); ctx.stroke()
  }
  ctx.restore()
  // subtle off-centre highlight for legibility
  const h = ctx.createRadialGradient(cx-rd*0.3, cy-rd*0.3, 0, cx, cy, rd)
  h.addColorStop(0, 'rgba(255,255,255,0.10)'); h.addColorStop(0.5, 'rgba(255,255,255,0)')
  ctx.fillStyle = h; fillCircle(ctx, cx, cy, rd)
}

// ─── OPALINE (fine matte grain, even tone) ───────────────────────────────────
function opaline(ctx, cx, cy, rd, base) {
  const g = ctx.createRadialGradient(cx-rd*0.15, cy-rd*0.15, rd*0.1, cx, cy, rd)
  g.addColorStop(0, lighten(base, 12)); g.addColorStop(1, darken(base, 4))
  ctx.fillStyle = g; fillCircle(ctx, cx, cy, rd)
  // concentric micro-rings for the grained opaline look
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rd, 0, Math.PI*2); ctx.clip()
  ctx.strokeStyle = 'rgba(255,255,255,0.025)'; ctx.lineWidth = 1
  for (let rr = rd*0.06; rr < rd; rr += rd*0.045) {
    ctx.beginPath(); ctx.arc(cx, cy, rr, 0, Math.PI*2); ctx.stroke()
  }
  ctx.restore()
}

// ─── FUMÉ / SMOKED (bright centre fading to dark rim) ────────────────────────
function fume(ctx, cx, cy, rd, base) {
  const g = ctx.createRadialGradient(cx, cy, rd*0.05, cx, cy, rd)
  g.addColorStop(0, lighten(base, 40)); g.addColorStop(0.55, base); g.addColorStop(1, darken(base, 45))
  ctx.fillStyle = g; fillCircle(ctx, cx, cy, rd)
}

// ─── GUILLOCHÉ (engine-turned cross-hatch) ───────────────────────────────────
function guilloche(ctx, cx, cy, rd, base, accent) {
  ctx.fillStyle = base; fillCircle(ctx, cx, cy, rd)
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rd, 0, Math.PI*2); ctx.clip()
  ctx.translate(cx, cy)
  // two interleaved spiral families approximate engine-turning
  ctx.lineWidth = 0.6
  for (let dir of [1, -1]) {
    ctx.strokeStyle = dir > 0 ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.07)'
    for (let k = 0; k < 60; k++) {
      ctx.beginPath()
      for (let a = 0; a <= Math.PI*2; a += 0.1) {
        const rr = (k/60)*rd + Math.sin(a*12)*rd*0.012*dir
        const x = Math.cos(a+dir*k*0.04)*rr, y = Math.sin(a+dir*k*0.04)*rr
        a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)
      }
      ctx.stroke()
    }
  }
  ctx.restore()
}

// ─── MATTE (flat, slight vignette) ───────────────────────────────────────────
function matte(ctx, cx, cy, rd, base) {
  ctx.fillStyle = base; fillCircle(ctx, cx, cy, rd)
  const g = ctx.createRadialGradient(cx, cy, rd*0.4, cx, cy, rd)
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(0,0,0,0.18)')
  ctx.fillStyle = g; fillCircle(ctx, cx, cy, rd)
}

// ─── LACQUER (glossy, strong specular) ───────────────────────────────────────
function lacquer(ctx, cx, cy, rd, base) {
  const g = ctx.createRadialGradient(cx-rd*0.25, cy-rd*0.25, 0, cx, cy, rd)
  g.addColorStop(0, lighten(base, 30)); g.addColorStop(0.6, base); g.addColorStop(1, darken(base, 10))
  ctx.fillStyle = g; fillCircle(ctx, cx, cy, rd)
  // hard specular streak
  ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, rd, 0, Math.PI*2); ctx.clip()
  const s = ctx.createLinearGradient(cx-rd, cy-rd, cx, cy)
  s.addColorStop(0, 'rgba(255,255,255,0.18)'); s.addColorStop(0.3, 'rgba(255,255,255,0)')
  ctx.fillStyle = s; fillCircle(ctx, cx, cy, rd)
  ctx.restore()
}
