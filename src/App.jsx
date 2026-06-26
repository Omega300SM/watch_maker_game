import { useGameState } from './hooks/useGameState'
import IntroScreen    from './components/IntroScreen'
import BrandScreen    from './components/BrandScreen'
import ModelScreen    from './components/ModelScreen'
import AssemblyScreen from './components/AssemblyScreen'
import RevealScreen   from './components/RevealScreen'
import CompleteScreen from './components/CompleteScreen'
import DrawerScreen   from './components/DrawerScreen'

export default function App() {
  const { state, toast: showToast, actions, queries } = useGameState()
  const {
    screen, brand, model, phase, installed, parts, score,
    collection, prestige, dailyObj, completedObj, lastEntry, toast
  } = state

  return (
    <>
      {toast && (
        <div className="toast-wrap">
          <div className="toast">{toast}</div>
        </div>
      )}

      {screen === 'intro' && (
        <IntroScreen onEnter={actions.goBrand} collectionCount={collection.length} />
      )}

      {screen === 'brand' && (
        <BrandScreen
          prestige={prestige} onSelect={actions.selectBrand}
          onDrawer={actions.goDrawer} collectionCount={collection.length}
          dailyObj={dailyObj} completedObj={completedObj}
        />
      )}

      {screen === 'model' && brand && (
        <ModelScreen brand={brand} onSelect={actions.selectModel} onBack={actions.goBrand} />
      )}

      {screen === 'assembly' && brand && model && (
        <AssemblyScreen
          brand={brand} model={model} phase={phase}
          installed={installed} parts={parts}
          onInstall={actions.install}
          onAdvancePhase={actions.advancePhase}
          onComplete={actions.goReveal}
          isPhaseComplete={queries.isPhaseComplete}
          allComplete={queries.allComplete}
          showToast={showToast} onBack={actions.goBrand}
        />
      )}

      {screen === 'reveal' && brand && model && (
        <RevealScreen brand={brand} model={model} onComplete={actions.saveAndComplete} />
      )}

      {screen === 'complete' && brand && model && (
        <CompleteScreen
          brand={brand} model={model} score={score} lastEntry={lastEntry}
          prestige={prestige} dailyObj={dailyObj} completedObj={completedObj}
          onNewBuild={actions.goBrand} onDrawer={actions.goDrawer}
        />
      )}

      {screen === 'drawer' && (
        <DrawerScreen collection={collection} onBack={actions.goBrand} onRemove={actions.removeFromCollection} />
      )}
    </>
  )
}
