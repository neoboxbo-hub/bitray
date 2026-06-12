import { useState, useEffect, useCallback } from 'react'
import { fetchCoinData, fetchGlobalData, fetchFearGreed, generarResumen, CG_IDS } from '../../services/coingecko'

const CACHE = {}         // cache en memoria por símbolo, TTL 3 min
const CACHE_TTL = 3 * 60 * 1000

function fromCache(key) {
  const e = CACHE[key]
  if (!e) return null
  if (Date.now() - e.ts > CACHE_TTL) { delete CACHE[key]; return null }
  return e.data
}
function toCache(key, data) { CACHE[key] = { data, ts: Date.now() } }

export default function BitacoraViva({ symbol, precioEntrada = null }) {
  const [estado, setEstado] = useState('idle')   // idle | loading | ok | error | noId
  const [resumen, setResumen]   = useState('')
  const [detalle, setDetalle]   = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)
  const [expandido, setExpandido] = useState(false)

  const cargar = useCallback(async (force = false) => {
    if (!symbol) return
    if (!CG_IDS[symbol]) { setEstado('noId'); return }

    const cacheKey = symbol
    if (!force) {
      const cached = fromCache(cacheKey)
      if (cached) { setResumen(cached.resumen); setDetalle(cached.detalle); setUpdatedAt(cached.updatedAt); setEstado('ok'); return }
    }

    setEstado('loading')
    try {
      const [coin, global, fg] = await Promise.all([
        fetchCoinData(symbol),
        fetchGlobalData(),
        fetchFearGreed(),
      ])
      const texto = generarResumen({ coin, global, fg, precioEntrada })
      const now = new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      const data = { resumen: texto, detalle: { coin, global, fg }, updatedAt: now }
      toCache(cacheKey, data)
      setResumen(texto)
      setDetalle(data.detalle)
      setUpdatedAt(now)
      setEstado('ok')
    } catch (e) {
      console.warn('BitacoraViva error:', e.message)
      setEstado('error')
    }
  }, [symbol, precioEntrada])

  useEffect(() => { setEstado('idle'); setResumen(''); setDetalle(null); cargar() }, [symbol])

  if (!symbol) return null

  if (estado === 'noId') return (
    <div className="card p-4 border-l-4 border-l-brand/40 space-y-1">
      <p className="text-xs font-bold uppercase tracking-wide text-gray-400">📋 Bitácora de Mercado</p>
      <p className="text-sm text-gray-500">Token personalizado — sin datos de CoinGecko disponibles.</p>
    </div>
  )

  return (
    <div className="card p-4 border-l-4 border-l-brand/60 space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm">📋</span>
          <h2 className="text-xs font-bold uppercase tracking-wide text-gray-300">Bitácora de Mercado</h2>
          <span className="chip bg-profit/15 text-profit text-[9px]">LIVE</span>
        </div>
        <button
          onClick={() => cargar(true)}
          disabled={estado === 'loading'}
          className="text-[11px] text-gray-500 underline active:text-gray-300 disabled:opacity-40"
        >
          {estado === 'loading' ? 'Actualizando…' : '↻ Actualizar'}
        </button>
      </div>

      {/* Contenido */}
      {estado === 'loading' && (
        <div className="space-y-2 animate-pulse">
          <div className="h-3 bg-ink-600 rounded w-full" />
          <div className="h-3 bg-ink-600 rounded w-5/6" />
          <div className="h-3 bg-ink-600 rounded w-4/6" />
        </div>
      )}

      {estado === 'error' && (
        <div className="space-y-2">
          <p className="text-sm text-gray-400">Sin conexión a CoinGecko. Verifica tu internet o intenta más tarde.</p>
          <button onClick={() => cargar(true)} className="text-xs text-brand underline">Reintentar</button>
        </div>
      )}

      {estado === 'ok' && (
        <>
          <p className="text-sm text-gray-200 leading-relaxed">{resumen}</p>

          {/* Datos clave en chips */}
          {detalle && (
            <div className="flex flex-wrap gap-1.5">
              <span className={`chip text-[10px] ${detalle.coin.cambio24h >= 0 ? 'bg-profit/15 text-profit' : 'bg-loss/15 text-loss'}`}>
                24h {detalle.coin.cambio24h >= 0 ? '+' : ''}{detalle.coin.cambio24h?.toFixed(2)}%
              </span>
              {detalle.coin.cambio7d !== null && (
                <span className={`chip text-[10px] ${detalle.coin.cambio7d >= 0 ? 'bg-profit/10 text-profit/80' : 'bg-loss/10 text-loss/80'}`}>
                  7d {detalle.coin.cambio7d >= 0 ? '+' : ''}{detalle.coin.cambio7d?.toFixed(2)}%
                </span>
              )}
              <span className="chip bg-ink-600 text-gray-400 text-[10px]">
                Rank #{detalle.coin.rank}
              </span>
              <span className={`chip text-[10px] ${
                detalle.fg.value <= 40 ? 'bg-loss/15 text-loss' :
                detalle.fg.value >= 60 ? 'bg-yellow-400/15 text-yellow-400' :
                'bg-ink-600 text-gray-400'
              }`}>
                F&G {detalle.fg.value} · {detalle.fg.label}
              </span>
              <span className="chip bg-ink-600 text-gray-400 text-[10px]">
                Dom. BTC {detalle.global.dominanciaBTC?.toFixed(1)}%
              </span>
            </div>
          )}

          {/* Detalle expandible */}
          {detalle && (
            <button onClick={() => setExpandido(v => !v)}
              className="text-[11px] text-gray-500 underline">
              {expandido ? 'Ver menos' : 'Ver más datos'}
            </button>
          )}

          {expandido && detalle && (
            <div className="grid grid-cols-2 gap-2 text-center pt-1">
              <div className="bg-ink-800 rounded-lg py-2 px-3">
                <p className="text-[9px] text-gray-500 uppercase">Volumen 24h</p>
                <p className="text-xs font-semibold tabular-nums">
                  ${(detalle.coin.volumen24h / 1e6).toFixed(0)}M
                </p>
              </div>
              <div className="bg-ink-800 rounded-lg py-2 px-3">
                <p className="text-[9px] text-gray-500 uppercase">Market Cap</p>
                <p className="text-xs font-semibold tabular-nums">
                  ${(detalle.coin.marketCap / 1e9).toFixed(1)}B
                </p>
              </div>
              <div className="bg-ink-800 rounded-lg py-2 px-3">
                <p className="text-[9px] text-gray-500 uppercase">Desde ATH</p>
                <p className="text-xs font-semibold tabular-nums text-loss">
                  {detalle.coin.athPct?.toFixed(1)}%
                </p>
              </div>
              <div className="bg-ink-800 rounded-lg py-2 px-3">
                <p className="text-[9px] text-gray-500 uppercase">Mcap global</p>
                <p className="text-xs font-semibold tabular-nums">
                  ${(detalle.global.marketCapTotal / 1e12).toFixed(2)}T
                </p>
              </div>
            </div>
          )}

          {updatedAt && (
            <p className="text-[10px] text-gray-600">Datos CoinGecko · {updatedAt} · caché 3 min</p>
          )}
        </>
      )}

      {estado === 'idle' && <div className="h-4" />}
    </div>
  )
}
