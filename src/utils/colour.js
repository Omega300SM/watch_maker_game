// ─── COLOUR HELPERS (shared) ─────────────────────────────────────────────────
export function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('')
  const n = parseInt(hex, 16)
  return [(n>>16)&255, (n>>8)&255, n&255]
}
export function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')
}
export function lighten(hex, a) { const [r,g,b]=hexToRgb(hex); return rgbToHex(r+a,g+a,b+a) }
export function darken(hex, a)  { return lighten(hex, -a) }
