import { useState, useEffect, useRef, useCallback } from 'react'
import { COMPONENTS, INSTALL_ORDER, TOOLS, PRECISION_WINDOWS, CRITICAL_WINDOWS } from '../data/gameData'
import { drawWatch, drawMovement } from '../utils/renderer'
import { playInstallSound, playCriticalSound } from '../utils/audio'

const PHASES = ['movement','casing','strap']
const PHASE_LABELS = { movement:'MOVEMENT', casing:'CASING', strap:'STRAP & BRACELET' }

function getToolChoices(comp) {
  const correct = comp.correctTool
  const wrong = Object.keys(TOOLS).filter(id => id !== correct).sort(() => Math.random()-0.5).slice(0,2)
  return [correct, ...wrong].sort(() => Math.random()-0.5)
}

export default function AssemblyScreen({ brand, model, phase, installed, parts, onInstall, onAdvancePhase, onComplete, isPhaseComplete, allComplete, showToast, onBack }) {
  const cvRef  = useRef(null)
  const dzRef  = useRef(null)
  const rafRef = useRef(null)
  const tick   = useRef(0)

  const [flash,     setFlash]     = useState(false)
  const [dragOver,  setDragOver]  = useState(false)
  const [selComp,   setSelComp]   = useState(null)

  // Tool modal
  const [toolModal, setToolModal] = useState(null)  // { comp, choices }
  const [toolSel,   setToolSel]   = useState(null)
  const [toolRes,   setToolRes]   = useState(null)  // 'correct'|'wrong'|null

  // Precision modal
  const [precModal, setPrecModal] = useState(null)  // { comp, toolOk }
  const [running,   setRunning]   = useState(false)
  const angleRef   = useRef(0)
  const dirRef     = useRef(1)
  const precRaf    = useRef(null)
  const speedRef   = useRef(0.025)

  // ── Canvas animation ─────────────────────────────────────────────────────
  useEffect(() => {
    const draw = () => {
      tick.current++
      if (phase === 'movement') {
        drawMovement({ canvas:cvRef.current, installed, tick:tick.current })
      } else {
        const now = new Date()
        drawWatch({ canvas:cvRef.current, brand, model, parts, showHands:true,
          h:now.getHours(), m:now.getMinutes(), s:now.getSeconds()+now.getMilliseconds()/1000 })
      }
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, installed, parts, brand, model])

  // ── Precision needle ─────────────────────────────────────────────────────
  useEffect(() => {
    if (!running) return
    const animate = () => {
      angleRef.current += speedRef.current * dirRef.current
      if (angleRef.current >= 1) { dirRef.current = -1 }
      if (angleRef.current <= -1) { dirRef.current = 1 }
      precRaf.current = requestAnimationFrame(animate)
    }
    precRaf.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(precRaf.current)
  }, [running])

  // ── Drag helpers ─────────────────────────────────────────────────────────
  const startDrag = useCallback((e, comp) => {
    const order = INSTALL_ORDER[phase] || []
    const idx = order.indexOf(comp.id)
    if (installed.includes(comp.id)) return
    if (idx > 0 && !installed.includes(order[idx-1])) {
      const blocker = Object.values(COMPONENTS).flat().find(c => c.id === order[idx-1])
      showToast(`Install ${blocker?.name || order[idx-1]} first`)
      return
    }
    e.preventDefault()

    const ghost = e.currentTarget.cloneNode(true)
    ghost.style.cssText = `position:fixed;pointer-events:none;z-index:9000;opacity:0.88;
      transform:rotate(3deg) scale(1.06);transition:none;width:${e.currentTarget.offsetWidth}px;`
    ghost.style.top  = ((e.clientY||e.touches?.[0]?.clientY) - 40) + 'px'
    ghost.style.left = ((e.clientX||e.touches?.[0]?.clientX) - 55) + 'px'
    document.body.appendChild(ghost)

    const move = ev => {
      const ex = ev.clientX ?? ev.touches?.[0]?.clientX
      const ey = ev.clientY ?? ev.touches?.[0]?.clientY
      ghost.style.top  = (ey-40)+'px'
      ghost.style.left = (ex-55)+'px'
      if (dzRef.current) {
        const r = dzRef.current.getBoundingClientRect()
        setDragOver(ex>r.left && ex<r.right && ey>r.top && ey<r.bottom)
      }
    }
    const end = ev => {
      document.removeEventListener('mousemove',  move)
      document.removeEventListener('mouseup',    end)
      document.removeEventListener('touchmove',  move)
      document.removeEventListener('touchend',   end)
      ghost.remove()
      const ex = ev.clientX ?? ev.changedTouches?.[0]?.clientX
      const ey = ev.clientY ?? ev.changedTouches?.[0]?.clientY
      if (dzRef.current) {
        const r = dzRef.current.getBoundingClientRect()
        if (ex>r.left && ex<r.right && ey>r.top && ey<r.bottom) {
          openToolModal(comp)
        }
      }
      setDragOver(false)
    }
    document.addEventListener('mousemove', move)
    document.addEventListener('mouseup',   end)
    document.addEventListener('touchmove', move, { passive:false })
    document.addEventListener('touchend',  end)
  }, [phase, installed, showToast])

  const openToolModal = useCallback(comp => {
    setToolModal({ comp, choices: getToolChoices(comp) })
    setToolSel(null); setToolRes(null)
  }, [])

  const selectTool = useCallback(toolId => {
    if (!toolModal || toolRes) return
    const correct = toolModal.comp.correctTool
    const isOk    = toolId === correct
    setToolSel(toolId); setToolRes(isOk ? 'correct' : 'wrong')
    setTimeout(() => {
      setToolModal(null); setToolSel(null); setToolRes(null)
      // Open precision modal
      const d = toolModal.comp.difficulty
      speedRef.current = (0.018 + d * 0.005) * (Math.random()>0.5?1:-1)
      angleRef.current = 0; dirRef.current = 1
      setPrecModal({ comp:toolModal.comp, toolOk:isOk })
      setRunning(true)
    }, 900)
  }, [toolModal, toolRes])

  const stopPrecision = useCallback(() => {
    if (!running || !precModal) return
    setRunning(false)
    cancelAnimationFrame(precRaf.current)

    const comp = precModal.comp
    const d = comp.difficulty - 1
    const halfWin  = (PRECISION_WINDOWS[d] ?? 40) / 100  // normalised to [-1,1] range
    const halfCrit = (CRITICAL_WINDOWS[d]  ?? 10) / 100
    const a = angleRef.current

    const inWindow   = Math.abs(a) <= halfWin
    const wasCritical = Math.abs(a) <= halfCrit

    let precScore
    if (wasCritical)    precScore = 96 + Math.random()*4
    else if (inWindow)  precScore = 72 + (1 - Math.abs(a)/halfWin)*22
    else                precScore = 20 + Math.random()*35

    if (wasCritical) {
      playCriticalSound()
      showToast(`✦ Critical precision — perfect installation of ${comp.name}`)
    } else if (inWindow) {
      playInstallSound(comp.difficulty)
      showToast(`${comp.name} installed`)
    } else {
      playInstallSound(1)
      showToast(`Outside tolerance — ${comp.name} installed with reduced precision`)
    }

    if (inWindow) { setFlash(true); setTimeout(()=>setFlash(false),300) }

    const err = onInstall(comp.id, Math.round(precScore), precModal.toolOk, wasCritical)
    if (err) showToast(err)
    setPrecModal(null)
  }, [running, precModal, onInstall, showToast])

  // keyboard stop
  useEffect(() => {
    const h = e => { if(e.code==='Space'&&running){e.preventDefault();stopPrecision()} }
    window.addEventListener('keydown',h)
    return () => window.removeEventListener('keydown',h)
  }, [running, stopPrecision])

  const comps  = COMPONENTS[phase] || []
  const order  = INSTALL_ORDER[phase] || []
  const phDone = p => isPhaseComplete(p, installed)
  const total  = Object.values(INSTALL_ORDER).flat().length
  const prog   = installed.length / total

  return (
    <div style={s.root}>
      {/* Header */}
      <header style={s.header}>
        <button className="btn btn-ghost" style={{fontSize:11,padding:'7px 14px'}} onClick={onBack}>← Maisons</button>
        <div style={s.hCenter}>
          <span style={s.hBrand}>{brand?.name}</span>
          <span style={s.hSep}>·</span>
          <span style={s.hModel}>{model?.name}</span>
        </div>
        <div style={s.hRight}>{installed.length}/{total} PARTS</div>
      </header>

      {/* Progress bar */}
      <div className="prog-bar"><div className="prog-fill" style={{width:`${prog*100}%`}} /></div>

      {/* Phase tabs */}
      <div style={s.tabs}>
        {PHASES.map(p => (
          <div key={p} style={{ ...s.tab, ...(phase===p?s.tabActive:{}), ...(phDone(p)?s.tabDone:{}) }}>
            {phDone(p) && <span style={{marginRight:5}}>✓</span>}{PHASE_LABELS[p]}
          </div>
        ))}
      </div>

      {/* Workbench */}
      <div style={s.bench}>
        {/* Canvas / drop zone */}
        <div style={s.dropArea}>
          <div ref={dzRef} style={{ ...s.dropZone, ...(dragOver?s.dropOver:{}) }}>
            <canvas ref={cvRef} width={400} height={400} style={{display:'block'}} />
            <div className={`flash ${flash?'active':''}`} />
            {!installed.some(id=>order.includes(id)) && !dragOver && (
              <div style={s.dropHint}>Drag a component here to install</div>
            )}
          </div>

          {/* Installed chips */}
          {order.filter(id=>installed.includes(id)).length > 0 && (
            <div style={s.chips}>
              {order.filter(id=>installed.includes(id)).map(id => {
                const c = comps.find(x=>x.id===id)
                return <div key={id} className="chip">{c?.icon} {c?.name}</div>
              })}
            </div>
          )}

          {/* Advance / Complete button */}
          {phDone(phase) && !allComplete(installed) && (
            <button className="btn btn-primary" style={s.advBtn} onClick={onAdvancePhase}>
              Proceed to {PHASE_LABELS[PHASES[PHASES.indexOf(phase)+1]]} →
            </button>
          )}
          {allComplete(installed) && (
            <button className="btn btn-primary" style={s.advBtn} onClick={onComplete}>
              ✦ Complete the Timepiece
            </button>
          )}
        </div>

        {/* Info panel */}
        <div style={s.info}>
          {selComp ? <CompDetail comp={selComp} onClose={()=>setSelComp(null)} /> : (
            <div style={s.infoPlaceholder}>
              <div style={{fontSize:28,opacity:0.2,marginBottom:10}}>🔍</div>
              <div style={{fontSize:11,letterSpacing:'0.15em',color:'var(--text-muted)',textAlign:'center'}}>
                Click a component card to view technical notes
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Parts tray */}
      <div style={s.tray}>
        <div style={s.trayLabel}>{PHASE_LABELS[phase]}</div>
        <div style={s.trayScroll}>
          {comps.map(comp => {
            const idx     = order.indexOf(comp.id)
            const isInstalled = installed.includes(comp.id)
            const isLocked    = idx>0 && !installed.includes(order[idx-1]) && !isInstalled
            return (
              <PartCard key={comp.id} comp={comp} installed={isInstalled} locked={isLocked}
                onDragStart={startDrag} onClick={()=>setSelComp(comp)} />
            )
          })}
        </div>
      </div>

      {/* Tool Modal */}
      {toolModal && (
        <div className="overlay">
          <div className="modal" style={{minWidth:520,maxWidth:600}}>
            <div style={ms.label}>Select Instrument</div>
            <div style={ms.compRow}>
              <span style={{fontSize:26}}>{toolModal.comp.icon}</span>
              <span style={ms.compName}>{toolModal.comp.name}</span>
            </div>
            <div style={ms.hint}>Choose the correct tool for this installation phase</div>
            <div style={{display:'flex',flexDirection:'column',gap:8}}>
              {toolModal.choices.map(tid => {
                const tool = TOOLS[tid]
                const isSel = toolSel===tid
                const isCorrect = tid === toolModal.comp.correctTool
                let border = 'var(--gold-dim)'
                let bg = 'var(--dark-3)'
                if (isSel && toolRes==='correct') { border='var(--success)'; bg='rgba(76,175,80,0.1)' }
                if (isSel && toolRes==='wrong')   { border='#E53935'; bg='rgba(229,57,53,0.1)' }
                if (toolRes && isCorrect && !isSel) { border='var(--success)' }
                return (
                  <button key={tid} style={{...ms.choice,borderColor:border,background:bg}} onClick={()=>selectTool(tid)}>
                    <span style={{fontSize:18,flexShrink:0}}>{tool?.icon}</span>
                    <div>
                      <div style={ms.toolName}>{tool?.name}</div>
                      <div style={ms.toolDesc}>{tool?.desc}</div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Precision Modal */}
      {precModal && (
        <div className="overlay" onClick={running?stopPrecision:undefined}>
          <div className="modal" style={{display:'flex',flexDirection:'column',alignItems:'center',minWidth:360,padding:32}} onClick={e=>e.stopPropagation()}>
            <div style={ms.label}>Precision Assembly</div>
            <div style={ms.compName}>{precModal.comp.name}</div>
            <PrecisionGauge angle={angleRef.current} difficulty={precModal.comp.difficulty} running={running} />
            <div style={ms.gaugeHint}>{running?'Tap STOP at the right moment — or press SPACE':'Measuring...'}</div>
            {running && (
              <button className="btn btn-primary" style={{width:180,padding:'13px',fontSize:12,letterSpacing:'0.35em'}} onClick={stopPrecision}>
                STOP
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function PartCard({ comp, installed, locked, onDragStart, onClick }) {
  const ref = useRef(null)
  const handleMouseDown = e => { if(!installed&&!locked) onDragStart(e, comp) }
  const handleTouchStart = e => { if(!installed&&!locked) onDragStart(e, comp) }
  return (
    <div ref={ref} style={{ ...s.partCard, ...(installed?s.partInstalled:{}), ...(locked?s.partLocked:{}) }}
      onMouseDown={handleMouseDown} onTouchStart={handleTouchStart} onClick={onClick}>
      <div style={{fontSize:22}}>{comp.icon}</div>
      <div style={s.partName}>{comp.name}</div>
      {installed ? (
        <div style={{fontSize:9,color:'var(--success)'}}>✓ Installed</div>
      ) : locked ? (
        <div style={{fontSize:14}}>🔒</div>
      ) : (
        <div className="dots">{[1,2,3,4,5].map(d=><div key={d} className={`dot${d<=comp.difficulty?' on':''}`}/>)}</div>
      )}
    </div>
  )
}

function CompDetail({ comp, onClose }) {
  return (
    <div style={{padding:16,height:'100%',display:'flex',flexDirection:'column',gap:0,overflow:'auto'}}>
      <div style={{display:'flex',alignItems:'flex-start',gap:10,marginBottom:12}}>
        <span style={{fontSize:26}}>{comp.icon}</span>
        <div style={{flex:1}}>
          <div style={{fontFamily:'var(--font-disp)',fontSize:17,color:'var(--text)',marginBottom:4}}>{comp.name}</div>
          <div className="dots">{[1,2,3,4,5].map(d=><div key={d} className={`dot${d<=comp.difficulty?' on':''}`}/>)}</div>
        </div>
        <button onClick={onClose} style={{background:'none',border:'none',color:'var(--text-dim)',fontSize:18,cursor:'pointer',lineHeight:1,padding:'0 4px'}}>×</button>
      </div>
      <div className="divider"/>
      <p style={{fontFamily:'var(--font-disp)',fontSize:13,lineHeight:1.75,color:'var(--text-dim)',marginBottom:12}}>{comp.desc}</p>
      <div className="divider"/>
      <div style={{fontSize:9,letterSpacing:'0.3em',color:'var(--gold)',textTransform:'uppercase',marginBottom:6}}>Watchmaker's Note</div>
      <p style={{fontFamily:'var(--font-disp)',fontStyle:'italic',fontSize:12,lineHeight:1.65,color:'var(--text-dim)',marginBottom:12}}>{comp.realismNote}</p>
      <div className="divider"/>
      <div style={{fontSize:9,letterSpacing:'0.3em',color:'var(--gold)',textTransform:'uppercase',marginBottom:6}}>Correct Tool</div>
      <div style={{display:'flex',alignItems:'center',gap:8,fontSize:11,color:'var(--text-dim)'}}>
        <span>{TOOLS[comp.correctTool]?.icon}</span>
        <span>{TOOLS[comp.correctTool]?.name}</span>
      </div>
    </div>
  )
}

function PrecisionGauge({ angle, difficulty, running }) {
  const W=280, H=165, cx=W/2, cy=H-15, R=112
  const d   = Math.max(0,Math.min(4, difficulty-1))
  const hw  = PRECISION_WINDOWS[d]/100
  const hc  = CRITICAL_WINDOWS[d]/100

  // angle is -1..1 mapped to full left..right of semicircle
  const toSvg = a => {
    const rad = (a * Math.PI/2) - Math.PI/2  // -π/2 is top
    return { x: cx + Math.cos(rad)*R, y: cy - Math.sin(rad)*R }
  }

  const arc = (start,end,r,col,sw) => {
    const s0=toSvg(start), s1=toSvg(end)
    const large=Math.abs(end-start)>1?1:0
    return <path d={`M${s0.x},${s0.y} A${r},${r} 0 ${large},1 ${s1.x},${s1.y}`} fill="none" stroke={col} strokeWidth={sw}/>
  }

  const np = toSvg(angle)

  return (
    <svg width={W} height={H} style={{display:'block',marginBottom:16}}>
      {arc(-1,1,R,'#1e1e3a',22)}
      {arc(-hw,hw,R,'rgba(200,160,32,0.3)',22)}
      {arc(-hc,hc,R,'rgba(200,160,32,0.72)',22)}
      {/* Tick marks */}
      {Array.from({length:19},(_,i)=>{
        const a=(i/18)*2-1, p0=toSvg(a), a2=a, big=i%3===0
        const pr=toSvg(a)
        const ir=toSvg(a) // we compute inner point differently
        const rad=(a*Math.PI/2)-Math.PI/2
        const r1=R+14, r2=R+(big?22:17)
        return <line key={i}
          x1={cx+Math.cos(rad)*r1} y1={cy-Math.sin(rad)*r1}
          x2={cx+Math.cos(rad)*r2} y2={cy-Math.sin(rad)*r2}
          stroke="#3a3a5a" strokeWidth={big?1.5:0.8}/>
      })}
      {/* Needle */}
      <line x1={cx} y1={cy} x2={np.x} y2={np.y} stroke={running?'#E02020':'var(--gold)'} strokeWidth="2.5" strokeLinecap="round"/>
      <circle cx={cx} cy={cy} r="6" fill="var(--gold)"/>
      {/* Labels */}
      <text x={cx-R-6} y={cy+5} fill="#3a3a5a" fontSize="10" textAnchor="end">MISS</text>
      <text x={cx+R+6} y={cy+5} fill="#3a3a5a" fontSize="10" textAnchor="start">MISS</text>
      <text x={cx} y={cy-R-10} fill="var(--gold)" fontSize="10" textAnchor="middle">PERFECT</text>
    </svg>
  )
}

// ── Styles ─────────────────────────────────────────────────────────────────
const s = {
  root:  {position:'fixed',inset:0,display:'flex',flexDirection:'column',overflow:'hidden'},
  header:{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'11px 22px',borderBottom:'1px solid var(--gold-dim)',flexShrink:0,background:'var(--dark)'},
  hCenter:{display:'flex',alignItems:'center',gap:8},
  hBrand:{fontFamily:'var(--font-ui)',fontWeight:200,fontSize:13,letterSpacing:'0.2em',color:'var(--gold)'},
  hSep:  {color:'var(--text-muted)'},
  hModel:{fontFamily:'var(--font-disp)',fontSize:14,color:'var(--text-dim)'},
  hRight:{fontSize:10,letterSpacing:'0.2em',color:'var(--text-muted)'},
  tabs:  {display:'flex',borderBottom:'1px solid var(--gold-dim)',flexShrink:0},
  tab:   {flex:1,padding:'9px 4px',textAlign:'center',fontSize:10,letterSpacing:'0.2em',color:'var(--text-muted)',borderBottom:'2px solid transparent',cursor:'default'},
  tabActive:{color:'var(--gold)',borderBottomColor:'var(--gold)',background:'var(--dark-2)'},
  tabDone:  {color:'var(--success)'},
  bench: {flex:1,display:'flex',minHeight:0,overflow:'hidden'},
  dropArea:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:14,gap:10,overflow:'hidden',position:'relative'},
  dropZone:{position:'relative',border:'1px solid var(--gold-dim)',transition:'border-color 0.2s,box-shadow 0.2s'},
  dropOver:{borderColor:'var(--gold)',boxShadow:'0 0 22px rgba(200,160,32,0.2)'},
  dropHint:{position:'absolute',bottom:10,left:'50%',transform:'translateX(-50%)',fontSize:10,letterSpacing:'0.2em',color:'var(--text-muted)',pointerEvents:'none',whiteSpace:'nowrap'},
  chips:  {display:'flex',flexWrap:'wrap',gap:5,justifyContent:'center',maxWidth:420},
  advBtn: {padding:'10px 30px',fontSize:11,letterSpacing:'0.22em'},
  info:   {width:276,flexShrink:0,borderLeft:'1px solid var(--gold-dim)',background:'var(--dark-2)',overflow:'hidden',display:'flex',flexDirection:'column'},
  infoPlaceholder:{flex:1,display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:24},
  tray:   {flexShrink:0,borderTop:'1px solid var(--gold-dim)',background:'var(--dark-2)'},
  trayLabel:{padding:'7px 14px 3px',fontSize:9,letterSpacing:'0.35em',color:'var(--gold)',textTransform:'uppercase'},
  trayScroll:{display:'flex',gap:7,padding:'7px 14px 12px',overflowX:'auto',scrollbarWidth:'thin'},
  partCard:  {flexShrink:0,width:108,padding:'11px 9px',background:'var(--dark-3)',border:'1px solid var(--gold-dim)',cursor:'grab',transition:'border-color 0.18s,transform 0.14s',display:'flex',flexDirection:'column',alignItems:'center',gap:5,userSelect:'none',WebkitUserSelect:'none'},
  partInstalled:{opacity:0.45,cursor:'default',borderColor:'rgba(76,175,80,0.2)'},
  partLocked:   {opacity:0.3,cursor:'not-allowed'},
  partName:{fontSize:9,letterSpacing:'0.1em',color:'var(--text-dim)',textAlign:'center'},
}

const ms = {
  label:   {fontSize:10,letterSpacing:'0.4em',color:'var(--gold)',textTransform:'uppercase',marginBottom:14},
  compRow: {display:'flex',alignItems:'center',gap:10,marginBottom:8},
  compName:{fontFamily:'var(--font-disp)',fontSize:20,color:'var(--text)'},
  hint:    {fontSize:11,color:'var(--text-muted)',letterSpacing:'0.1em',marginBottom:20},
  choice:  {background:'var(--dark-3)',border:'1px solid',borderColor:'var(--gold-dim)',padding:'13px 14px',cursor:'pointer',display:'flex',alignItems:'flex-start',gap:12,textAlign:'left',transition:'border-color 0.18s',width:'100%'},
  toolName:{fontSize:11,letterSpacing:'0.1em',color:'var(--text)',marginBottom:3},
  toolDesc:{fontSize:10,color:'var(--text-muted)',lineHeight:1.45},
  gaugeHint:{fontSize:11,letterSpacing:'0.15em',color:'var(--text-muted)',marginBottom:20},
}
