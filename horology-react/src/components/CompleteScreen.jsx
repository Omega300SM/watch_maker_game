import { useEffect, useRef, useState } from 'react'
import { drawWatch } from '../utils/renderer'
import { startTicking, stopTicking } from '../utils/audio'
import { getGrade, calcFinalScore, getPrestigeTier, OBJECTIVE_POOL } from '../data/gameData'

const ALL_PARTS = ['case','bezel','crystal','dial','hands','crown','fitting','links','caseback']

export default function CompleteScreen({ brand, model, score, lastEntry, prestige, dailyObj, completedObj, onNewBuild, onDrawer }) {
  const cvRef     = useRef(null)
  const rafRef    = useRef(null)
  const [navTime, setNavTime]     = useState('')
  const [ticking,  setTicking]   = useState(false)
  const [syncMsg,  setSyncMsg]   = useState('SYNCHRONISING · USNO')

  const finalScore = lastEntry?.score ?? calcFinalScore(score)
  const grade      = getGrade(finalScore)
  const today      = new Date().toDateString()
  const doneToday  = completedObj.filter(c=>c.date===today).map(c=>c.id)
  const newlyDone  = dailyObj.filter(o=>doneToday.includes(o.id))
  const pts        = prestige[brand?.id] || 0
  const tier       = getPrestigeTier(pts)

  // Naval time
  useEffect(() => {
    const fmt = () => {
      const now = new Date()
      const h = String(now.getUTCHours()).padStart(2,'0')
      const m = String(now.getUTCMinutes()).padStart(2,'0')
      const sec = String(now.getUTCSeconds()).padStart(2,'0')
      setNavTime(`${h}:${m}:${sec}`)
    }
    fmt()
    const id = setInterval(fmt,1000)
    setTimeout(()=>setSyncMsg('SYNCHRONISED · USNO'), 1800)
    return ()=>clearInterval(id)
  },[])

  // Watch canvas
  useEffect(()=>{
    const draw = ()=>{
      const now = new Date()
      drawWatch({ canvas:cvRef.current, brand, model, parts:ALL_PARTS, showHands:true,
        h:now.getHours(), m:now.getMinutes(), s:now.getSeconds()+now.getMilliseconds()/1000 })
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return ()=>cancelAnimationFrame(rafRef.current)
  },[brand,model])

  const toggleTick = () => {
    if (ticking) { stopTicking(); setTicking(false) }
    else         { startTicking(); setTicking(true) }
  }
  useEffect(()=>()=>stopTicking(),[])

  const fmtDur = s => `${Math.floor(s/60)}m ${s%60}s`

  return (
    <div style={s.root}>
      <div style={s.content}>
        <div style={s.eyebrow}>TIMEPIECE REGISTERED</div>

        {/* Watch + time */}
        <div style={s.watchSection}>
          <canvas ref={cvRef} width={260} height={260} style={s.canvas}/>
          <div style={s.timeBlock}>
            <div style={s.navTime}>{navTime}</div>
            <div style={s.navLabel}>{syncMsg}</div>
            <button className="btn btn-outline" style={s.tickBtn} onClick={toggleTick}>
              {ticking ? '■ Stop' : '▶ Start'} Movement
            </button>
            {ticking && <div style={s.tickDot}/>}
          </div>
        </div>

        {/* Grade card */}
        <div style={s.gradeCard}>
          <div style={s.gcBrand}>{brand?.name} · {model?.name}</div>
          <div style={{...s.gcGrade, color:grade.color}}>{grade.label}</div>
          <div style={s.gcDesc}>{grade.desc}</div>
          <div style={s.gcStats}>
            <Stat label="Score"         value={`${finalScore} / 100`}/>
            <Stat label="Precision Avg" value={`${lastEntry?.precision ?? '—'}%`}/>
            <Stat label="Tool Accuracy" value={`${lastEntry?.toolAccuracy ?? '—'}%`}/>
            <Stat label="Build Time"    value={lastEntry ? fmtDur(lastEntry.duration) : '—'}/>
            {(lastEntry?.criticals||0) > 0 && <Stat label="Critical Strikes" value={`${lastEntry.criticals} ✦`} gold/>}
          </div>
        </div>

        {/* Prestige */}
        <div style={s.prestige}>
          <div style={s.prestLabel}>MAISON PRESTIGE · {brand?.name}</div>
          <div style={s.prestTier}>{tier.title} <span style={{color:'var(--text-muted)',fontSize:13}}>({tier.sub})</span></div>
          <div style={s.prestPts}>{pts} AP</div>
        </div>

        {/* Completed objectives */}
        {newlyDone.length > 0 && (
          <div style={s.objectives}>
            <div style={s.objLabel}>OBJECTIVES COMPLETED</div>
            {newlyDone.map(o=>(
              <div key={o.id} style={s.objItem}>
                <span style={{color:'var(--success)'}}>✓</span>
                <span style={s.objText}>{o.text}</span>
                <span style={s.objReward}>+{o.reward} AP</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div style={s.actions}>
          <button className="btn btn-primary" style={{padding:'12px 28px'}} onClick={onNewBuild}>Build Another</button>
          <button className="btn btn-ghost"   style={{padding:'12px 28px'}} onClick={onDrawer}>View Collection</button>
        </div>
      </div>
    </div>
  )
}

function Stat({ label, value, gold }) {
  return (
    <div style={{display:'flex',justifyContent:'space-between',padding:'4px 0',borderBottom:'1px solid var(--gold-dim)'}}>
      <span style={{fontSize:11,letterSpacing:'0.1em',color:'var(--text-muted)'}}>{label}</span>
      <span style={{fontFamily:'var(--font-disp)',fontSize:14,color:gold?'var(--gold)':'var(--text-dim)'}}>{value}</span>
    </div>
  )
}

const s = {
  root:    {position:'fixed',inset:0,overflowY:'auto',display:'flex',alignItems:'center',justifyContent:'center',padding:24},
  content: {display:'flex',flexDirection:'column',alignItems:'center',gap:20,maxWidth:460,width:'100%',animation:'fadeIn 0.5s ease'},
  eyebrow: {fontFamily:'var(--font-ui)',fontSize:10,letterSpacing:'0.4em',color:'var(--gold)',textTransform:'uppercase'},
  watchSection:{display:'flex',alignItems:'center',gap:24},
  canvas:  {display:'block',borderRadius:'50%',filter:'drop-shadow(0 0 30px rgba(200,160,32,0.18))'},
  timeBlock:{display:'flex',flexDirection:'column',gap:6},
  navTime: {fontFamily:'var(--font-ui)',fontWeight:200,fontSize:28,letterSpacing:'0.15em',color:'var(--text-dim)',fontVariantNumeric:'tabular-nums'},
  navLabel:{fontSize:9,letterSpacing:'0.3em',color:'var(--text-muted)'},
  tickBtn: {marginTop:6,padding:'8px 14px',fontSize:10,letterSpacing:'0.2em'},
  tickDot: {width:6,height:6,borderRadius:'50%',background:'var(--gold)',animation:'pulse 0.125s steps(1) infinite',alignSelf:'center'},
  gradeCard:{width:'100%',background:'var(--dark-2)',border:'1px solid var(--gold-dim)',padding:'22px 24px',display:'flex',flexDirection:'column',gap:8},
  gcBrand: {fontFamily:'var(--font-disp)',fontSize:15,color:'var(--text-dim)',letterSpacing:'0.08em'},
  gcGrade: {fontFamily:'var(--font-disp)',fontSize:28,letterSpacing:'0.2em',fontWeight:400},
  gcDesc:  {fontFamily:'var(--font-disp)',fontStyle:'italic',fontSize:13,color:'var(--text-muted)'},
  gcStats: {display:'flex',flexDirection:'column',gap:0,marginTop:6},
  prestige:{width:'100%',background:'var(--dark-2)',border:'1px solid var(--gold-dim)',padding:'16px 20px',display:'flex',alignItems:'center',justifyContent:'space-between'},
  prestLabel:{fontSize:9,letterSpacing:'0.3em',color:'var(--gold)',textTransform:'uppercase'},
  prestTier: {fontFamily:'var(--font-disp)',fontSize:16,color:'var(--text)'},
  prestPts:  {fontSize:12,letterSpacing:'0.1em',color:'var(--text-muted)'},
  objectives:{width:'100%',background:'var(--dark-2)',border:'1px solid rgba(76,175,80,0.25)',padding:'14px 18px'},
  objLabel:  {fontSize:9,letterSpacing:'0.35em',color:'var(--success)',textTransform:'uppercase',marginBottom:8},
  objItem:   {display:'flex',alignItems:'center',gap:8,marginTop:4},
  objText:   {fontFamily:'var(--font-disp)',fontSize:13,color:'var(--text-dim)',flex:1},
  objReward: {fontSize:10,color:'var(--gold)',letterSpacing:'0.1em'},
  actions:   {display:'flex',gap:12,marginTop:4},
}
