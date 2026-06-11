import { Link } from 'react-router-dom'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtPct } from '../../utils/calculations'
import { mockFearGreed } from '../../data/mockData'

// Tarjeta de acceso a cada uno de los 3 módulos.
function ModuleCard({ to, icon, color, name, subtitle, value, pnlPct }) {
  return (
    <Link
      to={to}
      className="card p-4 flex items-center gap-4 active:scale-[0.99] transition-transform"
    >
      <div
        className="h-12 w-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ background: `${color}1f` }}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-semibold leading-tight">{name}</p>
        <p className="text-xs text-gray-500 truncate">{subtitle}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="font-semibold tabular-nums">{fmtUsd(value)}</p>
        {pnlPct !== undefined && (
          <p
            className={`text-xs font-medium ${
              pnlPct >= 0 ? 'text-profit' : 'text-loss'
            }`}
          >
            {fmtPct(pnlPct)}
          </p>
        )}
      </div>
    </Link>
  )
}

export default function Dashboard() {
  const { balanceTotal, cofre, cosecha, cosechaValor } = usePortfolio()

  const cosechaPnlPct =
    cosecha.reduce((s, t) => s + t.costo, 0) > 0
      ? (cosecha.reduce((s, t) => s + t.pnl, 0) /
          cosecha.reduce((s, t) => s + t.costo, 0)) *
        100
      : 0

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
        <p className="text-4xl font-extrabold mt-1 tabular-nums">
          {fmtUsd(balanceTotal)}
        </p>
        <div className="flex gap-4 mt-3 text-xs text-gray-400">
          <span>
            Cofre:{' '}
            <span className="text-gray-200 font-medium">
              {fmtUsd(cofre.valorActual)}
            </span>
          </span>
          <span>
            Cosecha:{' '}
            <span className="text-gray-200 font-medium">
              {fmtUsd(cosechaValor)}
            </span>
          </span>
        </div>
        <p className="text-[10px] text-gray-600 mt-3">
          * Datos simulados (Fase 1). No conectado a exchanges reales.
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

      {/* Acceso rápido a los 3 módulos */}
      <section>
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400 mb-3">
          Tus módulos
        </h2>
        <div className="space-y-3">
          <ModuleCard
            to="/cofre"
            icon="🔒"
            color="#f7931a"
            name="El Cofre Inmortal"
            subtitle="Largo plazo · Solo BTC"
            value={cofre.valorActual}
            pnlPct={cofre.pnlPct}
          />
          <ModuleCard
            to="/cosecha"
            icon="🌱"
            color="#16c784"
            name="La Cosecha Feliz"
            subtitle="Mediano plazo · Altcoins"
            value={cosechaValor}
            pnlPct={cosechaPnlPct}
          />
          <ModuleCard
            to="/turbo"
            icon="⚡"
            color="#3b82f6"
            name="El Turbo-Ciclo"
            subtitle="Corto plazo · Flujo de efectivo"
            value={0}
          />
        </div>
      </section>
    </div>
  )
}
