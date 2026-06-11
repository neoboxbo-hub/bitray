import { useMemo, useState } from 'react'
import { calcTurbo, fmtUsd, fmtNum } from '../../utils/calculations'
import { TRADING_FEE_PCT } from '../../data/mockData'

// Panel de Take Profits y Stop Limit reutilizable.
// Recibe: precioEntrada (precio promedio), capital (costo total de la posición),
// precioActual (para mostrar referencia), symbol.
export default function TpSlPanel({ precioEntrada, capital, precioActual, symbol }) {
  const [riesgoPct, setRiesgoPct] = useState('1.5')
  const [open, setOpen] = useState(false)

  const r = useMemo(() => {
    const pc = precioEntrada || 0
    const cap = capital || 0
    return calcTurbo({
      precioCompra: pc,
      capital: cap,
      feePct: TRADING_FEE_PCT,
      riesgoPct: parseFloat(riesgoPct) || 1.5,
      targets: [2, 3, 4],
    })
  }, [precioEntrada, capital, riesgoPct])

  const valido = precioEntrada > 0 && capital > 0

  return (
    <div className="mt-2 border-t border-ink-600/60 pt-2">
      {/* Toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between text-xs font-semibold text-blue-400 active:text-blue-300 py-1"
      >
        <span>⚡ Ver TP / Stop Loss</span>
        <span>{open ? '▲' : '▼'}</span>
      </button>

      {open && valido && (
        <div className="mt-2 space-y-3">
          {/* Riesgo selector */}
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">
              Riesgo máx. Stop Loss
            </p>
            <div className="flex gap-1.5">
              {['1', '1.5', '2', '3'].map((v) => (
                <button
                  key={v}
                  onClick={() => setRiesgoPct(v)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                    riesgoPct === v
                      ? 'bg-loss/20 border-loss text-loss'
                      : 'border-ink-600 text-gray-400'
                  }`}
                >
                  {v}%
                </button>
              ))}
            </div>
          </div>

          {/* Resumen posición */}
          <div className="grid grid-cols-3 gap-1.5 text-center">
            <div className="bg-ink-800 rounded-lg py-2">
              <p className="text-[10px] text-gray-500">Entrada</p>
              <p className="text-xs font-semibold tabular-nums">{fmtUsd(precioEntrada, 4)}</p>
            </div>
            <div className="bg-ink-800 rounded-lg py-2">
              <p className="text-[10px] text-gray-500">Capital</p>
              <p className="text-xs font-semibold tabular-nums">{fmtUsd(capital)}</p>
            </div>
            <div className="bg-ink-800 rounded-lg py-2">
              <p className="text-[10px] text-gray-500">Unidades</p>
              <p className="text-xs font-semibold tabular-nums">{fmtNum(r.tokens, 3)}</p>
            </div>
          </div>

          {/* Take Profits */}
          <div className="space-y-1.5">
            {r.tps.map((tp) => (
              <div
                key={tp.pct}
                className="flex items-center gap-2 bg-profit/10 border border-profit/25 rounded-xl px-3 py-2"
              >
                <span className="chip bg-profit/20 text-profit text-[11px] shrink-0">+{tp.pct}%</span>
                <span className="font-bold tabular-nums text-sm flex-1 text-center">
                  {fmtUsd(tp.precioVenta, 2)}
                </span>
                <span className="text-xs text-profit font-semibold shrink-0">
                  +{fmtUsd(tp.gananciaUsd)}
                </span>
              </div>
            ))}
          </div>

          {/* Stop Limit */}
          <div className="bg-loss/10 border border-loss/25 rounded-xl px-3 py-2.5 space-y-0.5">
            <div className="flex items-center justify-between">
              <span className="chip bg-loss/20 text-loss text-[11px]">🛡️ Stop trigger</span>
              <span className="font-bold tabular-nums text-sm text-loss">
                {fmtUsd(r.stopPrice, 2)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Limit / orden a colocar</span>
              <span className="text-[11px] text-gray-400 tabular-nums">{fmtUsd(r.stopLimit, 2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-gray-500">Pérdida máx.</span>
              <span className="text-[11px] text-loss tabular-nums">{fmtUsd(r.perdidaMax)}</span>
            </div>
          </div>

          <p className="text-[10px] text-gray-600">
            Cálculo neto descontando {TRADING_FEE_PCT}% comisión por lado.
            Entrada = precio promedio de tus compras.
          </p>
        </div>
      )}
    </div>
  )
}
