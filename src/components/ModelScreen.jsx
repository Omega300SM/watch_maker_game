import { useEffect, useRef } from 'react'
import { drawWatch } from '../utils/renderer'

const ALL_PARTS = ['case','bezel','crystal','dial','hands','crown','fitting','links','caseback']

export default function ModelScreen({ brand, onSelect, onBack }) {
  if (!brand) return null
  return (
    <div style={s.root}>
      <header style={s.header}>
        <button className="btn btn-ghost" style={s.back} onClick={onBack}>← Maisons</button>
        <div style={s.center}>
          <div style={s.brandName}>{brand.name}</div>
          <div style={s.sub}>Select Reference</div>
        </div>
        <div style={{ width:100 }} />
      </header>

      <div style={s.note}>
        <div style={s.noteLabel}>Engineering DNA · {brand.assemblyStyle?.toUpperCase()}</div>
        <p style={s.noteText}>{brand.assemblyNote}</p>
      </div>

      <div style={s.grid}>
        {brand.models.map((model, i) => (
          <ModelCard key={model.id} brand={brand} model={model} idx={i} onSelect={onSelect} />
        ))}
      </div>
    </div>
  )
}

function ModelCard({ brand, model, idx, onSelect }) {
  const cvRef = useRef(null)
  const raf   = useRef(null)

  useEffect(() => {
    const animate = () => {
      const now = new Date()
      drawWatch({ canvas:cvRef.current, brand, model, parts:ALL_PARTS, showHands:true,
        h:now.getHours(), m:now.getMinutes(), s:now.getSeconds()+now.getMilliseconds()/1000 })
      raf.current = requestAnimationFrame(animate)
    }
    raf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(raf.current)
  }, [brand, model])

  return (
    <button
      style={{ ...s.card, animationDelay:`${idx*80}ms`, animation:'fadeUp 0.4s ease both' }}
      onClick={() => onSelect(model)}
    >
      <div style={s.cvWrap}>
        <canvas ref={cvRef} width={200} height={200} style={{ display:'block' }} />
      </div>
      <div style={s.info}>
        <div style={s.mName}>{model.name}</div>
        <div style={s.ref}>Ref. {model.ref}</div>
        <div style={s.specs}>
          <span>{model.caseDiam}mm</span>
          <span>{model.material}</span>
          <span>{model.waterResist}m WR</span>
        </div>
        <div style={s.comp}>{model.complication}</div>
      </div>
    </button>
  )
}

const s = {
  root:   { position:'fixed', inset:0, display:'flex', flexDirection:'column', overflow:'hidden' },
  header: { display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 28px', borderBottom:'1px solid var(--gold-dim)', flexShrink:0 },
  back:   { fontSize:11, padding:'8px 14px' },
  center: { textAlign:'center' },
  brandName: { fontFamily:'var(--font-disp)', fontSize:22, fontWeight:300, letterSpacing:'0.25em', color:'var(--gold)' },
  sub:  { fontSize:9, letterSpacing:'0.4em', color:'var(--text-muted)', textTransform:'uppercase' },
  note: { padding:'14px 28px', background:'var(--dark-2)', borderBottom:'1px solid var(--gold-dim)', flexShrink:0 },
  noteLabel: { fontSize:9, letterSpacing:'0.3em', color:'var(--gold)', textTransform:'uppercase', marginBottom:4 },
  noteText:  { fontFamily:'var(--font-disp)', fontSize:13, fontWeight:300, color:'var(--text-dim)', lineHeight:1.65, maxWidth:800 },
  grid: { flex:1, overflowY:'auto', display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(210px,1fr))', gap:1, background:'var(--mid)' },
  card: { background:'var(--dark-2)', border:'none', cursor:'pointer', display:'flex', flexDirection:'column', alignItems:'center', padding:'22px 14px', gap:14, transition:'background 0.18s' },
  cvWrap: { filter:'drop-shadow(0 4px 18px rgba(200,160,32,0.15))' },
  info: { textAlign:'center', width:'100%' },
  mName: { fontFamily:'var(--font-disp)', fontSize:16, color:'var(--text)', marginBottom:4 },
  ref:   { fontSize:10, letterSpacing:'0.15em', color:'var(--text-muted)', marginBottom:8 },
  specs: { display:'flex', gap:8, justifyContent:'center', flexWrap:'wrap', fontSize:9, letterSpacing:'0.1em', color:'var(--text-dim)', marginBottom:6 },
  comp:  { fontFamily:'var(--font-disp)', fontStyle:'italic', fontSize:11, color:'var(--gold-dark)' },
}
