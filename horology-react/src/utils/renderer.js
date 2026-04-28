// ─── COLOUR HELPERS ─────────────────────────────────────────────────────────
function hexToRgb(hex) {
  hex = hex.replace('#', '')
  if (hex.length === 3) hex = hex.split('').map(c => c+c).join('')
  const n = parseInt(hex, 16)
  return [(n>>16)&255, (n>>8)&255, n&255]
}
function rgbToHex(r,g,b) {
  return '#' + [r,g,b].map(v => Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('')
}
function lighten(hex, a) { const [r,g,b]=hexToRgb(hex); return rgbToHex(r+a,g+a,b+a) }
function darken(hex, a)  { return lighten(hex, -a) }

function caseColor(model) {
  const m = (model?.material||'').toLowerCase()
  if (m.includes('gold'))     return '#C8A020'
  if (m.includes('titanium')) return '#8A8A9A'
  if (m.includes('platinum')) return '#A8A8B8'
  return '#B0B0B8'
}
function dialColor(model) {
  return ({ Black:'#111118', Blue:'#0a1a3a', Silver:'#d0d0d8',
            White:'#f0ede8', Champagne:'#c8b880', Green:'#0a2010',
            Grey:'#404048', Skeleton:'transparent' })[model?.dial] || '#111118'
}
function bezelColor(model) {
  return ({ Black:'#1a1a1a', Blue:'#1a2a4a', Silver:'#2a2a2a',
            White:'#2a2a2a', Champagne:'#2a2a2a', Green:'#0a2010',
            Grey:'#2a2a2a', Skeleton:'#1a1a1a' })[model?.dial] || '#2a2a2a'
}
function indexColor(model) {
  return ['Silver','White','Champagne'].includes(model?.dial) ? '#2a2a2a' : '#E8E8E8'
}

// ─── DRAW WATCH (full assembled watch) ──────────────────────────────────────
export function drawWatch({ canvas, brand, model, parts = [], showHands = false, h = 10, m = 10, s = 30 }) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0, 0, W, H)
  const cx = W/2, cy = H/2, r = Math.min(W,H)*0.42
  const has = id => parts.includes(id)
  const cc = caseColor(model), dc = dialColor(model), bc = bezelColor(model), ic = indexColor(model)

  // Shadow
  const sh = ctx.createRadialGradient(cx+5,cy+7,r*0.2,cx+3,cy+5,r*1.2)
  sh.addColorStop(0,'rgba(0,0,0,0.5)'); sh.addColorStop(1,'rgba(0,0,0,0)')
  ctx.fillStyle=sh; ctx.beginPath(); ctx.ellipse(cx+4,cy+8,r*1.1,r*1.05,0,0,Math.PI*2); ctx.fill()

  // Lugs / strap base
  if (has('fitting')) {
    const lw=r*0.38, lh=r*0.28
    ctx.fillStyle = has('links') ? darken(cc,20) : '#4a3020'
    [[cy-r*0.85],[cy+r*0.55]].forEach(([ly]) => {
      ctx.beginPath()
      if(ctx.roundRect) ctx.roundRect(cx-lw,ly,lw*2,lh,4); else ctx.rect(cx-lw,ly,lw*2,lh)
      ctx.fill()
    })
  }

  // Bracelet body
  if (has('links')) {
    ctx.fillStyle = darken(cc,10)
    ;[cy+r*0.65, cy-r*0.95].forEach(ly => {
      ctx.beginPath()
      if(ctx.roundRect) ctx.roundRect(cx-r*0.28,ly,r*0.56,r*0.4,3); else ctx.rect(cx-r*0.28,ly,r*0.56,r*0.4)
      ctx.fill()
      ctx.strokeStyle = darken(cc,15); ctx.lineWidth=1
      for(let i=1;i<=3;i++){
        ctx.beginPath(); ctx.moveTo(cx-r*0.28,ly+r*0.4/4*i); ctx.lineTo(cx+r*0.28,ly+r*0.4/4*i); ctx.stroke()
      }
    })
  }

  // Case body
  if (has('case')) {
    const cg = ctx.createLinearGradient(cx-r,cy,cx+r,cy)
    cg.addColorStop(0,darken(cc,30)); cg.addColorStop(0.3,lighten(cc,20))
    cg.addColorStop(0.5,lighten(cc,40)); cg.addColorStop(0.7,lighten(cc,20)); cg.addColorStop(1,darken(cc,30))
    ctx.fillStyle=cg; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill()
  }

  // Bezel
  if (has('bezel')) {
    const bg = ctx.createLinearGradient(cx-r,cy,cx+r,cy)
    bg.addColorStop(0,darken(bc,20)); bg.addColorStop(0.5,lighten(bc,30)); bg.addColorStop(1,darken(bc,20))
    ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(cx,cy,r*0.97,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle=ic; ctx.lineWidth=1
    for(let i=0;i<60;i++){
      const a=(i/60)*Math.PI*2-Math.PI/2, len=i%5===0?r*0.05:r*0.025
      ctx.beginPath(); ctx.moveTo(cx+Math.cos(a)*r*0.92,cy+Math.sin(a)*r*0.92)
      ctx.lineTo(cx+Math.cos(a)*(r*0.92-len),cy+Math.sin(a)*(r*0.92-len)); ctx.stroke()
    }
    ctx.fillStyle='#FFD700'; ctx.beginPath()
    ctx.moveTo(cx,cy-r*0.89); ctx.lineTo(cx-4,cy-r*0.94); ctx.lineTo(cx+4,cy-r*0.94); ctx.closePath(); ctx.fill()
  }

  // Crystal tint
  if (has('crystal')) {
    ctx.fillStyle='rgba(180,220,255,0.04)'; ctx.beginPath(); ctx.arc(cx,cy,r*0.84,0,Math.PI*2); ctx.fill()
  }

  // Dial
  if (has('dial')) {
    if (model?.dial==='Skeleton') {
      ctx.strokeStyle=lighten(cc,10); ctx.lineWidth=2; ctx.beginPath(); ctx.arc(cx,cy,r*0.82,0,Math.PI*2); ctx.stroke()
      ctx.strokeStyle=lighten(cc,30); ctx.lineWidth=1.5
      ctx.beginPath(); ctx.arc(cx,cy,r*0.45,0,Math.PI*2); ctx.stroke()
      ctx.beginPath(); ctx.moveTo(cx-r*0.6,cy); ctx.lineTo(cx+r*0.6,cy); ctx.stroke()
    } else {
      const dg = ctx.createRadialGradient(cx-r*0.2,cy-r*0.2,0,cx,cy,r*0.82)
      dg.addColorStop(0,lighten(dc==='transparent'?'#111118':dc,15)); dg.addColorStop(1,dc==='transparent'?'#111118':dc)
      ctx.fillStyle=dg; ctx.beginPath(); ctx.arc(cx,cy,r*0.82,0,Math.PI*2); ctx.fill()
    }

    // Hour indices
    for(let i=0;i<12;i++){
      const a=(i/12)*Math.PI*2-Math.PI/2, big=i%3===0
      ctx.fillStyle=ic; ctx.save()
      ctx.translate(cx+Math.cos(a)*r*0.68,cy+Math.sin(a)*r*0.68); ctx.rotate(a+Math.PI/2)
      if(big) ctx.fillRect(-r*0.025,-r*0.055,r*0.05,r*0.04)
      else    ctx.fillRect(-r*0.015,-r*0.04,r*0.03,r*0.03)
      ctx.restore()
    }

    // Brand name
    if(brand){
      ctx.fillStyle=ic; ctx.textAlign='center'; ctx.font=`${r*0.075}px 'Josefin Sans',sans-serif`
      ctx.fillText(brand.name,cx,cy-r*0.28)
      ctx.globalAlpha=0.6; ctx.font=`${r*0.045}px 'Josefin Sans',sans-serif`
      ctx.fillText((model?.type||'').toUpperCase(),cx,cy-r*0.18); ctx.globalAlpha=1
    }

    // Date window
    if(model?.complication?.includes('Date')){
      const dw=r*0.08,dh=r*0.06
      ctx.fillStyle='#f0ede8'; ctx.fillRect(cx+r*0.42,cy-dh/2,dw,dh)
      ctx.strokeStyle=darken(cc,10); ctx.lineWidth=0.5; ctx.strokeRect(cx+r*0.42,cy-dh/2,dw,dh)
      ctx.fillStyle='#111'; ctx.font=`bold ${r*0.06}px 'Josefin Sans',sans-serif`; ctx.textAlign='center'
      ctx.fillText(new Date().getDate(),cx+r*0.46,cy+r*0.025)
    }
  }

  // Hands
  if(has('hands') && showHands){
    const hA=((h%12)/12+m/720)*Math.PI*2-Math.PI/2
    const mA=(m/60+s/3600)*Math.PI*2-Math.PI/2
    const sA=(s/60)*Math.PI*2-Math.PI/2
    drawHand(ctx,cx,cy,hA,r*0.45,r*0.04,ic)
    drawHand(ctx,cx,cy,mA,r*0.62,r*0.028,ic)
    drawSecHand(ctx,cx,cy,sA,r*0.72)
    ctx.fillStyle=lighten(cc,10); ctx.beginPath(); ctx.arc(cx,cy,r*0.03,0,Math.PI*2); ctx.fill()
  }

  // Crown
  if(has('crown')){
    const cx2=cx+r*0.94,cw=r*0.1,ch=r*0.15
    const crg=ctx.createLinearGradient(cx2,cy,cx2+cw,cy)
    crg.addColorStop(0,lighten(cc,20)); crg.addColorStop(1,darken(cc,20))
    ctx.fillStyle=crg
    ctx.beginPath()
    if(ctx.roundRect) ctx.roundRect(cx2,cy-ch/2,cw,ch,2); else ctx.rect(cx2,cy-ch/2,cw,ch)
    ctx.fill()
    ctx.strokeStyle=darken(cc,20); ctx.lineWidth=0.8
    // Knurling lines
    for(let i=0;i<6;i++){const y=cy-ch/2+ch/6*i+ch/12;ctx.beginPath();ctx.moveTo(cx2,y);ctx.lineTo(cx2+cw,y);ctx.stroke()}
  }

  // Glass reflection
  const rf=ctx.createLinearGradient(cx-r*0.7,cy-r*0.7,cx+r*0.3,cy+r*0.2)
  rf.addColorStop(0,'rgba(255,255,255,0.12)'); rf.addColorStop(0.4,'rgba(255,255,255,0.02)'); rf.addColorStop(1,'rgba(255,255,255,0)')
  ctx.fillStyle=rf; ctx.beginPath(); ctx.arc(cx,cy,r*0.84,0,Math.PI*2); ctx.fill()
}

function drawHand(ctx,cx,cy,angle,len,w,color){
  ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle)
  ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=4; ctx.shadowOffsetX=1; ctx.shadowOffsetY=1
  ctx.fillStyle=color; ctx.beginPath()
  ctx.moveTo(0,0); ctx.lineTo(-w/2,-len*0.15); ctx.lineTo(-w*0.3,-len)
  ctx.lineTo(0,-len-w*0.1); ctx.lineTo(w*0.3,-len); ctx.lineTo(w/2,-len*0.15)
  ctx.closePath(); ctx.fill()
  ctx.fillStyle='rgba(200,255,200,0.6)'; ctx.fillRect(-w*0.2,-len*0.9,w*0.4,len*0.6)
  ctx.fillStyle=darken(color,20); ctx.fillRect(-w*0.3,0,w*0.6,len*0.1)
  ctx.restore()
}

function drawSecHand(ctx,cx,cy,angle,len){
  ctx.save(); ctx.translate(cx,cy); ctx.rotate(angle)
  ctx.shadowColor='rgba(255,0,0,0.3)'; ctx.shadowBlur=3
  ctx.strokeStyle='#E02020'; ctx.lineWidth=1.2; ctx.lineCap='round'
  ctx.beginPath(); ctx.moveTo(0,len*0.25); ctx.lineTo(0,-len); ctx.stroke()
  ctx.fillStyle='#E02020'; ctx.beginPath(); ctx.arc(0,-len*0.85,len*0.04,0,Math.PI*2); ctx.fill()
  ctx.restore()
}

// ─── DRAW MOVEMENT ──────────────────────────────────────────────────────────
export function drawMovement({ canvas, installed = [], tick = 0 }) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  const W = canvas.width, H = canvas.height
  ctx.clearRect(0,0,W,H)
  const cx=W/2, cy=H/2, r=Math.min(W,H)*0.42
  const has = id => installed.includes(id)

  // Movement plate
  const pg=ctx.createRadialGradient(cx-r*0.2,cy-r*0.2,0,cx,cy,r)
  pg.addColorStop(0,'#d4b870'); pg.addColorStop(0.6,'#b8922a'); pg.addColorStop(1,'#8a6a10')
  ctx.fillStyle=pg; ctx.beginPath(); ctx.arc(cx,cy,r,0,Math.PI*2); ctx.fill()
  ctx.strokeStyle='#C8A020'; ctx.lineWidth=2; ctx.stroke()

  // Côtes de Genève stripes
  ctx.save(); ctx.globalAlpha=0.07; ctx.strokeStyle='#fff'; ctx.lineWidth=3
  for(let i=-20;i<20;i++){
    ctx.beginPath(); ctx.moveTo(cx-r+i*r*0.12,cy-r); ctx.lineTo(cx-r+i*r*0.12+r*0.5,cy+r); ctx.stroke()
  }
  ctx.restore()

  // Base jewels
  [[cx,cy],[cx+r*0.25,cy-r*0.2],[cx-r*0.25,cy+r*0.2],[cx+r*0.1,cy+r*0.3],[cx-r*0.1,cy-r*0.3]]
    .forEach(([jx,jy]) => {
      ctx.fillStyle='#8B0000'; ctx.beginPath(); ctx.arc(jx,jy,r*0.025,0,Math.PI*2); ctx.fill()
      ctx.strokeStyle='#FFD700'; ctx.lineWidth=1; ctx.stroke()
    })

  // Mainspring (barrel)
  if(has('mainspring')){
    ctx.save(); ctx.translate(cx-r*0.28,cy-r*0.12); ctx.rotate(tick*0.008)
    const bg=ctx.createRadialGradient(0,0,0,0,0,r*0.28)
    bg.addColorStop(0,'#d4c060'); bg.addColorStop(1,'#8a6a10')
    ctx.fillStyle=bg; ctx.beginPath(); ctx.arc(0,0,r*0.28,0,Math.PI*2); ctx.fill()
    ctx.strokeStyle='#C8A020'; ctx.lineWidth=2; ctx.stroke()
    // Archimedes spiral
    ctx.strokeStyle='#FFD700'; ctx.lineWidth=1.5
    for(let i=1;i<=5;i++){
      ctx.beginPath()
      for(let a=0;a<=Math.PI*2;a+=0.05){
        const sr=(r*0.05)+(i-1)*(r*0.04)+a*r*0.007
        a===0?ctx.moveTo(Math.cos(a)*sr,Math.sin(a)*sr):ctx.lineTo(Math.cos(a)*sr,Math.sin(a)*sr)
      }
      ctx.stroke()
    }
    // Ratchet teeth
    for(let i=0;i<16;i++){
      const a=(i/16)*Math.PI*2
      ctx.fillStyle='#C8A020'; ctx.beginPath()
      ctx.moveTo(Math.cos(a)*r*0.27,Math.sin(a)*r*0.27)
      ctx.lineTo(Math.cos(a+0.2)*r*0.3,Math.sin(a+0.2)*r*0.3)
      ctx.lineTo(Math.cos(a+0.4)*r*0.27,Math.sin(a+0.4)*r*0.27)
      ctx.closePath(); ctx.fill()
    }
    ctx.restore()
  }

  if(has('barrel')){
    ctx.fillStyle='rgba(200,170,80,0.3)'; ctx.strokeStyle='#C8A020'; ctx.lineWidth=1
    ctx.beginPath(); ctx.ellipse(cx-r*0.28,cy-r*0.12,r*0.30,r*0.30,0,0,Math.PI*2); ctx.fill(); ctx.stroke()
  }

  if(has('geartrain')){
    const gears=[
      {x:cx+r*0.05,y:cy,r:r*0.18,t:20,ratio:1,esc:false,c:'#d4b870'},
      {x:cx+r*0.32,y:cy-r*0.18,r:r*0.12,t:15,ratio:-1.5,esc:false,c:'#c4a860'},
      {x:cx+r*0.26,y:cy+r*0.28,r:r*0.1,t:12,ratio:2.2,esc:false,c:'#c4a860'},
      {x:cx-r*0.05,y:cy+r*0.35,r:r*0.08,t:10,ratio:-3.1,esc:true,c:'#4466CC'},
    ]
    gears.forEach(g=>drawGear(ctx,g.x,g.y,g.r,g.t,g.c,tick*g.ratio,g.esc))
  }

  if(has('escapement')){
    const fx=cx-r*0.05,fy=cy+r*0.1,fa=Math.sin(tick*0.22)*0.4
    ctx.save(); ctx.translate(fx,fy); ctx.rotate(fa)
    ctx.fillStyle='#C8A020'; ctx.beginPath()
    ctx.moveTo(0,0); ctx.lineTo(-r*0.05,-r*0.22); ctx.lineTo(r*0.05,-r*0.22); ctx.closePath(); ctx.fill()
    ctx.fillStyle='#FF4444'; ctx.fillRect(-r*0.06,-r*0.24,r*0.04,r*0.04); ctx.fillRect(r*0.02,-r*0.24,r*0.04,r*0.04)
    ctx.restore()
  }

  if(has('balance')){
    const bx=cx-r*0.32,by=cy+r*0.25,ba=Math.sin(tick*0.22)*Math.PI*0.42
    ctx.save(); ctx.translate(bx,by); ctx.rotate(ba)
    // Hairspring
    ctx.strokeStyle='#FFD700'; ctx.lineWidth=0.5
    for(let i=1;i<=6;i++){
      ctx.beginPath()
      for(let a=0;a<=Math.PI*2;a+=0.05){
        const sr=i*r*0.02+a*r*0.003
        a===0?ctx.moveTo(Math.cos(a)*sr,Math.sin(a)*sr):ctx.lineTo(Math.cos(a)*sr,Math.sin(a)*sr)
      }
      ctx.stroke()
    }
    ctx.strokeStyle='#C8A020'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,0,r*0.18,0,Math.PI*2); ctx.stroke()
    ctx.strokeStyle='#b8a050'; ctx.lineWidth=1.5
    for(let i=0;i<3;i++){const a=(i/3)*Math.PI*2;ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(Math.cos(a)*r*0.18,Math.sin(a)*r*0.18);ctx.stroke()}
    ctx.fillStyle='#888'
    for(let i=0;i<6;i++){const a=(i/6)*Math.PI*2;ctx.beginPath();ctx.arc(Math.cos(a)*r*0.16,Math.sin(a)*r*0.16,r*0.012,0,Math.PI*2);ctx.fill()}
    ctx.restore()
  }

  if(has('rotor')){
    ctx.save(); ctx.translate(cx,cy); ctx.rotate(tick*0.018)
    const rg=ctx.createLinearGradient(-r*0.3,0,r*0.3,0)
    rg.addColorStop(0,'#1a1a2a'); rg.addColorStop(1,'#3a3a5a')
    ctx.fillStyle=rg; ctx.globalAlpha=0.85
    ctx.beginPath(); ctx.arc(0,0,r*0.38,0,Math.PI); ctx.closePath(); ctx.fill()
    ctx.globalAlpha=1; ctx.strokeStyle='#C8A020'; ctx.lineWidth=2
    ctx.beginPath(); ctx.arc(0,0,r*0.38,0,Math.PI); ctx.stroke()
    ctx.fillStyle='#C8A020'; ctx.font=`bold ${r*0.07}px 'Josefin Sans',sans-serif`; ctx.textAlign='center'
    ctx.fillText('AUTOMATIC',0,-r*0.12)
    ctx.restore()
  }

  // Parts counter
  const mvParts=['mainspring','barrel','geartrain','escapement','balance','rotor']
  const count=mvParts.filter(id=>has(id)).length
  ctx.fillStyle='rgba(0,0,0,0.65)'
  ctx.beginPath()
  if(ctx.roundRect) ctx.roundRect(8,8,200,28,4); else ctx.rect(8,8,200,28)
  ctx.fill()
  ctx.fillStyle='#C8A020'; ctx.font=`300 11px 'Josefin Sans',sans-serif`; ctx.textAlign='left'
  ctx.fillText(count===6?'✓ MOVEMENT COMPLETE':`${count} / 6 MOVEMENT PARTS`,16,27)
}

function drawGear(ctx,x,y,r,teeth,color,angle,isEscape){
  ctx.save(); ctx.translate(x,y); ctx.rotate(angle)
  const gg=ctx.createRadialGradient(0,0,0,0,0,r)
  gg.addColorStop(0,lighten(color,20)); gg.addColorStop(1,color)
  ctx.fillStyle=gg; ctx.beginPath(); ctx.arc(0,0,r*0.8,0,Math.PI*2); ctx.fill()
  ctx.strokeStyle=isEscape?'#4488FF':darken(color,20); ctx.lineWidth=r*0.12
  for(let i=0;i<5;i++){const a=(i/5)*Math.PI*2;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*0.2,Math.sin(a)*r*0.2);ctx.lineTo(Math.cos(a)*r*0.75,Math.sin(a)*r*0.75);ctx.stroke()}
  ctx.fillStyle=isEscape?'#4466CC':color
  for(let i=0;i<teeth;i++){
    const a=(i/teeth)*Math.PI*2,a2=((i+0.5)/teeth)*Math.PI*2
    ctx.beginPath(); ctx.moveTo(Math.cos(a)*r*0.82,Math.sin(a)*r*0.82)
    ctx.lineTo(Math.cos(a2)*r,Math.sin(a2)*r); ctx.lineTo(Math.cos(a+Math.PI*2/teeth)*r*0.82,Math.sin(a+Math.PI*2/teeth)*r*0.82); ctx.closePath(); ctx.fill()
  }
  ctx.fillStyle='#8B0000'; ctx.beginPath(); ctx.arc(0,0,r*0.15,0,Math.PI*2); ctx.fill()
  ctx.strokeStyle='#FFD700'; ctx.lineWidth=1; ctx.stroke()
  ctx.restore()
}

// ─── DRAW INTRO WATCH (fully assembled, live time) ──────────────────────────
export function drawIntroWatch(canvas) {
  if (!canvas) return
  const now = new Date()
  drawWatch({
    canvas, brand: { name: 'HOROLOGY' },
    model: { dial: 'Black', material: 'Stainless Steel', type: 'Sport', complication: 'Date' },
    parts: ['case','bezel','crystal','dial','hands','crown','fitting','links','caseback'],
    showHands: true,
    h: now.getHours(), m: now.getMinutes(),
    s: now.getSeconds() + now.getMilliseconds()/1000,
  })
}
