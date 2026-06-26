// ════════════════════════════════════════════════════════════════════════════
//  HOROLOGY — BESPOKE DIAL SPEC SYSTEM
//  Phase A: declarative, renderer-agnostic dial definitions.
//
//  Design principle (from the Bespoke plan §3): the renderer reads a spec and
//  assembles primitives; it must NEVER branch on a model id. Authoring a new
//  dial is a data task, not a code task.
//
//  IP note (product decision: "stylise/abstract — evoke, don't copy"): any
//  brandText / logo authored here is an abstracted, original mark — it evokes a
//  category (diver, chronograph, integrated-sports) without reproducing real
//  trade dress. Unauthored models fall back to a spec DERIVED from the legacy
//  renderer so Phase A is pixel-parity with the pre-spec build.
// ════════════════════════════════════════════════════════════════════════════

// ─── ENUMS (single source of truth; validator + tests consume these) ─────────
export const FINISHES   = ['sunburst', 'opaline', 'matte', 'fume', 'guilloche', 'lacquer', 'skeleton']
export const MARKER_STYLES = ['applied', 'printed', 'numeral', 'baton']
export const NUMERAL_SETS  = ['none', 'arabic', 'roman', 'mixed']
export const HANDSETS   = ['dauphine', 'mercedes', 'sword', 'alpha', 'baton', 'snowflake', 'breguet']
export const BEZEL_KINDS = ['tachymeter', 'dive60', 'gmt', 'fluted', 'smooth', 'minute']
export const APERTURE_KINDS = ['date', 'day-date', 'none']
export const TRACK_KINDS = ['minute', 'tachymeter', 'pulsometer', 'none']

// ─── LEGACY COLOUR BUCKETS (mirror of renderer.js, kept here for derivation) ──
// These let an unauthored model resolve to a spec that reproduces today's pixels.
const LEGACY_DIAL = { Black:'#111118', Blue:'#0a1a3a', Silver:'#d0d0d8', White:'#f0ede8',
  Champagne:'#c8b880', Green:'#0a2010', Grey:'#404048', Skeleton:'transparent' }
const LEGACY_BEZEL = { Black:'#1a1a1a', Blue:'#1a2a4a', Silver:'#2a2a2a', White:'#2a2a2a',
  Champagne:'#2a2a2a', Green:'#0a2010', Grey:'#2a2a2a', Skeleton:'#1a1a1a' }

// ─── REQUIRED FIELDS (validator contract) ────────────────────────────────────
export const REQUIRED_FIELDS = ['finish', 'baseColor', 'markers', 'numerals', 'subdials', 'handset', 'bezelSpec']

// ─── DEFAULT SPEC ────────────────────────────────────────────────────────────
// A complete, valid spec describing the LEGACY look. Authored specs override
// only the fields they care about; everything else inherits this.
export function defaultDialSpec(brand, model) {
  const dialName = model?.dial || 'Black'
  const base = LEGACY_DIAL[dialName] ?? '#111118'
  const isSkeleton = dialName === 'Skeleton'
  const comp = model?.complication || ''
  return {
    bespoke: false,                       // false = derived/legacy, true = authored
    finish: isSkeleton ? 'skeleton' : 'sunburst',
    baseColor: isSkeleton ? '#111118' : base,
    accentColor: null,                    // null → renderer derives from baseColor
    markers: { style: 'baton', shape: 'rect', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] },
    subdials: [],                         // legacy renderer drew no subdials
    complicationsLayout: {
      aperture: comp.includes('Date') ? 'date' : 'none',
      aperturePos: 3,                     // o'clock position (legacy: 3 o'clock)
    },
    track: { kind: 'minute' },
    logo: {
      brandText: brand?.name || '',       // legacy printed brand.name at 12
      lines: model?.type ? [String(model.type).toUpperCase()] : [],
      position: 12,
    },
    handset: 'dauphine',                  // legacy hand shape
    bezelSpec: { kind: 'minute', insert: LEGACY_BEZEL[dialName] ?? '#2a2a2a' },
  }
}

// ─── AUTHORED SPECS ──────────────────────────────────────────────────────────
// Phase D: hero references authored as STYLISED HOUSE EQUIVALENTS. Each targets
// the recognizable category silhouette (subdial layout, handset, bezel, finish)
// — not protected trade dress. Keyed by model.id. Unlisted models fall back to
// the legacy-derived default (pixel-parity).
export const DIAL_SPECS = {

  // ── Tool diver: matte black, applied lume, dive bezel, date at 3 ──
  submariner: {
    finish: 'matte', baseColor: '#0b0b0f', accentColor: '#e8e8e8',
    markers: { style: 'applied', shape: 'mixed', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] },
    subdials: [],
    handset: 'snowflake', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 3, apertureBg: '#101010' },
    track: { kind: 'minute' },
    bezelSpec: { kind: 'dive60', insert: '#0a1626' },
    logo: { brandText: 'ROLEX', lines: ['SUBMARINER', '300m = 1000ft'], emblem: true },
  },

  // ── Racing chronograph: 3 registers at 3/6/9, tachymeter bezel, no date ──
  daytona: {
    finish: 'sunburst', baseColor: '#0c0c0c', accentColor: '#d8d8d8',
    markers: { style: 'applied', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] },
    subdials: [
      { posAngle: 90,  dist: 0.40, radius: 0.135, ring: true, scale: 'minute', handAngle: 200, color: '#cfccc0', handColor: '#1a1a1a' },
      { posAngle: 180, dist: 0.40, radius: 0.135, ring: true, scale: 'hour',   handAngle: 150, color: '#cfccc0', handColor: '#1a1a1a' },
      { posAngle: 0,   dist: 0.40, radius: 0.135, ring: true, scale: 'minute', handAngle: 40,  color: '#cfccc0', handColor: '#1a1a1a' },
    ],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'none' },
    track: { kind: 'none' },
    bezelSpec: { kind: 'tachymeter', insert: '#101010' },
    logo: { brandText: 'ROLEX', lines: ['COSMOGRAPH'], emblem: true },
  },

  // ── Moonwatch chronograph: 3 registers, tachymeter bezel, matte ──
  speedmaster: {
    finish: 'matte', baseColor: '#0a0a0c', accentColor: '#e0e0e0',
    markers: { style: 'applied', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] },
    subdials: [
      { posAngle: 270, dist: 0.40, radius: 0.13, ring: true, scale: 'minute', handAngle: 70,  handColor: '#e0e0e0' },
      { posAngle: 0,   dist: 0.40, radius: 0.13, ring: true, scale: 'hour',   handAngle: 220, handColor: '#e0e0e0' },
      { posAngle: 90,  dist: 0.40, radius: 0.13, ring: true, scale: 'minute', handAngle: 130, handColor: '#e0e0e0' },
    ],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'none' },
    track: { kind: 'none' },
    bezelSpec: { kind: 'tachymeter', insert: '#0a0a0a' },
    logo: { brandText: 'OMEGA', lines: ['SPEEDMASTER'], emblem: true },
  },

  // ── Integrated sports (porthole): blue sunburst, applied batons, date 3 ──
  nautilus: {
    finish: 'sunburst', baseColor: '#0d2444', accentColor: '#dfe6ef',
    markers: { style: 'applied', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] },
    subdials: [],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 3, apertureBg: '#0a1a30' },
    track: { kind: 'minute' },
    bezelSpec: { kind: 'smooth', insert: '#0d2444' },
    logo: { brandText: 'PATEK PHILIPPE', lines: ['GENEVE'], emblem: true },
  },

  // ── Integrated sports (octagonal): blue tapisserie≈guilloché, date 3 ──
  royaloak: {
    finish: 'guilloche', baseColor: '#0a2348', accentColor: '#e2e8f1',
    markers: { style: 'applied', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] },
    subdials: [],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 3, apertureBg: '#091c38' },
    track: { kind: 'minute' },
    bezelSpec: { kind: 'fluted', insert: '#1b3b66' },
    logo: { brandText: 'AUDEMARS PIGUET', lines: [], emblem: true },
  },

  // ── Grand complication: openworked skeleton, roman, small seconds + moon ──
  grandcomp: {
    finish: 'skeleton', baseColor: '#15151c', accentColor: '#cbb46a',
    markers: { style: 'printed', material: 'gilt', lume: false },
    numerals: { set: 'roman', positions: [12, 3, 9] },
    subdials: [
      { posAngle: 225, dist: 0.36, radius: 0.11, ring: true, scale: 'minute', handAngle: 110, color: '#1c1c24', handColor: '#cbb46a' },
      { posAngle: 135, dist: 0.36, radius: 0.11, ring: true, hand: false,       color: '#10101a' }, // moonphase-ish well
    ],
    handset: 'breguet', secondsHand: 'counterweight',
    complicationsLayout: { aperture: 'none' },
    track: { kind: 'none' },
    bezelSpec: { kind: 'smooth', insert: '#2a2a2a' },
    logo: { brandText: 'PATEK PHILIPPE', lines: ['GRANDE COMPLICATION'], emblem: true },
  },

  // ════ PHASE E — remaining catalogue (stylised archetypes) ════

  // GMT traveller: black sunburst, 24h two-tone bezel, date at 3, mercedes hands
  gmt: {
    finish: 'sunburst', baseColor: '#0b0b0f', accentColor: '#e8e8e8',
    markers: { style: 'applied', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] }, subdials: [],
    handset: 'mercedes', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 3, apertureBg: '#101010' },
    track: { kind: 'minute' },
    bezelSpec: { kind: 'gmt', insert: '#101018', gmtDay: '#b22a3a', gmtNight: '#16335e' },
    logo: { brandText: 'ROLEX', lines: ['GMT-MASTER II'], emblem: true },
  },

  // Datejust dress: silver sunburst, fluted bezel, date at 3, baton hands
  datejust: {
    finish: 'sunburst', baseColor: '#d6d6dc', accentColor: '#3a3a3a',
    markers: { style: 'applied', material: 'metal', lume: false },
    numerals: { set: 'none', positions: [] }, subdials: [],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 3, apertureBg: '#f0ede8' },
    track: { kind: 'minute' },
    bezelSpec: { kind: 'fluted', insert: '#c9c9d2' },
    logo: { brandText: 'ROLEX', lines: ['DATEJUST'], emblem: true },
  },

  // Seamaster diver: blue sunburst, dive60 bezel, date at 3, sword hands
  seamaster: {
    finish: 'sunburst', baseColor: '#0e2a52', accentColor: '#eef2f7',
    markers: { style: 'applied', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] }, subdials: [],
    handset: 'sword', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 3, apertureBg: '#0a1f3e' },
    track: { kind: 'minute' },
    bezelSpec: { kind: 'dive60', insert: '#0c2148' },
    logo: { brandText: 'OMEGA', lines: ['SEAMASTER', '300m'], emblem: true },
  },

  // Constellation dress: silver opaline, smooth bezel, date at 3, baton hands
  constellation: {
    finish: 'opaline', baseColor: '#dadae0', accentColor: '#33332e',
    markers: { style: 'applied', material: 'gilt', lume: false },
    numerals: { set: 'roman', positions: [12, 6] }, subdials: [],
    handset: 'alpha', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 3, apertureBg: '#f0ede8' },
    track: { kind: 'minute' },
    bezelSpec: { kind: 'smooth', insert: '#caa84a' },
    logo: { brandText: 'OMEGA', lines: ['CONSTELLATION'], emblem: true },
  },

  // Calatrava dress: white opaline, smooth bezel, small seconds at 6, breguet
  calatrava: {
    finish: 'opaline', baseColor: '#f2efe8', accentColor: '#2a2a2a',
    markers: { style: 'applied', material: 'gilt', lume: false },
    numerals: { set: 'none', positions: [] },
    subdials: [ { posAngle: 180, dist: 0.40, radius: 0.13, ring: true, scale: 'minute', handAngle: 90, color: '#ece8df', handColor: '#2a2a2a' } ],
    handset: 'breguet', secondsHand: 'counterweight',
    complicationsLayout: { aperture: 'none' }, track: { kind: 'none' },
    bezelSpec: { kind: 'smooth', insert: '#caa84a' },
    logo: { brandText: 'PATEK PHILIPPE', lines: ['CALATRAVA'], emblem: true },
  },

  // Offshore chronograph: bold black, oversized registers, tachymeter bezel
  offshore: {
    finish: 'guilloche', baseColor: '#0c0c10', accentColor: '#e0e0e0',
    markers: { style: 'applied', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] },
    subdials: [
      { posAngle: 90,  dist: 0.40, radius: 0.14, ring: true, scale: 'minute', handAngle: 210, color: '#16161c', handColor: '#e0e0e0' },
      { posAngle: 180, dist: 0.40, radius: 0.14, ring: true, scale: 'hour',   handAngle: 150, color: '#16161c', handColor: '#e0e0e0' },
      { posAngle: 0,   dist: 0.40, radius: 0.14, ring: true, scale: 'minute', handAngle: 50,  color: '#16161c', handColor: '#e0e0e0' },
    ],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 6, apertureBg: '#111' },
    track: { kind: 'none' },
    bezelSpec: { kind: 'tachymeter', insert: '#0a0a0a' },
    logo: { brandText: 'AUDEMARS PIGUET', lines: ['OFFSHORE'], emblem: true },
  },

  // Royal Oak Perpetual: blue tapisserie≈guilloché, 4 calendar registers
  perpetual: {
    finish: 'guilloche', baseColor: '#0a2348', accentColor: '#e2e8f1',
    markers: { style: 'applied', material: 'metal', lume: false },
    numerals: { set: 'none', positions: [] },
    subdials: [
      { posAngle: 270, dist: 0.40, radius: 0.12, ring: true, scale: 'minute', handAngle: 80,  color: '#0c2a52', handColor: '#e2e8f1' },
      { posAngle: 0,   dist: 0.40, radius: 0.12, ring: true, scale: 'hour',   handAngle: 200, color: '#0c2a52', handColor: '#e2e8f1' },
      { posAngle: 90,  dist: 0.40, radius: 0.12, ring: true, scale: 'minute', handAngle: 300, color: '#0c2a52', handColor: '#e2e8f1' },
      { posAngle: 180, dist: 0.40, radius: 0.12, ring: true, hand: false,                      color: '#0a1f3e' }, // moonphase
    ],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'none' }, track: { kind: 'none' },
    bezelSpec: { kind: 'fluted', insert: '#1b3b66' },
    logo: { brandText: 'AUDEMARS PIGUET', lines: ['PERPETUAL'], emblem: true },
  },

  // Navitimer pilot chrono: black, slide-rule rehaut feel, 3 registers
  navitimer: {
    finish: 'sunburst', baseColor: '#0a0a0c', accentColor: '#e8e8e8',
    markers: { style: 'printed', material: 'metal', lume: true },
    numerals: { set: 'arabic', positions: [12, 3, 6, 9] },
    subdials: [
      { posAngle: 270, dist: 0.40, radius: 0.13, ring: true, scale: 'minute', handAngle: 60,  handColor: '#e8e8e8' },
      { posAngle: 0,   dist: 0.40, radius: 0.13, ring: true, scale: 'hour',   handAngle: 210, handColor: '#e8e8e8' },
      { posAngle: 90,  dist: 0.40, radius: 0.13, ring: true, scale: 'minute', handAngle: 150, handColor: '#e8e8e8' },
    ],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'none' },
    track: { kind: 'tachymeter' },
    bezelSpec: { kind: 'minute', insert: '#101014' },
    logo: { brandText: 'BREITLING', lines: ['NAVITIMER'], emblem: true },
  },

  // Superocean diver: blue matte, dive60 bezel, date at 3, baton hands
  superocean: {
    finish: 'matte', baseColor: '#0c2148', accentColor: '#eef2f7',
    markers: { style: 'applied', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] }, subdials: [],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 3, apertureBg: '#0a1c3e' },
    track: { kind: 'minute' },
    bezelSpec: { kind: 'dive60', insert: '#0e2a52' },
    logo: { brandText: 'BREITLING', lines: ['SUPEROCEAN'], emblem: true },
  },

  // Overseas integrated sport: blue sunburst, smooth bezel, date at 3
  overseas: {
    finish: 'sunburst', baseColor: '#0d2848', accentColor: '#dfe6ef',
    markers: { style: 'applied', material: 'metal', lume: true },
    numerals: { set: 'none', positions: [] }, subdials: [],
    handset: 'baton', secondsHand: 'lollipop',
    complicationsLayout: { aperture: 'date', aperturePos: 3, apertureBg: '#0a1f3e' },
    track: { kind: 'minute' },
    bezelSpec: { kind: 'smooth', insert: '#0d2848' },
    logo: { brandText: 'VACHERON CONSTANTIN', lines: ['OVERSEAS'], emblem: true },
  },

  // Traditionnelle dress: white opaline, day-date aperture, small seconds, roman
  traditionnelle: {
    finish: 'opaline', baseColor: '#f3f0e9', accentColor: '#2a2a2a',
    markers: { style: 'applied', material: 'gilt', lume: false },
    numerals: { set: 'roman', positions: [12, 1, 2, 4, 5, 7, 8, 10, 11] },
    subdials: [ { posAngle: 180, dist: 0.38, radius: 0.12, ring: true, scale: 'minute', handAngle: 90, color: '#ece8df', handColor: '#2a2a2a' } ],
    handset: 'breguet', secondsHand: 'counterweight',
    complicationsLayout: { aperture: 'day-date', aperturePos: 12, apertureBg: '#f0ede8' },
    track: { kind: 'none' },
    bezelSpec: { kind: 'smooth', insert: '#caa84a' },
    logo: { brandText: 'VACHERON CONSTANTIN', lines: ['TRADITIONNELLE'], emblem: true },
  },

  // Célestia astronomical: openworked skeleton, multi-register, breguet
  celestia: {
    finish: 'skeleton', baseColor: '#14141c', accentColor: '#c8b070',
    markers: { style: 'printed', material: 'gilt', lume: false },
    numerals: { set: 'roman', positions: [12, 3, 6, 9] },
    subdials: [
      { posAngle: 225, dist: 0.34, radius: 0.10, ring: true, scale: 'minute', handAngle: 120, color: '#1c1c24', handColor: '#c8b070' },
      { posAngle: 135, dist: 0.34, radius: 0.10, ring: true, hand: false,                      color: '#10101a' },
      { posAngle: 270, dist: 0.30, radius: 0.09, ring: true, scale: 'hour',   handAngle: 40,  color: '#1c1c24', handColor: '#c8b070' },
    ],
    handset: 'breguet', secondsHand: 'counterweight',
    complicationsLayout: { aperture: 'none' }, track: { kind: 'none' },
    bezelSpec: { kind: 'smooth', insert: '#2a2a2a' },
    logo: { brandText: 'VACHERON CONSTANTIN', lines: ['CÉLESTIA'], emblem: true },
  },
}

// ─── RESOLVER ────────────────────────────────────────────────────────────────
// Deep-merges an authored spec (if any) over the derived default. Never throws;
// always returns a complete spec.
export function resolveDialSpec(brand, model) {
  const dflt = defaultDialSpec(brand, model)
  const authored = model?.id ? DIAL_SPECS[model.id] : null
  if (!authored) return dflt
  return mergeSpec(dflt, authored)
}

function mergeSpec(base, over) {
  const out = { ...base, bespoke: true }
  for (const k of Object.keys(over)) {
    const v = over[k]
    if (Array.isArray(v)) out[k] = v.slice()
    else if (v && typeof v === 'object') out[k] = { ...(base[k] || {}), ...v }
    else out[k] = v
  }
  return out
}

// ─── VALIDATOR ───────────────────────────────────────────────────────────────
// Returns { valid:boolean, errors:string[] }. Used by tests (spec-validity
// contract) and can gate authoring in dev.
const HEX_RE = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/

export function validateDialSpec(spec, label = 'spec') {
  const errors = []
  const err = m => errors.push(`${label}: ${m}`)
  if (!spec || typeof spec !== 'object') { err('not an object'); return { valid:false, errors } }

  for (const f of REQUIRED_FIELDS) {
    if (spec[f] === undefined || spec[f] === null) err(`missing required field "${f}"`)
  }
  if (spec.finish && !FINISHES.includes(spec.finish)) err(`finish "${spec.finish}" not in enum`)
  if (spec.baseColor && !HEX_RE.test(spec.baseColor)) err(`baseColor "${spec.baseColor}" not a hex colour`)
  if (spec.accentColor && spec.accentColor !== null && !HEX_RE.test(spec.accentColor)) err(`accentColor "${spec.accentColor}" not a hex colour`)

  if (spec.markers) {
    if (!MARKER_STYLES.includes(spec.markers.style)) err(`markers.style "${spec.markers.style}" not in enum`)
    if (typeof spec.markers.lume !== 'boolean') err('markers.lume must be boolean')
  }
  if (spec.numerals) {
    if (!NUMERAL_SETS.includes(spec.numerals.set)) err(`numerals.set "${spec.numerals.set}" not in enum`)
    if (!Array.isArray(spec.numerals.positions)) err('numerals.positions must be an array')
    else for (const p of spec.numerals.positions) {
      if (!Number.isInteger(p) || p < 1 || p > 12) err(`numerals.positions has invalid hour "${p}"`)
    }
  }
  if (spec.handset && !HANDSETS.includes(spec.handset)) err(`handset "${spec.handset}" not in enum`)

  if (!Array.isArray(spec.subdials)) err('subdials must be an array')
  else spec.subdials.forEach((sd, i) => {
    if (typeof sd.posAngle !== 'number') err(`subdials[${i}].posAngle must be a number (degrees)`) 
    if (typeof sd.radius !== 'number' || sd.radius <= 0 || sd.radius > 0.5) err(`subdials[${i}].radius must be 0..0.5 of dial radius`)
  })

  if (spec.bezelSpec) {
    if (!BEZEL_KINDS.includes(spec.bezelSpec.kind)) err(`bezelSpec.kind "${spec.bezelSpec.kind}" not in enum`)
    if (spec.bezelSpec.insert && !HEX_RE.test(spec.bezelSpec.insert)) err(`bezelSpec.insert "${spec.bezelSpec.insert}" not a hex colour`)
  }
  if (spec.complicationsLayout && spec.complicationsLayout.aperture &&
      !APERTURE_KINDS.includes(spec.complicationsLayout.aperture)) {
    err(`complicationsLayout.aperture "${spec.complicationsLayout.aperture}" not in enum`)
  }
  if (spec.track && spec.track.kind && !TRACK_KINDS.includes(spec.track.kind)) {
    err(`track.kind "${spec.track.kind}" not in enum`)
  }
  return { valid: errors.length === 0, errors }
}
