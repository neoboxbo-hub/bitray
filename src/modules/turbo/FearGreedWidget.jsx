import { mockFearGreed } from '../../data/mockData'

// Gauge simple del Índice de Miedo y Codicia con alerta contextual.
export default function FearGreedWidget() {
  const fg = mockFearGreed
  const v = fg.value

  const color =
    v <= 25 ? '#ea3943' : v <= 45 ? '#f7931a' : v <= 55 ? '#eab308' : '#16c784'

  // Semicírculo: 0..100 → 0..180 grados
  const angle = (v / 100) * 180

  return (
    <div className="card p-5">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-semibold">😨 Miedo & Codicia</h3>
        <span className="text-xs text-gray-500">{fg.updated}</span>
      </div>

      <div className="flex items-center gap-5">
        {/* Gauge */}
        <div className="relative w-28 h-16 shrink-0">
          <svg viewBox="0 0 100 55" className="w-full h-full">
            <path
              d="M5 50 A45 45 0 0 1 95 50"
              fill="none"
              stroke="#262a37"
              strokeWidth="9"
              strokeLinecap="round"
            />
            <path
              d="M5 50 A45 45 0 0 1 95 50"
              fill="none"
              stroke={color}
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={`${(angle / 180) * 141} 141`}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-0 text-center">
            <p className="text-2xl font-extrabold leading-none" style={{ color }}>
              {v}
            </p>
          </div>
        </div>

        <div className="flex-1">
          <p className="font-semibold" style={{ color }}>
            {fg.label}
          </p>
          {v <= 25 && (
            <p className="text-xs text-gray-300 mt-1 bg-brand/10 border border-brand/30 rounded-lg px-2.5 py-2">
              💡 Sugerencia: acumula en{' '}
              <span className="font-semibold text-brand-soft">
                El Cofre Inmortal
              </span>
              . El mercado tiene miedo.
            </p>
          )}
        </div>
      </div>

      {/* Mini histórico */}
      <div className="flex justify-between mt-4">
        {fg.history.map((h) => (
          <div key={h.day} className="text-center">
            <div className="h-12 w-1.5 mx-auto bg-ink-600 rounded-full relative overflow-hidden">
              <div
                className="absolute bottom-0 inset-x-0 rounded-full"
                style={{ height: `${h.value}%`, background: color }}
              />
            </div>
            <p className="text-[10px] text-gray-500 mt-1">{h.day}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
