import { BRANDS } from '../data/gameData'
import { getPrestigeTier } from '../data/gameData'

export default function BrandScreen({ prestige, onSelect, onDrawer, collectionCount, dailyObj, completedObj }) {
  const today = new Date().toDateString()
  const doneToday = completedObj.filter(c => c.date === today).map(c => c.id)

  return (
    <div style={s.root}>
      <header style={s.header}>
        <div>
          <div style={s.logoText}>HOROLOGY</div>
          <div style={s.sub}>Select your Maison</div>
        </div>
        <div style={s.headerRight}>
          {/* Daily objectives */}
          <div style={s.objectives}>
            <div style={s.objLabel}>TODAY'S OBJECTIVES</div>
            {dailyObj.map(obj => {
              const done = doneToday.includes(obj.id)
              return (
                <div key={obj.id} style={{ ...s.objItem, opacity: done ? 0.5 : 1 }}>
                  <span style={{ color: done ? 'var(--success)' : 'var(--text-muted)', marginRight: 6 }}>
                    {done ? '✓' : '○'}
                  </span>
                  <span style={s.objText}>{obj.text}</span>
                  <span style={s.objReward}>+{obj.reward} AP</span>
                </div>
              )
            })}
          </div>
          {collectionCount > 0 && (
            <button className="btn btn-ghost" style={{ fontSize:11, padding:'8px 14px' }} onClick={onDrawer}>
              Collection ({collectionCount})
            </button>
          )}
        </div>
      </header>

      <div style={s.grid}>
        {BRANDS.map((brand, i) => {
          const pts  = prestige[brand.id] || 0
          const tier = getPrestigeTier(pts)
          return (
            <button
              key={brand.id}
              style={{ ...s.card, animationDelay:`${i*55}ms`, animation:'fadeUp 0.4s ease both' }}
              onClick={() => onSelect(brand)}
            >
              <div style={{ ...s.accent, background: brand.color }} />
              <div style={s.glyph}>{brand.logo}</div>
              <div style={s.name}>{brand.name}</div>
              <div style={s.founded}>Est. {brand.founded} · {brand.origin}</div>
              <div style={s.tagline}>"{brand.tagline}"</div>
              <div style={s.footer}>
                <span style={s.refs}>{brand.models.length} References</span>
                {pts > 0 && <span style={s.badge}>{tier.title}</span>}
              </div>
            </button>
          )
        })}
      </div>
    </div>
  )
}

const s = {
  root:   { position:'fixed', inset:0, display:'flex', flexDirection:'column', overflow:'hidden' },
  header: { display:'flex', alignItems:'flex-start', justifyContent:'space-between', padding:'20px 36px', borderBottom:'1px solid var(--gold-dim)', flexShrink:0, gap:24 },
  logoText: { fontFamily:'var(--font-disp)', fontWeight:300, fontSize:26, letterSpacing:'0.22em', color:'var(--gold)' },
  sub:   { fontSize:9, letterSpacing:'0.4em', color:'var(--text-muted)', textTransform:'uppercase', marginTop:3 },
  headerRight: { display:'flex', alignItems:'flex-start', gap:20 },
  objectives: { display:'flex', flexDirection:'column', gap:4, minWidth:280 },
  objLabel: { fontSize:9, letterSpacing:'0.35em', color:'var(--gold)', textTransform:'uppercase', marginBottom:4 },
  objItem: { display:'flex', alignItems:'center', gap:4, fontSize:11 },
  objText: { fontFamily:'var(--font-disp)', fontSize:12, color:'var(--text-dim)', flex:1 },
  objReward: { fontSize:10, color:'var(--gold)', letterSpacing:'0.1em', marginLeft:8 },
  grid: { flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(290px,1fr))', gap:1, background:'var(--mid)', padding:0 },
  card: { background:'var(--dark-2)', border:'none', cursor:'pointer', padding:'28px 24px', textAlign:'left', transition:'background 0.18s', display:'flex', flexDirection:'column', gap:10, position:'relative', overflow:'hidden' },
  accent: { position:'absolute', top:0, left:0, width:3, height:'100%', opacity:0.75 },
  glyph: { fontFamily:'var(--font-disp)', fontWeight:300, fontSize:34, color:'var(--gold)', lineHeight:1 },
  name: { fontFamily:'var(--font-ui)', fontWeight:200, fontSize:13, letterSpacing:'0.28em', color:'var(--text)' },
  founded: { fontSize:10, letterSpacing:'0.15em', color:'var(--text-muted)' },
  tagline: { fontFamily:'var(--font-disp)', fontStyle:'italic', fontSize:13, color:'var(--text-dim)', lineHeight:1.4 },
  footer: { display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:'auto', paddingTop:10, borderTop:'1px solid var(--gold-dim)' },
  refs: { fontSize:10, letterSpacing:'0.15em', color:'var(--text-muted)' },
  badge: { fontSize:9, letterSpacing:'0.2em', color:'var(--gold)', background:'rgba(200,160,32,0.1)', border:'1px solid rgba(200,160,32,0.2)', padding:'2px 8px', textTransform:'uppercase' },
}
