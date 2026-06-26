let audioCtx = null
let tickInterval = null
let nextTime = 0

function getCtx() {
  if (!audioCtx || audioCtx.state === 'closed') {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)()
  }
  return audioCtx
}

function scheduleTick(ac, time, isTock) {
  // Oscillator component
  const osc = ac.createOscillator()
  const oscGain = ac.createGain()
  osc.connect(oscGain); oscGain.connect(ac.destination)
  osc.frequency.setValueAtTime(isTock ? 2100 : 2600, time)
  osc.frequency.exponentialRampToValueAtTime(isTock ? 700 : 900, time + 0.022)
  oscGain.gain.setValueAtTime(0.12, time)
  oscGain.gain.exponentialRampToValueAtTime(0.001, time + 0.022)
  osc.start(time); osc.stop(time + 0.022)

  // Noise component for mechanical texture
  const bufSize = ac.sampleRate * 0.02
  const buf = ac.createBuffer(1, bufSize, ac.sampleRate)
  const data = buf.getChannelData(0)
  for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1)
  const noise = ac.createBufferSource()
  const noiseGain = ac.createGain()
  noise.buffer = buf
  noise.connect(noiseGain); noiseGain.connect(ac.destination)
  noiseGain.gain.setValueAtTime(0.025, time)
  noiseGain.gain.exponentialRampToValueAtTime(0.001, time + 0.02)
  noise.start(time); noise.stop(time + 0.02)
}

export function startTicking() {
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') ac.resume()
    nextTime = ac.currentTime + 0.05
    let isTock = false
    const INTERVAL = 0.125 // 8 ticks/sec = 28,800 VPH

    function schedule() {
      while (nextTime < ac.currentTime + 0.4) {
        scheduleTick(ac, nextTime, isTock)
        isTock = !isTock
        nextTime += INTERVAL
      }
    }
    schedule()
    tickInterval = setInterval(schedule, 100)
  } catch (e) {
    console.warn('Audio unavailable', e)
  }
}

export function stopTicking() {
  if (tickInterval) { clearInterval(tickInterval); tickInterval = null }
  try {
    if (audioCtx && audioCtx.state !== 'closed') {
      audioCtx.close()
      audioCtx = null
    }
  } catch (e) {}
}

export function playInstallSound(difficulty = 1) {
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') ac.resume()
    const t = ac.currentTime
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.connect(gain); gain.connect(ac.destination)
    const freq = 400 + difficulty * 120
    osc.frequency.setValueAtTime(freq, t)
    osc.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.05)
    gain.gain.setValueAtTime(0.08, t)
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12)
    osc.start(t); osc.stop(t + 0.12)
  } catch (e) {}
}

export function playCriticalSound() {
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') ac.resume()
    const t = ac.currentTime
    // Three-note ascending chime
    [880, 1100, 1320].forEach((f, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.connect(gain); gain.connect(ac.destination)
      const st = t + i * 0.08
      osc.frequency.setValueAtTime(f, st)
      gain.gain.setValueAtTime(0.06, st)
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.18)
      osc.start(st); osc.stop(st + 0.18)
    })
  } catch (e) {}
}

export function playRevealFanfare() {
  try {
    const ac = getCtx()
    if (ac.state === 'suspended') ac.resume()
    const t = ac.currentTime
    [440, 554, 659, 880].forEach((f, i) => {
      const osc = ac.createOscillator()
      const gain = ac.createGain()
      osc.type = 'sine'
      osc.connect(gain); gain.connect(ac.destination)
      const st = t + i * 0.12
      osc.frequency.setValueAtTime(f, st)
      gain.gain.setValueAtTime(0.05, st)
      gain.gain.exponentialRampToValueAtTime(0.001, st + 0.3)
      osc.start(st); osc.stop(st + 0.3)
    })
  } catch (e) {}
}
