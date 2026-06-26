import { useEffect, useRef, useState } from 'react'
import { drawWatch } from '../utils/renderer'
import { playRevealFanfare } from '../utils/audio'

const ALL_PARTS = ['case','bezel','crystal','dial','hands','crown','fitting','links','caseback']

export default function RevealScreen({ brand, model, onComplete }) {
  const [phase,  setPhase]  = useState('dark')  // dark|glow|reveal
  const cvRef   = useRef(null)
  const rafRef  = useRef(null)

  useEffect(() => {
    const t1 = setTimeout(() => { setPhase('glow') }, 1600)
    const t2 = setTimeout(() => { setPhase('reveal'); playRevealFanfare() }, 3200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  useEffect(() => {
    if (phase !== 'reveal') return
    const draw = () => {
      const now = new Date()
      drawWatch({ canvas:cvRef.current, brand, model, parts:ALL_PARTS, showHands:true,
        h:now.getHours(), m:now.getMinutes(), s:now.getSeconds()+now.getMilliseconds()/1000 })
      rafRef.current = requestAnimationFrame(draw)
    }
    rafRef.current = requestAnimationFrame(draw)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase, brand, model])

  return (
    <div style={{ ...s.root, cursor: phase==='reveal'?'pointer':'default' }} onClick={phase==='reveal'?onComplete:undefined}>
      {phase === 'dark' && (
        <div style={s.dark}>
          <div style={s.darkBrand}>{brand?.name}</div>
          <div style={s.darkRef}>{model?.name} · Ref. {model?.ref}</div>
        </div>
      )}
      {phase === 'glow' && (
        <div style={s.glow}>
          <div style={s.glowRing}/>
          <div style={s.glowText}>Finalising</div>
        </div>
      )}
      {phase === 'reveal' && (
        <div style={s.reveal}>
          <div style={s.watchWrap}>
            <canvas ref={cvRef} width={420} height={420} style={s.canvas}/>
            <div style={s.watchGlow}/>
          </div>
          <div style={s.caption}>
            <div style={s.capBrand}>{brand?.name}</div>
            <div style={s.capModel}>{model?.name}</div>
            <div style={s.capContinue}>Tap to see results →</div>
          </div>
        </div>
      )}
    </div>
  )
}

const s = {
  root:   {position:'fixed',inset:0,background:'#000',display:'flex',alignItems:'center',justifyContent:'center',overflow:'hidden'},
  dark:   {textAlign:'center',animation:'fadeIn 0.8s ease'},
  darkBrand:{fontFamily:'var(--font-disp)',fontWeight:300,fontSize:52,letterSpacing:'0.3em',color:'var(--gold)',marginBottom:14},
  darkRef: {fontFamily:'var(--font-ui)',fontWeight:100,fontSize:13,letterSpacing:'0.4em',color:'var(--text-dim)',textTransform:'uppercase'},
  glow:    {display:'flex',flexDirection:'column',alignItems:'center',gap:22},
  glowRing:{width:110,height:110,borderRadius:'50%',border:'1px solid var(--gold)',animation:'pulse 1s ease-in-out infinite'},
  glowText:{fontSize:10,letterSpacing:'0.5em',color:'var(--text-muted)',textTransform:'uppercase'},
  reveal:  {display:'flex',flexDirection:'column',alignItems:'center',gap:28,animation:'fadeIn 0.8s ease'},
  watchWrap:{position:'relative'},
  canvas:  {display:'block',filter:'drop-shadow(0 0 40px rgba(200,160,32,0.32))'},
  watchGlow:{position:'absolute',inset:-50,background:'radial-gradient(ellipse at center,rgba(200,160,32,0.18) 0%,transparent 70%)',pointerEvents:'none',animation:'pulse 3s ease-in-out infinite'},
  caption: {textAlign:'center'},
  capBrand:{fontFamily:'var(--font-disp)',fontWeight:300,fontSize:30,letterSpacing:'0.25em',color:'var(--gold)',marginBottom:6},
  capModel:{fontFamily:'var(--font-disp)',fontStyle:'italic',fontSize:20,color:'var(--text-dim)',marginBottom:14},
  capContinue:{fontSize:10,letterSpacing:'0.35em',color:'var(--text-muted)',textTransform:'uppercase'},
}
