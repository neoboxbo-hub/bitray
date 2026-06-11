import { useMemo, useState } from 'react'
import { calcTurbo, fmtUsd, fmtNum } from '../../utils/calculations'
import { TRADING_FEE_PCT, mockPrices, mockTurboWatchlist } from '../../data/mockData'

// Asistente de Trading: calcula Take Profits netos (2/3/4%) y Stop Loss sugerido.
export default function TurboCalculator() {
  const [symbol, setSymbol] = useState('SOL')
  const [precioCompra, setPrecioCompra] = useState(mockPrices.SOL.toString())
  const [capital, setCapital] = useState('500')
  const [riesgoPct, setRiesgoPct] = useState('1.5')
  const [feePct, setFeePct] = useState(TRADING_FEE_PCT.toString())

  // Al cambiar de token, precarga su precio "en vivo" simulado como precio de compra.
  const pickToken = (sym) => {
    setSymbol(sym)
    if (mockPrices[sym]) setPrecioCompra(mockPrices[sym].toString())
  }

  const r = useMemo(() => {
    const pc = parseFloat(precioCompra) || 0
    const cap = parseFloat(capital) || 0
    const riesgo = parseFloat(riesgoPct) || 0
    const fee = parseFloat(feePct) || 0
    return calcTurbo({
      precioCompra: pc,
      capital: cap,
      feePct: fee,
      riesgoPct: riesgo,
      targets: [2, 3, 4],
    })
  }, [precioCompra, capital, riesgoPct, feePct])

  const valido = parseFloat(precioCompra) > 0 && parseFloat(capital) > 0

  return (
    <div className="card p-5 space-y-5">
      <div>
        <h3 className="font-semibold flex items-center gap-2">
          <span>🎯</span> Asistente de operación
        </h3>
        <p className="text-xs text-gray-500 mt-0.5">
          Calcula tus órdenes de salida netas (comisiones incluidas).
        </p>
      </div>

      {/* Selector de token líquido (watchlist Turbo) */}
      <div>
        <label className="label">Token (solo alta liquidez)</label>
        <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-1">
          {mockTurboWatchlist.map((t) => (
            <button
              key={t.symbol}
              onClick={() => pickToken(t.symbol)}
              className={`shrink-0 px-3.5 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                symbol === t.symbol
                  ? 'bg-blue-500/20 border-blue-400 text-blue-300'
                  : 'border-ink-600 text-gray-400'
              }`}
            >
              {t.lowLiq && <span className="mr-1">⚠️</span>}
              {t.symbol}
            </button>
          ))}
        </div>
        {mockTurboWatchlist.find((t) => t.symbol === symbol)?.lowLiq && (
          <p className="text-xs text-loss mt-2 bg-loss/10 border border-loss/30 rounded-lg px-3 py-2">
            ⚠️ {symbol} es de baja liquidez. El spread puede comerse tu ganancia
            del 2-4% al entrar/salir. Usa órdenes límite y tamaño reducido.
          </p>
        )}
      </div>

      {/* Entradas */}
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="label">Precio de compra · {symbol} (USD)</label>
          <input
            type="number"
            inputMode="decimal"
            className="field"
            value={precioCompra}
            onChange={(e) => setPrecioCompra(e.target.value)}
            placeholder="0.00"
          />
        </div>
        <div>
          <label className="label">Capital (USD)</label>
          <input
            type="number"
            inputMode="decimal"
            className="field"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
            placeholder="0"
          />
        </div>
        <div>
          <label className="label">Comisión % (x lado)</label>
          <input
            type="number"
            inputMode="decimal"
            className="field"
            value={feePct}
            onChange={(e) => setFeePct(e.target.value)}
          />
        </div>
        <div className="col-span-2">
          <label className="label">Riesgo máx. (Stop Loss) %</label>
          <div className="flex gap-2">
            {['1', '1.5', '2', '3'].map((v) => (
              <button
                key={v}
                onClick={() => setRiesgoPct(v)}
                className={`flex-1 py-2 rounded-lg text-sm font-semibold border transition-colors ${
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
      </div>

      {valido ? (
        <>
          {/* Resumen de posición */}
          <div className="flex justify-between text-sm bg-ink-800 rounded-xl px-4 py-3">
            <span className="text-gray-400">Comprarías</span>
            <span className="font-semibold tabular-nums">
              {fmtNum(r.tokens, 4)} unidades
            </span>
          </div>

          {/* Take Profits */}
          <div>
            <p className="label">Órdenes de Venta (Take Profit neto)</p>
            <div className="space-y-2">
              {r.tps.map((tp) => (
                <div
                  key={tp.pct}
                  className="flex items-center justify-between bg-profit/10 border border-profit/30 rounded-xl px-4 py-3"
                >
                  <span className="chip bg-profit/20 text-profit">
                    +{tp.pct}%
                  </span>
                  <span className="font-bold tabular-nums">
                    {fmtUsd(tp.precioVenta, 6)}
                  </span>
                  <span className="text-xs text-profit font-medium">
                    {fmtUsd(tp.gananciaUsd)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Stop Loss */}
          <div>
            <p className="label">Gestión de riesgo (Stop Limit sugerido)</p>
            <div className="flex items-center justify-between bg-loss/10 border border-loss/30 rounded-xl px-4 py-3">
              <span className="chip bg-loss/20 text-loss">🛡️ Stop</span>
              <div className="text-right">
                <p className="font-bold tabular-nums text-loss">
                  {fmtUsd(r.stopPrice, 6)}
                </p>
                <p className="text-[11px] text-gray-500">
                  Limit: {fmtUsd(r.stopLimit, 6)} · Pérdida máx.{' '}
                  {fmtUsd(r.perdidaMax)}
                </p>
              </div>
            </div>
          </div>

          <p className="text-[10px] text-gray-600">
            Cálculos netos descontando {feePct}% de comisión por lado (compra +
            venta). Valores simulados.
          </p>
        </>
      ) : (
        <p className="text-sm text-gray-500 text-center py-4">
          Ingresa un precio de compra y capital para calcular tus órdenes.
        </p>
      )}
    </div>
  )
}
