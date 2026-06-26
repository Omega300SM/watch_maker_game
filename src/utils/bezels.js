// ════════════════════════════════════════════════════════════════════════════
//  HOROLOGY — BEZEL VARIANTS (Phase C)
//  Geometry driven by spec.bezelSpec.kind. PARITY: non-bespoke specs render the
//  exact legacy bezel (gradient ring + 60 ticks + gold pip).
// ════════════════════════════════════════════════════════════════════════════

import { lighten, darken } from './colour.js'

export function drawBezelVariant(ctx, spec, cx, cy, r, bc, ic) {
  // ring base (shared)
  const bg = ctx.createLinearGradient(cx-r, cy, cx+r, cy)
  bg.addColorStop(0, darken(bc,20)); bg.addColorStop(0.5, lighten(bc,30)); bg.addColorStop(1, darken(bc,20))
  ctx.fillStyle = bg; ctx.beginPath(); ctx.arc(cx, cy, r*0.97, 0, Math.PI*2); ctx.fill()

  const kind = spec?.bespoke ? (spec.bezelSpec?.kind || 'minute') : 'legacy'

  if (kind === 'legacy' || kind === 'minute') return legacy(ctx, cx, cy, r, ic)
  switch (kind) {
    case 'tachymeter': return tachymeter(ctx, cx, cy, r, ic)
    case 'dive60':     return dive60(ctx, cx, cy, r, ic, bc)
    case 'gmt':        return gmt(ctx, cx, cy, r, ic, spec.bezelSpec)
    case 'fluted':     return fluted(ctx, cx, cy, r, bc)
    case 'smooth':     return smooth(ctx, cx, cy, r, bc)
    default:           return legacy(ctx, cx, cy, r, ic)
  }
}

// Legacy-exact (do not alter — snapshot parity depends on this)
function legacy(ctx, cx, cy, r, ic) {
  ctx.strokeStyle = ic; ctx.lineWidth = 1
  for (let i=0;i<60;i++){
    const a=(i/60)*Math.PI*2-Math.PI/2, len=i%5===0?r*0.05:r*0.025
    ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r*0.92, cy+Math.sin(a)*r*0.92)
    ctx.lineTo(cx+Math.cos(a)*(r*0.92-len), cy+Math.sin(a)*(r*0.92-len)); ctx.stroke()
  }
  ctx.fillStyle='#FFD700'; ctx.beginPath()
  ctx.moveTo(cx,cy-r*0.89); ctx.lineTo(cx-4,cy-r*0.94); ctx.lineTo(cx+4,cy-r*0.94); ctx.closePath(); ctx.fill()
}

function tachymeter(ctx, cx, cy, r, ic) {
  ctx.fillStyle = ic; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font = `${r*0.05}px 'Josefin Sans',sans-serif`
  for (const v of [60,70,80,90,100,120,150,200,300,400]) {
    const a = (60/v)*Math.PI*2 - Math.PI/2
    const tx = cx+Math.cos(a)*r*0.93, ty = cy+Math.sin(a)*r*0.93
    ctx.save(); ctx.translate(tx,ty); ctx.rotate(a+Math.PI/2); ctx.fillText(String(v),0,0); ctx.restore()
  }
}

function dive60(ctx, cx, cy, r, ic, bc) {
  // graduated 0–60 with a lume pip at 12
  ctx.strokeStyle = ic; ctx.lineWidth = 1.2
  for (let i=0;i<60;i++){
    const a=(i/60)*Math.PI*2-Math.PI/2, big=i%5===0, len=big?r*0.055:r*0.028
    ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r*0.93, cy+Math.sin(a)*r*0.93)
    ctx.lineTo(cx+Math.cos(a)*(r*0.93-len), cy+Math.sin(a)*(r*0.93-len)); ctx.stroke()
  }
  ctx.fillStyle = ic; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=`${r*0.05}px 'Josefin Sans',sans-serif`
  for (const v of [10,20,30,40,50]) {
    const a=(v/60)*Math.PI*2-Math.PI/2
    ctx.save(); ctx.translate(cx+Math.cos(a)*r*0.86, cy+Math.sin(a)*r*0.86); ctx.rotate(a+Math.PI/2); ctx.fillText(String(v),0,0); ctx.restore()
  }
  // lume pip at 12
  ctx.fillStyle='rgba(200,255,200,0.85)'; ctx.beginPath(); ctx.arc(cx, cy-r*0.9, r*0.022, 0, Math.PI*2); ctx.fill()
}

function gmt(ctx, cx, cy, r, ic, spec) {
  // two-tone 24h ring
  const day = spec?.gmtDay || '#1a3a6a', night = spec?.gmtNight || '#101018'
  for (let i=0;i<24;i++){
    const a0=(i/24)*Math.PI*2-Math.PI/2, a1=((i+1)/24)*Math.PI*2-Math.PI/2
    ctx.beginPath(); ctx.arc(cx,cy,r*0.96,a0,a1); ctx.arc(cx,cy,r*0.87,a1,a0,true); ctx.closePath()
    ctx.fillStyle = i>=6 && i<18 ? day : night; ctx.fill()
  }
  ctx.fillStyle = ic; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.font=`${r*0.045}px 'Josefin Sans',sans-serif`
  for (const v of [6,12,18,24]) {
    const a=(v/24)*Math.PI*2-Math.PI/2
    ctx.save(); ctx.translate(cx+Math.cos(a)*r*0.915, cy+Math.sin(a)*r*0.915); ctx.rotate(a+Math.PI/2); ctx.fillText(String(v),0,0); ctx.restore()
  }
}

function fluted(ctx, cx, cy, r, bc) {
  // radial flutes (Datejust-style) — abstracted
  for (let i=0;i<60;i++){
    const a=(i/60)*Math.PI*2
    ctx.fillStyle = i%2 ? lighten(bc,35) : darken(bc,15)
    ctx.beginPath()
    ctx.moveTo(cx+Math.cos(a)*r*0.97, cy+Math.sin(a)*r*0.97)
    ctx.lineTo(cx+Math.cos(a+0.05)*r*0.97, cy+Math.sin(a+0.05)*r*0.97)
    ctx.lineTo(cx+Math.cos(a+0.05)*r*0.86, cy+Math.sin(a+0.05)*r*0.86)
    ctx.lineTo(cx+Math.cos(a)*r*0.86, cy+Math.sin(a)*r*0.86)
    ctx.closePath(); ctx.fill()
  }
}

function smooth(ctx, cx, cy, r, bc) {
  // polished plain ring with a soft inner highlight
  ctx.strokeStyle = lighten(bc, 40); ctx.lineWidth = r*0.012
  ctx.beginPath(); ctx.arc(cx, cy, r*0.9, 0, Math.PI*2); ctx.stroke()
}
