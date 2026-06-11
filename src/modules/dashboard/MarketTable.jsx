import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtNum } from '../../utils/calculations'

// Todos tus tokens en seguimiento (Cofre + Cosecha + Turbo watchlist)
const WATCH = [
  { symbol: 'BTC',    nombre: 'Bitcoin',       modulo: 'cofre' },
  { symbol: 'SOL',    nombre: 'Solana',         modulo: 'cosecha' },
  { symbol: 'BNB',    nombre: 'BNB',            modulo: 'cosecha' },
  { symbol: 'ETH',    nombre: 'Ethereum',       modulo: 'turbo' },
  { symbol: 'NEAR',   nombre: 'NEAR Protocol',  modulo: 'cosecha' },
  { symbol: 'AAVE',   nombre: 'Aave',           modulo: 'cosecha' },
  { symbol: 'RENDER', nombre: 'Render',         modulo: 'cosecha' },
  { symbol: 'FET',    nombre: 'Fetch.ai',       modulo: 'cosecha' },
  { symbol: 'AR',     nombre: 'Arweave',        modulo: 'cosecha' },
  { symbol: 'THETA',  nombre: 'Theta',          modulo: 'cosecha' },
  { symbol: 'AKT',    nombre: 'Akash',          modulo: 'cosecha' },
  { symbol: 'VET',    nombre: 'VeChain',        modulo: 'cosecha' },
  { symbol: 'RON',    nombre: 'Ronin',          modulo: 'cosecha' },
  { symbol: 'KCS',    nombre: 'KuCoin',         modulo: 'cosecha' },
  { symbol: 'XRP',    nombre: 'XRP',            modulo: 'turbo' },
  { symbol: 'DOGE',   nombre: 'Dogecoin',       modulo: 'turbo' },
  { symbol: 'ATH',    nombre: 'Aethir',         modulo: 'turbo' },
  { symbol: 'TFUEL',  nombre: 'Theta Fuel',     modulo: 'turbo' },
  { symbol: 'PIXEL',  nombre: 'Pixels',         modulo: 'turbo' },
]

const MODULE_ICON = { cofre: '🔒', cosecha: '🌱', turbo: '⚡' }

// Componente de porcentaje con color
function Pct({ value }) {
  if (value == null) return <span className="text-gray-600">—</span>
  const up = value >= 0
  return (
    <span className={`font-semibold tabular-nums ${up ? 'text-profit' : 'text-loss'}`}>
      {up ? '+' : ''}{value.toFixed(2)}%
    </span>
  )
}

export default function MarketTable() {
  const { prices, changes, pricesStatus } = usePortfolio()

  return (
    <section>
      {/* Header con estado de la fuente */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Mercado · tu lista
        </h2>
        <div className="flex items-center gap-1.5 text-[11px]">
          {pricesStatus === 'live' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-profit animate-pulse inline-block" />
              <span className="text-gray-500">Binance en vivo</span>
            </>
          ) : pricesStatus === 'error' ? (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-loss inline-block" />
              <span className="text-gray-500">Sin conexión</span>
            </>
          ) : (
            <>
              <span className="w-1.5 h-1.5 rounded-full bg-gray-500 animate-pulse inline-block" />
              <span className="text-gray-500">Cargando…</span>
            </>
          )}
        </div>
      </div>

      {/* Tabla */}
      <div className="card overflow-hidden">
        {/* Cabecera */}
        <div className="grid grid-cols-[1fr_auto_auto_auto] gap-x-3 px-3 py-2 border-b border-ink-600">
          <span className="text-[10px] uppercase tracking-wide text-gray-500">Token</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-500 text-right w-20">Precio</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-500 text-right w-12">1h</span>
          <span className="text-[10px] uppercase tracking-wide text-gray-500 text-right w-12">24h</span>
        </div>

        {/* Filas */}
        {WATCH.map((t, i) => {
          const price   = prices[t.symbol]
          const change  = changes[t.symbol]
          const isLast  = i === WATCH.length - 1

          return (
            <div
              key={t.symbol}
              className={`grid grid-cols-[1fr_auto_auto_auto] gap-x-3 items-center px-3 py-2.5 ${
                !isLast ? 'border-b border-ink-600/50' : ''
              }`}
            >
              {/* Token */}
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-base leading-none">{MODULE_ICON[t.modulo]}</span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold leading-none">{t.symbol}</p>
                  <p className="text-[11px] text-gray-500 truncate">{t.nombre}</p>
                </div>
              </div>

              {/* Precio */}
              <div className="text-right w-20">
                <p className="text-sm tabular-nums font-medium">
                  {price != null
                    ? price >= 1
                      ? fmtUsd(price, 2)
                      : `$${fmtNum(price, 5)}`
                    : '—'}
                </p>
              </div>

              {/* 1h */}
              <div className="text-right w-12 text-xs">
                <Pct value={change?.h1 ?? null} />
              </div>

              {/* 24h */}
              <div className="text-right w-12 text-xs">
                <Pct value={change?.h24 ?? null} />
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-[10px] text-gray-600 mt-2 text-center">
        🔒 Cofre · 🌱 Cosecha · ⚡ Turbo &nbsp;|&nbsp;
        Precios Binance spot · refresca cada 15s
      </p>
    </section>
  )
}
