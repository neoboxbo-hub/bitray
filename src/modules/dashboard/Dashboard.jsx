import { Link } from 'react-router-dom'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtPct } from '../../utils/calculations'
import { mockFearGreed } from '../../data/mockData'
import MarketTable from './MarketTable'

export default function Dashboard() {
  const {
    balanceTotal, cofre, cosecha, cosechaValor,
    turbo, turboValor, pnl24h,
    pricesStatus, pricesUpdated,
  } = usePortfolio()

  const cosechaPnlPct =
    cosecha.reduce((s, t) => s + t.costo, 0) > 0
      ? (cosecha.reduce((s, t) => s + t.pnl, 0) /
          cosecha.reduce((s, t) => s + t.costo, 0)) *
        100
      : 0

  // Total invertido en todas las estrategias
  const totalInvertido =
    cofre.usdInvertido +
    cosecha.reduce((s, t) => s + t.costo, 0) +
    turbo.reduce((s, t) => s + t.costo, 0)

  const pnlTotal = balanceTotal - totalInvertido

  const fg = mockFearGreed
  const fearAlert = fg.value <= 25 // Miedo extremo → sugerir compra en el Cofre

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500">Bienvenido de vuelta</p>
          <h1 className="text-xl font-bold">BitRay</h1>
        </div>
        <div className="h-10 w-10 rounded-full bg-brand/20 flex items-center justify-center text-brand font-bold">
          ₿
        </div>
      </header>

      {/* Balance total estimado del portafolio */}
      <section className="card p-5 bg-gradient-to-br from-ink-700 to-ink-800">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Balance total estimado
        </p>

        {/* Invertido */}
        {totalInvertido > 0 && (
          <p className="text-xs text-gray-500 tabular-nums mt-1">
            Invertido: <span className="text-gray-300 font-medium">{fmtUsd(totalInvertido)}</span>
          </p>
        )}

        <p className="text-4xl font-extrabold mt-1 tabular-nums">
          {fmtUsd(balanceTotal)}
        </p>

        {/* PnL total (balance vs invertido) */}
        {totalInvertido > 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-sm font-semibold tabular-nums ${pnlTotal >= 0 ? 'text-profit' : 'text-loss'}`}>
              {pnlTotal >= 0 ? '+' : ''}{fmtUsd(pnlTotal)}
            </span>
            <span className={`chip text-xs ${pnlTotal >= 0 ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss'}`}>
              {pnlTotal >= 0 ? '+' : ''}{totalInvertido > 0 ? ((pnlTotal / totalInvertido) * 100).toFixed(2) : '0.00'}%
            </span>
          </div>
        )}

        {/* PnL 24h */}
        {pnl24h !== 0 && (
          <div className="flex items-center gap-2 mt-1">
            <span className={`text-xs tabular-nums ${pnl24h >= 0 ? 'text-profit' : 'text-loss'}`}>
              {pnl24h >= 0 ? '+' : ''}{fmtUsd(pnl24h)} hoy
            </span>
            <span className={`chip text-[10px] ${pnl24h >= 0 ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss'}`}>
              24h
            </span>
          </div>
        )}

        <div className="flex gap-3 mt-3 text-xs text-gray-400 flex-wrap">
          <span>🔒 <span className="text-gray-200 font-medium">{fmtUsd(cofre.valorActual)}</span></span>
          <span>🌱 <span className="text-gray-200 font-medium">{fmtUsd(cosechaValor)}</span></span>
          {turboValor > 0 && (
            <span>⚡ <span className="text-gray-200 font-medium">{fmtUsd(turboValor)}</span></span>
          )}
        </div>
        <p className="text-[10px] text-gray-600 mt-3 flex items-center gap-1.5">
          {pricesStatus === 'live' ? (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-profit animate-pulse" />
              Precios en vivo · Binance
              {pricesUpdated &&
                ` · ${pricesUpdated.toLocaleTimeString('es-MX', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}`}
            </>
          ) : pricesStatus === 'error' ? (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-loss" />
              Sin conexión a Binance · usando precios simulados
            </>
          ) : (
            <>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-gray-500" />
              Cargando precios…
            </>
          )}
        </p>
      </section>

      {/* Alerta del índice Miedo y Codicia */}
      {fearAlert && (
        <Link
          to="/turbo"
          className="card p-4 border-brand/40 bg-brand/10 flex items-center gap-3"
        >
          <span className="text-2xl">😱</span>
          <div className="flex-1">
            <p className="text-sm font-semibold text-brand-soft">
              {fg.label} ({fg.value})
            </p>
            <p className="text-xs text-gray-300">
              Buen momento para acumular en El Cofre Inmortal.
            </p>
          </div>
          <span className="text-gray-500">›</span>
        </Link>
      )}

      {/* Tabla de mercado con todos los tokens de tu lista */}
      <MarketTable />
    </div>
  )
}
