// Radar de Nuevas Oportunidades — mock data de tokens externos sugeridos.
const SUGERENCIAS = [
  {
    symbol: 'RON', nombre: 'Ronin', narrativa: 'Gaming',
    cambio24h: '+8.4%', volumen: '$142M',
    razon: 'Volumen 24h +340% sobre su media de 30 días. Zona de liquidaciones en $3.20 actúa como soporte fuerte. Setup técnico de rebote confirmado en 4H.',
    riesgo: 'Medio',
  },
  {
    symbol: 'VET', nombre: 'VeChain', narrativa: 'Supply-chain',
    cambio24h: '+5.1%', volumen: '$98M',
    razon: 'Acumulación institucional detectada en $0.038–0.040. Mapa de calor muestra pool de liquidez compradora densa. Ciclo corto objetivo 2–3% viable.',
    riesgo: 'Bajo',
  },
]

export default function RadarOportunidades() {
  return (
    <div className="card p-5 space-y-4">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold flex items-center gap-2">
          📡 Radar de Oportunidades
        </h3>
        <span className="chip bg-blue-500/20 text-blue-300 text-[10px]">mock</span>
      </div>
      <p className="text-xs text-gray-500 -mt-1">
        Tokens fuera de tu lista con setup favorable para ciclos cortos.
      </p>

      {SUGERENCIAS.map((s) => (
        <div key={s.symbol} className="bg-ink-800 rounded-xl p-3 space-y-1.5 border border-ink-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-bold">{s.symbol}</span>
              <span className="chip bg-ink-600 text-gray-400 text-[10px]">{s.narrativa}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-profit tabular-nums">{s.cambio24h}</span>
              <span className="text-[10px] text-gray-500">Vol {s.volumen}</span>
            </div>
          </div>
          <p className="text-xs text-gray-300 leading-snug">{s.razon}</p>
          <div className="flex items-center gap-1.5">
            <span className="text-[10px] text-gray-500">Riesgo:</span>
            <span className={`chip text-[10px] ${
              s.riesgo === 'Bajo' ? 'bg-profit/15 text-profit' : 'bg-yellow-400/15 text-yellow-400'
            }`}>{s.riesgo}</span>
          </div>
        </div>
      ))}

      <p className="text-[10px] text-gray-600">
        * Sugerencias simuladas. Integración real con datos de volumen en Fase 2.
      </p>
    </div>
  )
}
