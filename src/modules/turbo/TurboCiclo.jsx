import TurboCalculator from './TurboCalculator'
import FearGreedWidget from './FearGreedWidget'
import LiquidationHeatmap from './LiquidationHeatmap'
import AINews from './AINews'

// Pantalla del Módulo 3 — agrupa el asistente y los indicadores de decisión.
export default function TurboCiclo() {
  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <span className="text-2xl">⚡</span>
          <h1 className="text-xl font-bold">El Turbo-Ciclo</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Corto plazo · Captura ganancias del 2–4% por ciclo.
        </p>
      </header>

      <TurboCalculator />

      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Indicadores de decisión
        </h2>
        <FearGreedWidget />
        <LiquidationHeatmap />
        <AINews />
      </section>
    </div>
  )
}
