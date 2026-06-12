import { useState, useEffect } from 'react'
import { fetchGlobalData, fetchFearGreed } from '../../services/coingecko'

function saludo() {
  const h = new Date().getHours()
  if (h >= 5  && h < 12) return { texto: 'Buenos días', emoji: '🌅' }
  if (h >= 12 && h < 19) return { texto: 'Buenas tardes', emoji: '☀️' }
  return { texto: 'Buenas noches', emoji: '🌙' }
}

function fgColor(v) {
  if (v <= 25) return 'text-loss'
  if (v <= 45) return 'text-yellow-400'
  if (v <= 55) return 'text-gray-300'
  if (v <= 75) return 'text-profit'
  return 'text-yellow-300'
}

function fgEmoji(v) {
  if (v <= 25) return '😱'
  if (v <= 45) return '😟'
  if (v <= 55) return '😐'
  if (v <= 75) return '😊'
  return '🤑'
}

export default function ResumenDiario() {
  const [estado, setEstado] = useState('loading')
  const [data, setData]     = useState(null)
  const { texto: saludoTexto, emoji: saludoEmoji } = saludo()

  useEffect(() => {
    let activo = true
    async function cargar() {
      try {
        const [global, fg] = await Promise.all([fetchGlobalData(), fetchFearGreed()])
        if (!activo) return
        setData({ global, fg, hora: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }) })
        setEstado('ok')
      } catch {
        if (activo) setEstado('error')
      }
    }
    cargar()
    return () => { activo = false }
  }, [])

  return (
    <section className="card p-4 space-y-3">
      {/* Saludo */}
      <div className="flex items-center gap-2">
        <span className="text-xl">{saludoEmoji}</span>
        <div>
          <p className="font-bold text-sm">{saludoTexto}</p>
          <p className="text-[10px] text-gray-500">Resumen del mercado crypto</p>
        </div>
      </div>

      {estado === 'loading' && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-ink-600 rounded w-full" />
          <div className="h-3 bg-ink-600 rounded w-4/5" />
        </div>
      )}

      {estado === 'error' && (
        <p className="text-xs text-gray-500">Sin conexión a CoinGecko. Verifica tu internet.</p>
      )}

      {estado === 'ok' && data && (() => {
        const { global, fg } = data
        const mktUp = global.cambio24hTotal >= 0
        const domBtc = global.dominanciaBTC.toFixed(1)
        const mktCap = (global.marketCapTotal / 1e12).toFixed(2)
        const mktMov = mktUp
          ? `subió +${global.cambio24hTotal.toFixed(1)}%`
          : `cayó ${global.cambio24hTotal.toFixed(1)}%`

        return (
          <>
            <p className="text-sm text-gray-300 leading-relaxed">
              El mercado crypto global <span className={mktUp ? 'text-profit font-semibold' : 'text-loss font-semibold'}>{mktMov}</span> en las últimas 24h.
              Market cap total: <span className="text-gray-200 font-medium">${mktCap}T</span>.
              Dominancia BTC: <span className="text-gray-200 font-medium">{domBtc}%</span>.
            </p>

            {/* Fear & Greed */}
            <div className="flex items-center gap-3 bg-ink-800 rounded-xl px-3 py-2.5">
              <span className="text-2xl">{fgEmoji(fg.value)}</span>
              <div className="flex-1">
                <p className="text-[10px] text-gray-500 uppercase tracking-wide">Fear & Greed Index</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className={`text-lg font-extrabold tabular-nums ${fgColor(fg.value)}`}>{fg.value}</span>
                  <span className={`text-xs font-semibold ${fgColor(fg.value)}`}>{fg.label}</span>
                </div>
              </div>
              {/* Barra visual */}
              <div className="w-16 h-2 rounded-full bg-ink-600 overflow-hidden shrink-0">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${fg.value}%`,
                    background: fg.value <= 40
                      ? '#ef4444'
                      : fg.value <= 60
                      ? '#eab308'
                      : '#22c55e',
                  }}
                />
              </div>
            </div>

            {/* Consejo según el F&G */}
            <p className="text-xs text-gray-400 leading-snug">
              {fg.value <= 25 && '😱 Miedo extremo — históricamente una zona de compra para el Cofre.'}
              {fg.value > 25 && fg.value <= 45 && '😟 El mercado siente presión. Buena zona para revisar tus stops.'}
              {fg.value > 45 && fg.value <= 55 && '😐 Mercado neutral. Espera confirmación antes de abrir nuevas posiciones.'}
              {fg.value > 55 && fg.value <= 75 && '😊 Codicia moderada. El rally sigue, pero gestiona bien el riesgo.'}
              {fg.value > 75 && '🤑 Codicia extrema — cuidado. Considera asegurar ganancias parciales.'}
            </p>

            <p className="text-[10px] text-gray-600">Fuente: CoinGecko + alternative.me · {data.hora}</p>
          </>
        )
      })()}
    </section>
  )
}
