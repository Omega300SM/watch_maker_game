import { useState, useCallback, useRef } from 'react'
import {
  INSTALL_ORDER, PART_MAP, COMPONENTS, getGrade, calcFinalScore,
  getDailyObjectives, OBJECTIVE_POOL,
} from '../data/gameData'

// ─── STORAGE ─────────────────────────────────────────────────────────────────
function load() {
  try {
    return {
      collection:  JSON.parse(localStorage.getItem('horology_collection')  || '[]'),
      prestige:    JSON.parse(localStorage.getItem('horology_prestige')    || '{}'),
      completedObj:JSON.parse(localStorage.getItem('horology_obj_done')    || '[]'),
    }
  } catch { return { collection: [], prestige: {}, completedObj: [] } }
}

function save(collection, prestige, completedObj) {
  try {
    localStorage.setItem('horology_collection',  JSON.stringify(collection))
    localStorage.setItem('horology_prestige',    JSON.stringify(prestige))
    localStorage.setItem('horology_obj_done',    JSON.stringify(completedObj))
  } catch(e) { console.warn('Storage error', e) }
}

// ─── HELPER ──────────────────────────────────────────────────────────────────
function getComp(id) {
  return Object.values(COMPONENTS).flat().find(c => c.id === id)
}

function checkObjectives(daily, completedObj, entry, scoreState) {
  const today = new Date().toDateString()
  const doneToday = completedObj.filter(c => c.date === today).map(c => c.id)
  const out = [...completedObj]
  daily.forEach(obj => {
    if (doneToday.includes(obj.id)) return
    const p =
      obj.id === 'any'      ? true :
      obj.id === 'dress'    ? ['Dress','Grand Complication'].includes(entry.model?.type) :
      obj.id === 'diver'    ? entry.model?.type === 'Dive' :
      obj.id === 'chrono'   ? entry.model?.type === 'Chronograph' :
      obj.id === 'mint'     ? ['MINT','MASTERPIECE'].includes(entry.grade) :
      obj.id === 'patek'    ? entry.brand?.id === 'patek' :
      obj.id === 'novac'    ? scoreState.toolTotal > 0 && scoreState.toolCorrect === scoreState.toolTotal :
      obj.id === 'crits'    ? scoreState.criticals >= 3 :
      obj.id === 'vacheron' ? entry.brand?.id === 'vacheron' :
      obj.id === 'speed'    ? entry.duration < 240 : false
    if (p) out.push({ id: obj.id, date: today })
  })
  return out
}

// ─── HOOK ────────────────────────────────────────────────────────────────────
export function useGameState() {
  const stored = load()
  const toastTimer = useRef(null)

  const [state, setState] = useState({
    screen: 'intro',              // intro|brand|model|assembly|reveal|complete|drawer
    brand:  null,
    model:  null,
    phase:  'movement',           // movement|casing|strap
    installed:  [],               // component IDs installed
    parts:      [],               // visual part IDs for renderer
    score: {
      precisionSum: 0, precisionCount: 0,
      toolCorrect: 0,  toolTotal: 0,
      criticals: 0,    startTime: null,
    },
    collection:   stored.collection,
    prestige:     stored.prestige,
    dailyObj:     getDailyObjectives(),
    completedObj: stored.completedObj,
    toast:        null,
    lastEntry:    null,
  })

  // ── helpers ─────────────────────────────────────────────────────────────
  const upd = useCallback(patch =>
    setState(s => ({ ...s, ...(typeof patch === 'function' ? patch(s) : patch) })), [])

  const toast = useCallback((msg, ms = 3200) => {
    if (toastTimer.current) clearTimeout(toastTimer.current)
    upd({ toast: msg })
    toastTimer.current = setTimeout(() => upd({ toast: null }), ms)
  }, [upd])

  // ── navigation ──────────────────────────────────────────────────────────
  const goBrand    = useCallback(() => upd({ screen: 'brand' }), [upd])
  const goDrawer   = useCallback(() => upd({ screen: 'drawer' }), [upd])
  const selectBrand = useCallback(brand  => upd({ brand, screen: 'model' }), [upd])

  const selectModel = useCallback(model => upd({
    model, screen: 'assembly', phase: 'movement',
    installed: [], parts: [],
    score: { precisionSum:0, precisionCount:0, toolCorrect:0, toolTotal:0, criticals:0, startTime: Date.now() },
  }), [upd])

  // ── install a component ──────────────────────────────────────────────────
  // Returns null on success, or an error message string on failure
  const install = useCallback((compId, precScore, toolOk, wasCritical) => {
    let errorMsg = null
    setState(s => {
      if (s.installed.includes(compId)) return s
      const order = INSTALL_ORDER[s.phase] || []
      const idx = order.indexOf(compId)
      if (idx < 0) { errorMsg = 'Component not in current phase'; return s }
      if (idx > 0 && !s.installed.includes(order[idx-1])) {
        const blocker = getComp(order[idx-1])
        errorMsg = `Install ${blocker?.name || order[idx-1]} first`
        return s
      }
      const newInstalled = [...s.installed, compId]
      const partId = PART_MAP[compId]
      const newParts = partId ? [...s.parts, partId] : [...s.parts]
      return {
        ...s,
        installed: newInstalled,
        parts: newParts,
        score: {
          ...s.score,
          precisionSum:  s.score.precisionSum + (precScore || 75),
          precisionCount: s.score.precisionCount + 1,
          toolCorrect:   s.score.toolCorrect + (toolOk ? 1 : 0),
          toolTotal:     s.score.toolTotal + 1,
          criticals:     s.score.criticals + (wasCritical ? 1 : 0),
        },
      }
    })
    return errorMsg
  }, [])

  const advancePhase = useCallback(() => {
    upd(s => ({
      phase: s.phase === 'movement' ? 'casing' : s.phase === 'casing' ? 'strap' : s.phase,
    }))
  }, [upd])

  const goReveal = useCallback(() => upd({ screen: 'reveal' }), [upd])

  const saveAndComplete = useCallback(() => {
    setState(s => {
      const sc = s.score
      const finalScore = calcFinalScore(sc)
      const grade = getGrade(finalScore)
      const duration = sc.startTime ? Math.round((Date.now() - sc.startTime) / 1000) : 0

      const entry = {
        id: Date.now(), brand: s.brand, model: s.model,
        grade: grade.label, gradeColor: grade.color, score: finalScore,
        builtAt: new Date().toISOString(), duration,
        precision:    sc.precisionCount > 0 ? Math.round(sc.precisionSum / sc.precisionCount) : 0,
        toolAccuracy: sc.toolTotal > 0 ? Math.round(sc.toolCorrect / sc.toolTotal * 100) : 0,
        criticals:    sc.criticals,
      }

      const newCollection  = [entry, ...s.collection].slice(0, 50)
      const pts            = Math.round(finalScore * 1.5) + (grade.label === 'MASTERPIECE' ? 100 : 0)
      const brandId        = s.brand?.id
      const newPrestige    = { ...s.prestige, [brandId]: (s.prestige[brandId] || 0) + pts }
      const newCompleted   = checkObjectives(s.dailyObj, s.completedObj, entry, sc)

      save(newCollection, newPrestige, newCompleted)
      return { ...s, collection: newCollection, prestige: newPrestige, completedObj: newCompleted, lastEntry: entry, screen: 'complete' }
    })
  }, [])

  const removeFromCollection = useCallback(id => {
    setState(s => {
      const col = s.collection.filter(c => c.id !== id)
      save(col, s.prestige, s.completedObj)
      return { ...s, collection: col }
    })
  }, [])

  // ── queries ──────────────────────────────────────────────────────────────
  const isPhaseComplete = useCallback((phase, installed) =>
    (INSTALL_ORDER[phase] || []).every(id => installed.includes(id)), [])

  const allComplete = useCallback((installed) =>
    ['movement','casing','strap'].every(p => isPhaseComplete(p, installed)), [isPhaseComplete])

  const finalScore = useCallback(sc => calcFinalScore(sc), [])

  return {
    state, toast,
    actions: { goBrand, goDrawer, selectBrand, selectModel, install, advancePhase, goReveal, saveAndComplete, removeFromCollection },
    queries: { isPhaseComplete, allComplete, finalScore },
  }
}
