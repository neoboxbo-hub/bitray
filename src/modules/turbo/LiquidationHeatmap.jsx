import { mockLiquidationMap } from '../../data/mockData'
import { fmtUsd } from '../../utils/calculations'

// Mapa de liquidaciones simulado (estilo Coinglass).
export default function LiquidationHeatmap() {
  const map = mockLiquidationMap
  const maxUsd = Math.max(...map.levels.map((l) => l.usdM))

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold">🔥 Mapa de liquidaciones</h3>
        <span className="text-xs text-gray-500">{map.symbol} · simulado</span>
      </div>

      <div className="space-y-1.5">
        {map.levels.map((lvl) => {
          const isLong = lvl.side === 'long'
          const pct = (lvl.usdM / maxUsd) * 100
          return (
            <div key={lvl.price} className="flex items-center gap-2 text-xs">
              <span className="w-16 tabular-nums text-gray-400 shrink-0">
                {fmtUsd(lvl.price, 0)}
              </span>
              <div className="flex-1 h-5 bg-ink-800 rounded overflow-hidden">
                <div
                  className="h-full rounded flex items-center justify-end pr-1.5"
                  style={{
                    width: `${pct}%`,
                    background: isLong ? '#ea394355' : '#16c78455',
                    borderRight: `2px solid ${isLong ? '#ea3943' : '#16c784'}`,
                  }}
                >
                  <span className="text-[10px] font-semibold">
                    ${lvl.usdM}M
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink-600 text-[11px]">
        <span className="flex items-center gap-1.5 text-profit">
          <span className="w-2 h-2 rounded-full bg-profit" /> Liq. shorts (arriba)
        </span>
        <span className="text-gray-400 tabular-nums">
          Precio: {fmtUsd(map.current, 0)}
        </span>
        <span className="flex items-center gap-1.5 text-loss">
          <span className="w-2 h-2 rounded-full bg-loss" /> Liq. longs (abajo)
        </span>
      </div>
    </div>
  )
}
