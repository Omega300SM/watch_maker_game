// ─── BRANDS ──────────────────────────────────────────────────────────────────
export const BRANDS = [
  {
    id: 'rolex', name: 'ROLEX', founded: 1905, origin: 'Geneva, Switzerland',
    tagline: 'A Crown for Every Achievement',
    color: '#006039', accent: '#C8A020', logo: '♛',
    description: 'The world\'s most recognised watch brand. Rolex pioneered the waterproof Oyster case and the self-winding Perpetual rotor — each decades ahead of competitors.',
    assemblyStyle: 'precise',
    assemblyNote: 'Rolex movements use the proprietary Chronergy escapement delivering 15% greater efficiency. Pallet fork jewels must be seated to ±0.002mm tolerances.',
    models: [
      { id: 'submariner', name: 'Submariner Date', ref: '126610LN', year: 2020, movement: 'Cal. 3235', caseDiam: 41, waterResist: 300, complication: 'Date, Helium Escape Valve', material: 'Stainless Steel', dial: 'Black', type: 'Dive' },
      { id: 'daytona', name: 'Cosmograph Daytona', ref: '116500LN', year: 2016, movement: 'Cal. 4130', caseDiam: 40, waterResist: 100, complication: 'Chronograph', material: 'Stainless Steel', dial: 'Black', type: 'Chronograph' },
      { id: 'gmt', name: 'GMT-Master II', ref: '126710BLRO', year: 2018, movement: 'Cal. 3285', caseDiam: 40, waterResist: 100, complication: 'GMT, Date', material: 'Stainless Steel', dial: 'Black', type: 'GMT' },
      { id: 'datejust', name: 'Datejust 41', ref: '126334', year: 2016, movement: 'Cal. 3235', caseDiam: 41, waterResist: 100, complication: 'Date', material: 'Stainless Steel', dial: 'Silver', type: 'Dress' },
    ]
  },
  {
    id: 'omega', name: 'OMEGA', founded: 1848, origin: 'Biel/Bienne, Switzerland',
    tagline: 'The Sign of Excellence',
    color: '#003366', accent: '#C8A020', logo: 'Ω',
    description: 'Official timekeeper of the Olympic Games and the first watch worn on the Moon. The Co-Axial escapement reduces friction and extends service intervals to 8–10 years.',
    assemblyStyle: 'technical',
    assemblyNote: 'The Co-Axial escapement requires a three-point jewel installation. Apply no lubricant to the co-axial wheel — its design eliminates the need for escapement oil.',
    models: [
      { id: 'speedmaster', name: 'Speedmaster Moonwatch', ref: '310.30.42.50.01.001', year: 2021, movement: 'Cal. 3861', caseDiam: 42, waterResist: 50, complication: 'Chronograph', material: 'Stainless Steel', dial: 'Black', type: 'Chronograph' },
      { id: 'seamaster', name: 'Seamaster 300M', ref: '210.30.42.20.01.001', year: 2018, movement: 'Cal. 8800', caseDiam: 42, waterResist: 300, complication: 'Date', material: 'Stainless Steel', dial: 'Blue', type: 'Dive' },
      { id: 'constellation', name: 'Constellation Co-Axial', ref: '123.10.38.21.02.001', year: 2017, movement: 'Cal. 8700', caseDiam: 38, waterResist: 100, complication: 'Date', material: 'Stainless Steel', dial: 'Silver', type: 'Dress' },
    ]
  },
  {
    id: 'patek', name: 'PATEK PHILIPPE', founded: 1839, origin: 'Geneva, Switzerland',
    tagline: 'You Never Actually Own a Patek Philippe',
    color: '#1a1a2e', accent: '#C8A020', logo: 'P',
    description: 'The most prestigious independent watchmaker. Patek Philippe introduced the perpetual calendar wristwatch, the annual calendar, and holds more watchmaking patents than any other manufacture.',
    assemblyStyle: 'extreme',
    assemblyNote: 'Every component must be finished to Côtes de Genève standards before installation. The Patek Philippe Seal is the most demanding in-house quality standard in existence.',
    models: [
      { id: 'nautilus', name: 'Nautilus', ref: '5711/1A-010', year: 2006, movement: 'Cal. 324 S C', caseDiam: 40, waterResist: 120, complication: 'Date', material: 'Stainless Steel', dial: 'Blue', type: 'Sport' },
      { id: 'calatrava', name: 'Calatrava', ref: '6119G', year: 2021, movement: 'Cal. 26-330 S C', caseDiam: 40, waterResist: 30, complication: 'Small Seconds', material: 'Gold', dial: 'White', type: 'Dress' },
      { id: 'grandcomp', name: 'Grand Complications', ref: '5175R', year: 2014, movement: 'Cal. R 27 HU', caseDiam: 47, waterResist: 10, complication: 'Tourbillon, Perpetual Cal., Minute Repeater', material: 'Gold', dial: 'Skeleton', type: 'Grand Complication' },
    ]
  },
  {
    id: 'ap', name: 'AUDEMARS PIGUET', founded: 1875, origin: 'Le Brassus, Switzerland',
    tagline: 'To Break the Rules, You Must First Master Them',
    color: '#1a0a00', accent: '#C8A020', logo: 'AP',
    description: 'Perpetually independent and fiercely original. The Royal Oak — designed by Gérald Genta in 1972 — defined the luxury sports watch category and remains the most imitated silhouette in horology.',
    assemblyStyle: 'artistic',
    assemblyNote: 'AP\'s ultra-thin movements require exceptional care — the 2121 calibre is only 3.05mm thick. Work under maximum magnification with the thinnest tweezers available.',
    models: [
      { id: 'royaloak', name: 'Royal Oak Jumbo', ref: '15202ST', year: 1972, movement: 'Cal. 2121', caseDiam: 39, waterResist: 50, complication: 'Date', material: 'Stainless Steel', dial: 'Blue', type: 'Sport' },
      { id: 'offshore', name: 'Royal Oak Offshore', ref: '26400SO', year: 1993, movement: 'Cal. 3126/3840', caseDiam: 44, waterResist: 100, complication: 'Chronograph', material: 'Stainless Steel', dial: 'Black', type: 'Chronograph' },
      { id: 'perpetual', name: 'Royal Oak Perpetual Cal.', ref: '26574ST', year: 1984, movement: 'Cal. 5134', caseDiam: 41, waterResist: 50, complication: 'Perpetual Calendar', material: 'Stainless Steel', dial: 'Blue', type: 'Complication' },
    ]
  },
  {
    id: 'breitling', name: 'BREITLING', founded: 1884, origin: 'Grenchen, Switzerland',
    tagline: 'Instruments for Professionals',
    color: '#1a1200', accent: '#C8A020', logo: 'B',
    description: 'The instrument maker for aviation and the sea. Breitling patented the modern chronograph pushpiece in 1915 and invented the Navitimer slide rule still navigating aviators today.',
    assemblyStyle: 'robust',
    assemblyNote: 'Breitling chronograph mechanisms use a vertical clutch column-wheel system. The chronograph bridge must be seated before the clutch spring — reversal causes irreversible damage.',
    models: [
      { id: 'navitimer', name: 'Navitimer B01', ref: 'AB0139211B1P1', year: 2019, movement: 'Cal. B01', caseDiam: 43, waterResist: 30, complication: 'Chronograph, Slide Rule', material: 'Stainless Steel', dial: 'Black', type: 'Pilot' },
      { id: 'superocean', name: 'Superocean Heritage', ref: 'AB2030121B1S1', year: 2017, movement: 'Cal. 17', caseDiam: 42, waterResist: 200, complication: 'Date', material: 'Stainless Steel', dial: 'Blue', type: 'Dive' },
    ]
  },
  {
    id: 'vacheron', name: 'VACHERON CONSTANTIN', founded: 1755, origin: 'Geneva, Switzerland',
    tagline: 'Do Better if Possible, and That is Always Possible',
    color: '#0a0a1a', accent: '#C8A020', logo: 'V',
    description: 'The world\'s oldest continuously operating watch manufacturer. Every Vacheron Constantin bears the Hallmark of Geneva — the most stringent watchmaking certification in existence.',
    assemblyStyle: 'meticulous',
    assemblyNote: 'The Hallmark of Geneva requires all bevelled edges to be hand-finished to 45°. Inspect each component with a loupe before installation — rejection is mandatory if polishing is incomplete.',
    models: [
      { id: 'overseas', name: 'Overseas Automatic', ref: '4500V/110A', year: 2016, movement: 'Cal. 5100', caseDiam: 41, waterResist: 150, complication: 'Date', material: 'Stainless Steel', dial: 'Blue', type: 'Sport' },
      { id: 'traditionnelle', name: 'Traditionnelle', ref: '81180/000G', year: 2014, movement: 'Cal. 2460 G4', caseDiam: 38, waterResist: 30, complication: 'Small Seconds, Day-Date', material: 'Gold', dial: 'White', type: 'Dress' },
      { id: 'celestia', name: 'Astronomica Célestia', ref: '3600E/000R', year: 2017, movement: 'Cal. 3600', caseDiam: 45, waterResist: 20, complication: '23 Complications', material: 'Gold', dial: 'Skeleton', type: 'Grand Complication' },
    ]
  }
]

// ─── COMPONENTS ──────────────────────────────────────────────────────────────
export const COMPONENTS = {
  movement: [
    {
      id: 'mainspring', name: 'Mainspring', icon: '🌀', difficulty: 2, time: 8000,
      correctTool: 'mainspring-winder',
      desc: 'The coiled power-reserve spring housed in the barrel drum. This Nivaflex alloy ribbon stores mechanical energy as it uncoils, providing motive force for the entire movement.',
      realismNote: 'Wind into the barrel using the winder tool, ensuring the bridle hook engages the barrel wall. Incorrect winding causes the spring to slip and lose power reserve.',
    },
    {
      id: 'barrel', name: 'Going Barrel', icon: '⚙️', difficulty: 2, time: 6000,
      correctTool: 'tweezers',
      desc: 'The cylindrical drum that houses the mainspring and transmits energy to the gear train. Its ratchet wheel allows winding while preventing reverse rotation.',
      realismNote: 'Engage the barrel arbor carefully — excessive force collapses the arbor pivot. The barrel bridge must seat flush; lateral play indicates a damaged pivot hole.',
    },
    {
      id: 'geartrain', name: 'Gear Train', icon: '🔩', difficulty: 3, time: 12000,
      correctTool: 'peg-wood',
      desc: 'Four meshing wheels (centre, third, fourth, escape) that transmit and reduce energy from the barrel to the escapement. Pivots must be polished to mirror finish.',
      realismNote: 'Install from the centre wheel outward. Test each pivot for end-shake — perceptible but not excessive. Clean pivot holes with peg-wood before installing.',
    },
    {
      id: 'escapement', name: 'Swiss Lever Escapement', icon: '⚡', difficulty: 5, time: 20000,
      correctTool: 'timing-machine',
      desc: 'The critical control mechanism: 15-tooth escape wheel meshing with a pallet fork to release energy in precise increments. Pallet jewels must be set at exactly 52° to function.',
      realismNote: 'The most critical installation. Check impulse and locking faces under high magnification. Draw distance, lock depth, and drop must all be within specification.',
    },
    {
      id: 'balance', name: 'Balance Wheel & Hairspring', icon: '🎯', difficulty: 5, time: 25000,
      correctTool: 'demagnetiser',
      desc: 'The oscillating regulator — a weighted rimmed wheel controlled by the Breguet overcoil hairspring. Vibrating at 28,800 VPH, each oscillation permits one tooth of the escape wheel to advance.',
      realismNote: 'Install the balance complete last. Check that the impulse pin enters the fork notch cleanly. Immediately verify on the timing machine — target ±4 seconds/day.',
    },
    {
      id: 'rotor', name: 'Oscillating Weight', icon: '🔄', difficulty: 2, time: 5000,
      correctTool: 'screwdriver',
      desc: 'The semi-circular bidirectional self-winding rotor that converts wrist motion into mainspring tension. Finished with Côtes de Genève striping on the visible surface.',
      realismNote: 'Verify the rotor screw thread direction — some calibres use left-hand thread. Spin test: the rotor should rotate freely with zero lateral play.',
    },
  ],
  casing: [
    {
      id: 'case', name: 'Case Middle', icon: '⬡', difficulty: 2, time: 5000,
      correctTool: 'case-press',
      desc: 'The main body machined from a solid block of 904L stainless steel (Rolex) or 316L (others). The middle houses the movement via a movement ring and contains the threaded crown tube.',
      realismNote: 'Inspect all gasket channels before assembly. The O-ring must be lightly greased with silicone compound only — petroleum-based lubricant degrades the gasket.',
    },
    {
      id: 'dial', name: 'Dial', icon: '🎨', difficulty: 3, time: 10000,
      correctTool: 'dial-feet-tool',
      desc: 'The face of the watch — a metal disc bearing indices, numerals, and brand signature. High-end dials are electroformed then treated with lacquer, enamel, or galvanic sunburst finishing.',
      realismNote: 'Hold the dial only by its edges — skin oils permanently mark lacquered surfaces. Align both dial feet simultaneously before pressing; sequential insertion cracks dials.',
    },
    {
      id: 'hands', name: 'Watch Hands', icon: '🕐', difficulty: 4, time: 15000,
      correctTool: 'hand-setter',
      desc: 'The hour, minute, and seconds hands pressed onto cannon pinions. Dauphine-style hands are bevelled to reflect light. Lume (Super-LumiNova) is applied individually.',
      realismNote: 'Set all three hands using the dedicated hand-setting press — never tweezers alone. Rotate through all positions checking for hand collision before proceeding.',
    },
    {
      id: 'caseback', name: 'Exhibition Caseback', icon: '🔭', difficulty: 2, time: 4000,
      correctTool: 'case-press',
      desc: 'A transparent sapphire caseback revealing the movement. The gasket must create a hermetic seal. Exhibition casebacks require additional movement finishing since all surfaces are visible.',
      realismNote: 'Apply even pressure around the full circumference when pressing. Uneven pressure cracks sapphire. Use a torque-controlled press set to specification — typically 18–22 N·cm.',
    },
    {
      id: 'crown', name: 'Crown & Tube', icon: '👑', difficulty: 2, time: 4000,
      correctTool: 'screwdriver',
      desc: 'The winding crown threaded onto the crown tube at 3 o\'clock. Seals via a helical gasket compressed when screwed down. Rolex Triplock crowns achieve 300m water resistance with three sealing rings.',
      realismNote: 'Screw down firmly but without excess torque — overtightening permanently compresses the gasket. Thread engagement should be smooth throughout rotation.',
    },
    {
      id: 'crystal', name: 'Sapphire Crystal', icon: '💎', difficulty: 3, time: 8000,
      correctTool: 'crystal-press',
      desc: 'A 1.5–2mm dome of synthetic sapphire (Al₂O₃, Mohs 9) with multi-layer AR coatings reducing reflectance from 8% to under 0.5%. The tension ring must be evenly loaded.',
      realismNote: 'Orient the AR-coated side toward the dial — check with a penlight at 45°. A green/blue sheen indicates the AR side. Press evenly using the correct diameter die.',
    },
    {
      id: 'bezel', name: 'Bezel & Insert', icon: '⭕', difficulty: 2, time: 5000,
      correctTool: 'bezel-tool',
      desc: 'The rotating or fixed ring surrounding the crystal. Dive bezels rotate unidirectionally (safety feature) with ceramic insert bearing 60-minute graduation. Typically 120 clicks for a 60-minute scale.',
      realismNote: 'Align the zero marker with the 12 o\'clock lug axis before pressing. Misaligned bezels cannot be corrected without removal and risk damaging the click spring.',
    },
  ],
  strap: [
    {
      id: 'links', name: 'Bracelet Links', icon: '🔗', difficulty: 3, time: 10000,
      correctTool: 'link-tool',
      desc: 'The linked metal bracelet assembled from individual centre and outer links. Oyster-style bracelets use flush-fitting screws; H-link bracelets use friction pins. Each joint should pivot freely but without lateral play.',
      realismNote: 'Count links for a 165–170mm standard fitting before assembly. Insert link screws with thread-lock on the last quarter turn. Test each link joint for lateral play.',
    },
    {
      id: 'clasp', name: 'Deployant Clasp', icon: '🔒', difficulty: 2, time: 6000,
      correctTool: 'spring-bar',
      desc: 'The folding closure mechanism. A dépliant clasp unfolds to allow on/off without size adjustment. Fine clasps use push-button double-locking with a ratchet adjuster for fine sizing.',
      realismNote: 'Verify the push-button springs engage their detents positively — a weak spring causes accidental opening. Thread the safety latch over the correct blade.',
    },
    {
      id: 'fitting', name: 'Strap Attachment', icon: '🔧', difficulty: 2, time: 4000,
      correctTool: 'spring-bar',
      desc: 'The spring bars that attach the bracelet to the case lugs. Standard bars are 1.5mm diameter; high-load bars 2.0mm for heavy bracelets. Lug width must be measured precisely — 0.5mm error causes slip or binding.',
      realismNote: 'Hook the spring bar into the lower lug hole first, then compress and slip the upper end in — never the reverse. A click confirms seating. Pull-test each bar at 10N.',
    },
  ],
}

// ─── INSTALL ORDER ───────────────────────────────────────────────────────────
export const INSTALL_ORDER = {
  movement: ['mainspring', 'barrel', 'geartrain', 'escapement', 'balance', 'rotor'],
  casing:   ['case', 'dial', 'hands', 'caseback', 'crown', 'crystal', 'bezel'],
  strap:    ['links', 'clasp', 'fitting'],
}

// Maps component IDs to visual part IDs used by the renderer
export const PART_MAP = {
  case: 'case', dial: 'dial', hands: 'hands', caseback: 'caseback',
  crown: 'crown', crystal: 'crystal', bezel: 'bezel',
  links: 'links', clasp: 'clasp', fitting: 'fitting',
}

// ─── TOOLS ───────────────────────────────────────────────────────────────────
export const TOOLS = {
  'mainspring-winder': { name: 'Mainspring Winder Set', icon: '🌀', desc: 'Sized arbors for loading mainsprings into barrels without kinking the spring material.' },
  'tweezers':          { name: 'Dumont #3 Tweezers', icon: '🔧', desc: 'Swiss anti-magnetic stainless tweezers with 0.1mm tip precision for handling components.' },
  'peg-wood':          { name: 'Peg Wood Sticks', icon: '🪵', desc: 'Untreated hardwood pegs for cleaning pivot holes. Absorbent and scratch-free.' },
  'timing-machine':    { name: 'Witschi Timing Machine', icon: '📊', desc: 'Acoustic timing instrument measuring rate, beat error, and amplitude. Target: ±4 sec/day.' },
  'demagnetiser':      { name: 'Bergeon Demagnetiser', icon: '🧲', desc: 'Passed over steel components before installation. Residual magnetism disrupts hairspring coiling.' },
  'screwdriver':       { name: 'Bergeon Watchmaker Screwdrivers', icon: '🔩', desc: 'Precision flat-blade screwdrivers in 0.6–1.6mm sizes, hardened to Rockwell 58.' },
  'case-press':        { name: 'Case Press & Dies', icon: '⬇️', desc: 'Lever-action press for installing crystals and casebacks with uniform pressure.' },
  'dial-feet-tool':    { name: 'Dial Foot Setter', icon: '📌', desc: 'Small punch tool for seating dial feet into movement plate holes without surface stress.' },
  'hand-setter':       { name: 'Hand Setting Press', icon: '🕐', desc: 'Hollow punch in sizes matching cannon pinion diameters. Applies force to the hand center only.' },
  'crystal-press':     { name: 'Crystal Press Dies', icon: '💎', desc: 'Nylon-faced dies sized to the crystal diameter. Prevents scratching during installation.' },
  'bezel-tool':        { name: 'Bezel Press Tool', icon: '⭕', desc: 'Ring-shaped press for seating bezels concentrically, ensuring even click spring engagement.' },
  'spring-bar':        { name: 'Spring Bar Tool', icon: '↔️', desc: 'Forked and pointed tips for compressing spring bar ends without scratching case lugs.' },
  'link-tool':         { name: 'Link Pin Remover', icon: '🔗', desc: 'Hollow punch and anvil set for removing and reinstalling bracelet link pins and screws.' },
  'rodico':            { name: 'Rodico Cleaning Compound', icon: '🟡', desc: 'Non-drying adhesive putty for removing dust from pivot holes. Leaves no residue.' },
  'loupe':             { name: 'Watchmaker\'s Loupe 10×', icon: '🔍', desc: '10× magnification loupe essential for inspecting pivots, jewel settings, and hairspring geometry.' },
}

// ─── GRADE THRESHOLDS ────────────────────────────────────────────────────────
export const GRADES = [
  { min: 92, label: 'MASTERPIECE', color: '#FFD700', desc: 'Worthy of a museum vitrine. Exceptional craftsmanship in every phase.' },
  { min: 78, label: 'MINT',        color: '#C8A020', desc: 'Gallery condition. Each component installed with professional precision.' },
  { min: 62, label: 'EXCELLENT',   color: '#8EC68A', desc: 'High quality work. Minor deviations from optimal technique.' },
  { min: 45, label: 'GOOD',        color: '#7090A0', desc: 'Competent assembly. Noticeable errors in tool selection or precision.' },
  { min: 0,  label: 'POOR',        color: '#808080', desc: 'Significant technique errors. Requires remedial training.' },
]

export function getGrade(score) {
  return GRADES.find(g => score >= g.min) || GRADES[GRADES.length - 1]
}

// ─── PRESTIGE TIERS ──────────────────────────────────────────────────────────
export const PRESTIGE_TIERS = [
  { min: 0,    title: 'Apprenti',         sub: 'Apprentice' },
  { min: 200,  title: 'Ouvrier',          sub: 'Journeyman' },
  { min: 500,  title: 'Chef de Cabine',   sub: 'Workshop Chief' },
  { min: 1000, title: 'Maître Horloger',  sub: 'Master Watchmaker' },
  { min: 2000, title: 'Grand Maître',     sub: 'Grand Master' },
]

export function getPrestigeTier(pts) {
  let t = PRESTIGE_TIERS[0]
  for (const tier of PRESTIGE_TIERS) { if (pts >= tier.min) t = tier }
  return t
}

// ─── DAILY OBJECTIVES ────────────────────────────────────────────────────────
export const OBJECTIVE_POOL = [
  { id: 'any',      text: 'Complete any watch assembly',                          reward: 50  },
  { id: 'dress',    text: 'Complete a dress watch',                               reward: 75  },
  { id: 'diver',    text: 'Complete a dive watch',                                reward: 75  },
  { id: 'chrono',   text: 'Complete a chronograph',                               reward: 100 },
  { id: 'mint',     text: 'Achieve MINT or MASTERPIECE grade',                    reward: 150 },
  { id: 'patek',    text: 'Assemble any Patek Philippe reference',                reward: 125 },
  { id: 'novac',    text: 'Complete assembly with zero tool errors',              reward: 100 },
  { id: 'crits',    text: 'Land 3 or more critical precision strikes in one build', reward: 120 },
  { id: 'vacheron', text: 'Assemble any Vacheron Constantin reference',           reward: 125 },
  { id: 'speed',    text: 'Complete a full build in under 4 minutes',             reward: 90  },
]

export function getDailyObjectives() {
  const seed = new Date().toDateString().split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  return [...OBJECTIVE_POOL]
    .sort((a, b) => ((seed * (a.id.length + 1) * 31) % 100) - ((seed * (b.id.length + 1) * 31) % 100))
    .slice(0, 3)
}

// ─── SCORE CALCULATOR ────────────────────────────────────────────────────────
export function calcFinalScore({ precisionSum, precisionCount, toolCorrect, toolTotal, criticals, startTime }) {
  const prec    = precisionCount > 0 ? precisionSum / precisionCount : 70
  const tool    = toolTotal > 0 ? (toolCorrect / toolTotal) * 100 : 70
  const elapsed = startTime ? (Date.now() - startTime) / 1000 : 999
  const time    = Math.max(0, Math.min(100, 100 - Math.max(0, elapsed - 240) / 240 * 100))
  const crit    = Math.min(criticals * 10, 30)
  return Math.round(prec * 0.50 + tool * 0.30 + time * 0.10 + crit * 0.10)
}

// precision window by difficulty (degrees ±, centred at top of gauge)
export const PRECISION_WINDOWS = [75, 55, 40, 25, 12]
export const CRITICAL_WINDOWS  = [20, 15, 10,  6,  3]

// assembly style → gauge window override (used if comp has no difficulty override)
export const STYLE_WINDOW_MAP = {
  precise:     35,
  technical:   50,
  meticulous:  42,
  extreme:     22,
  artistic:    58,
  robust:      70,
}
