import { useEffect, useRef } from 'react'
import { drawWatch } from '../utils/renderer'

const ALL_PARTS = ['case','bezel','crystal','dial','hands','crown','fitting','links','caseback']

export default function DrawerScreen({ collection, onBack, onRemove }) {
  return (
    <div style={s.root}>
      <header style={s.header}>
        <button className="btn btn-ghost" style={{fontSize:11,padding:'8px 14px'}} onClick={onBack}>← Atelier</button>
        <div style={s.title}>The Collection</div>
        <div style={s.count}>{collection.length} Timepiece{collection.length!==1?'s':''}</div>
      </header>

      {collection.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyTitle}>Your collection awaits its first timepiece</div>
          <div style={s.emptySub}>Complete a build to add a watch to the collection</div>
          <button className="btn btn-outline" style={{marginTop:24}} onClick={onBack}>Begin a Build</button>
        </div>
      ) : (
        <div style={s.grid}>
          {collection.map(entry => (
            <WatchCard key={entry.id} entry={entry} onRemove={onRemove}/>
          ))}
        </div>
      )}
    </div>
  )
}

function WatchCard({ entry, onRemove }) {
  const cvRef = useRef(null)
  const raf   = useRef(null)

  useEffect(() => {
    const draw = () => {
      const now = new Date()
      drawWatch({ canvas:cvRef.current, brand:entry.brand, model:entry.model, parts:ALL_PARTS, showHands:true,
        h:now.getHours(), m:now.getMinutes(), s:now.getSeconds()+now.getMilliseconds()/1000 })
      raf.current = requestAnimationFrame(draw)
    }
    raf.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(raf.current)
  }, [entry])

  const date = new Date(entry.builtAt).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})

  return (
    <div style={s.card}>
      <div style={s.cardLeft}>
        <canvas ref={cvRef} width={140} height={140} style={{display:'block'}}/>
      </div>
      <div style={s.cardInfo}>
        <div style={s.cBrand}>{entry.brand?.name}</div>
        <div style={s.cModel}>{entry.model?.name}</div>
        <div style={{...s.cGrade, color:entry.gradeColor}}>{entry.grade}</div>
        <div style={s.cStats}>
          Score {entry.score}/100 · Precision {entry.precision}%
        </div>
        {entry.criticals > 0 && (
          <div style={s.cCrit}>✦ {entry.criticals} Critical Strike{entry.criticals>1?'s':''}</div>
        )}
        <div style={s.cDate}>{date}</div>
        <button style={s.removeBtn} onClick={()=>onRemove(entry.id)}>Remove</button>
      </div>
    </div>
  )
}

const s = {
  root:   {position:'fixed',inset:0,display:'flex',flexDirection:'column',overflow:'hidden'},
  header: {display:'flex',alignItems:'center',justifyContent:'space-between',padding:'18px 32px',borderBottom:'1px solid var(--gold-dim)',flexShrink:0},
  title:  {fontFamily:'var(--font-disp)',fontWeight:300,fontSize:26,letterSpacing:'0.18em',color:'var(--gold)'},
  count:  {fontSize:10,letterSpacing:'0.25em',color:'var(--text-muted)'},
  empty:  {flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:8},
  emptyTitle:{fontFamily:'var(--font-disp)',fontStyle:'italic',fontSize:20,color:'var(--text-dim)'},
  emptySub:  {fontSize:11,letterSpacing:'0.15em',color:'var(--text-muted)'},
  grid:   {flex:1,overflowY:'auto',display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:1,background:'var(--mid)',padding:0,alignContent:'start'},
  card:   {background:'var(--dark-2)',display:'flex',gap:16,padding:20,cursor:'default'},
  cardLeft:{flexShrink:0},
  cardInfo:{display:'flex',flexDirection:'column',gap:4,flex:1,minWidth:0},
  cBrand: {fontFamily:'var(--font-ui)',fontWeight:200,fontSize:10,letterSpacing:'0.25em',color:'var(--text-muted)'},
  cModel: {fontFamily:'var(--font-disp)',fontSize:17,color:'var(--text)'},
  cGrade: {fontFamily:'var(--font-disp)',fontSize:15,letterSpacing:'0.1em'},
  cStats: {fontFamily:'var(--font-disp)',fontSize:12,color:'var(--text-muted)',fontStyle:'italic'},
  cCrit:  {fontSize:11,color:'var(--gold)',letterSpacing:'0.08em'},
  cDate:  {fontSize:10,color:'var(--text-muted)',marginTop:2,letterSpacing:'0.08em'},
  removeBtn:{marginTop:'auto',alignSelf:'flex-start',background:'none',border:'1px solid rgba(229,57,53,0.3)',color:'rgba(229,57,53,0.6)',fontSize:9,letterSpacing:'0.2em',padding:'4px 10px',cursor:'pointer',textTransform:'uppercase',transition:'all 0.18s'},
}
