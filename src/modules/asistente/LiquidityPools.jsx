// Widget simulado de Pools de Liquidez (order book walls) — mock data.
const MOCK_POOLS = {
  BTC:  { asks: [{ price: 109800, usdM: 48 }, { price: 110500, usdM: 31 }, { price: 112000, usdM: 67 }], bids: [{ price: 108200, usdM: 55 }, { price: 107000, usdM: 29 }, { price: 105500, usdM: 82 }] },
  ETH:  { asks: [{ price: 2720, usdM: 22 }, { price: 2800, usdM: 35 }, { price: 2900, usdM: 18 }], bids: [{ price: 2600, usdM: 40 }, { price: 2500, usdM: 25 }, { price: 2400, usdM: 61 }] },
  SOL:  { asks: [{ price: 185, usdM: 9 }, { price: 190, usdM: 15 }, { price: 200, usdM: 28 }], bids: [{ price: 175, usdM: 12 }, { price: 170, usdM: 20 }, { price: 165, usdM: 35 }] },
  XRP:  { asks: [{ price: 1.18, usdM: 6 }, { price: 1.22, usdM: 11 }, { price: 1.30, usdM: 18 }], bids: [{ price: 1.10, usdM: 8 }, { price: 1.05, usdM: 14 }, { price: 1.00, usdM: 30 }] },
  DEFAULT: { asks: [{ price: null, usdM: 8 }, { price: null, usdM: 14 }, { price: null, usdM: 22 }], bids: [{ price: null, usdM: 10 }, { price: null, usdM: 18 }, { price: null, usdM: 28 }] },
}

const fmt = (n, dec = 2) => n != null ? `$${Number(n).toLocaleString('es-MX', { minimumFractionDigits: dec, maximumFractionDigits: dec })}` : '—'

export default function LiquidityPools({ symbol = 'BTC', precioActual = 0 }) {
  const data = MOCK_POOLS[symbol] || MOCK_POOLS.DEFAULT
  const maxM = Math.max(...data.asks.map(a => a.usdM), ...data.bids.map(b => b.usdM))

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          🌊 Pools de Liquidez
        </h3>
        <span className="text-xs text-gray-500">{symbol} · simulado</span>
      </div>

      <div className="space-y-1 mb-2">
        <p className="text-[10px] uppercase tracking-wide text-loss font-semibold px-1">Resistencias (asks)</p>
        {[...data.asks].reverse().map((lvl, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-16 tabular-nums text-gray-400 shrink-0 text-right">{fmt(lvl.price)}</span>
            <div className="flex-1 h-5 bg-ink-800 rounded overflow-hidden flex justify-start">
              <div
                className="h-full rounded"
                style={{ width: `${(lvl.usdM / maxM) * 100}%`, background: '#ea394340', borderRight: '2px solid #ea3943' }}
              />
            </div>
            <span className="text-[10px] text-loss w-10 text-right shrink-0">${lvl.usdM}M</span>
          </div>
        ))}
      </div>

      {/* Precio actual */}
      <div className="flex items-center gap-2 my-2">
        <div className="flex-1 border-t border-dashed border-brand/40" />
        <span className="text-xs font-bold text-brand tabular-nums">{fmt(precioActual, 4)}</span>
        <div className="flex-1 border-t border-dashed border-brand/40" />
      </div>

      <div className="space-y-1 mt-2">
        <p className="text-[10px] uppercase tracking-wide text-profit font-semibold px-1">Soportes (bids)</p>
        {data.bids.map((lvl, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span className="w-16 tabular-nums text-gray-400 shrink-0 text-right">{fmt(lvl.price)}</span>
            <div className="flex-1 h-5 bg-ink-800 rounded overflow-hidden flex justify-start">
              <div
                className="h-full rounded"
                style={{ width: `${(lvl.usdM / maxM) * 100}%`, background: '#16c78440', borderRight: '2px solid #16c784' }}
              />
            </div>
            <span className="text-[10px] text-profit w-10 text-right shrink-0">${lvl.usdM}M</span>
          </div>
        ))}
      </div>

      <p className="text-[10px] text-gray-600 mt-3">
        * Datos simulados. Integración real con exchange en Fase 2.
      </p>
    </div>
  )
}
