import { useEffect, useRef } from 'react'
import { drawIntroWatch } from '../utils/renderer'

export default function IntroScreen({ onEnter, collectionCount }) {
  const canvasRef = useRef(null)
  const rafRef    = useRef(null)

  useEffect(() => {
    const animate = () => { drawIntroWatch(canvasRef.current); rafRef.current = requestAnimationFrame(animate) }
    rafRef.current = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

  return (
    <div style={s.root}>
      <div style={s.bg} />
      <div style={s.layout}>
        <div style={s.watchWrap}>
          <canvas ref={canvasRef} width={360} height={360} style={s.canvas} />
        </div>
        <div style={s.text}>
          <div style={s.overline}>Est. MMXXVI · Haute Horlogerie</div>
          <h1 style={s.title}>HOROLOGY</h1>
          <div style={s.sub}>The Art of Mechanical Watchmaking</div>
          <div style={s.divider} />
          <p style={s.desc}>
            Apprentice at the world's greatest maisons.<br />
            Select a reference. Assemble movement, case, and bracelet by hand.<br />
            Build a timepiece worthy of the collection.
          </p>
          <button className="btn btn-primary" style={s.cta} onClick={onEnter}>
            Enter the Atelier
          </button>
          {collectionCount > 0 && (
            <div style={s.collNote}>{collectionCount} timepiece{collectionCount>1?'s':''} in your collection</div>
          )}
        </div>
      </div>
    </div>
  )
}

const s = {
  root: { position:'fixed', inset:0, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' },
  bg:   { position:'absolute', inset:0, background:'radial-gradient(ellipse at 58% 50%, rgba(200,160,32,0.07) 0%, transparent 65%)' },
  layout: { display:'flex', alignItems:'center', gap:72, padding:40, position:'relative', zIndex:1, maxWidth:860 },
  watchWrap: { flexShrink:0, filter:'drop-shadow(0 0 40px rgba(200,160,32,0.22))', animation:'floatWatch 6s ease-in-out infinite' },
  canvas: { display:'block' },
  text: { maxWidth:360 },
  overline: { fontFamily:'var(--font-ui)', fontWeight:100, fontSize:10, letterSpacing:'0.5em', color:'var(--gold)', marginBottom:12, textTransform:'uppercase' },
  title: { fontFamily:'var(--font-disp)', fontWeight:300, fontSize:68, lineHeight:1, letterSpacing:'0.18em', color:'var(--text)', marginBottom:8 },
  sub: { fontFamily:'var(--font-ui)', fontWeight:100, fontSize:11, letterSpacing:'0.35em', color:'var(--text-dim)', marginBottom:24, textTransform:'uppercase' },
  divider: { height:1, background:'linear-gradient(90deg,var(--gold-dark),transparent)', marginBottom:24 },
  desc: { fontFamily:'var(--font-disp)', fontWeight:300, fontSize:16, lineHeight:1.85, color:'var(--text-dim)', marginBottom:32 },
  cta: { width:'100%', padding:'14px', fontSize:12, letterSpacing:'0.3em' },
  collNote: { marginTop:14, textAlign:'center', fontSize:10, letterSpacing:'0.15em', color:'var(--text-muted)' },
}

// inject float keyframe once
if (typeof document !== 'undefined' && !document.getElementById('floatKF')) {
  const st = document.createElement('style')
  st.id = 'floatKF'
  st.textContent = '@keyframes floatWatch{0%,100%{transform:translateY(0) rotate(-2deg)}50%{transform:translateY(-12px) rotate(2deg)}}'
  document.head.appendChild(st)
}
