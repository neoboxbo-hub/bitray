import { useState } from 'react'
import { TOKEN_CATALOG, EXCHANGES } from '../../data/tokenCatalog'

const EXCHANGE_COLOR = {
  Binance: 'bg-yellow-400/15 border-yellow-400/50 text-yellow-300',
  Bybit:   'bg-orange-400/15 border-orange-400/50 text-orange-300',
  KuCoin:  'bg-green-400/15  border-green-400/50  text-green-300',
  OKX:     'bg-blue-400/15   border-blue-400/50   text-blue-300',
  Otro:    'bg-gray-400/15   border-gray-400/50   text-gray-300',
}

export default function AddTokenForm({ onAdd, onCancel, excludeSymbols = [] }) {
  const [search, setSearch]     = useState('')
  const [selected, setSelected] = useState(null)   // token del catálogo
  const [exchange, setExchange] = useState('Binance')

  const filtered = TOKEN_CATALOG.filter((t) => {
    if (excludeSymbols.includes(t.symbol)) return false
    const q = search.toLowerCase()
    return t.symbol.toLowerCase().includes(q) || t.nombre.toLowerCase().includes(q)
  })

  const pick = (token) => {
    setSelected(token)
    setSearch('')
  }

  const submit = (e) => {
    e.preventDefault()
    if (!selected) return
    onAdd({ ...selected, exchange })
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-4 border-brand/30 bg-ink-800/60">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <span>➕</span> Agregar token
      </h3>

      {/* ── Paso 1: elegir token ── */}
      {!selected ? (
        <div className="space-y-2">
          <label className="label">Busca o elige un token</label>
          <input
            type="text"
            className="field"
            placeholder="BTC, Solana, ETH…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            autoFocus
          />
          <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
            {filtered.map((t) => (
              <button
                type="button"
                key={t.symbol}
                onClick={() => pick(t)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-ink-700 border border-ink-600 active:border-brand/60 transition-colors"
              >
                <div className="text-left">
                  <span className="font-semibold text-sm">{t.symbol}</span>
                  <span className="text-gray-400 text-xs ml-2">{t.nombre}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-[10px] text-gray-500">{t.narrativa}</span>
                  <span className={`chip text-[10px] ${
                    t.categoria === 'nucleo'
                      ? 'bg-profit/15 text-profit'
                      : 'bg-loss/15 text-loss'
                  }`}>
                    {t.categoria === 'nucleo' ? '⭐ Núcleo' : '⚠️ Especulativo'}
                  </span>
                </div>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                Sin resultados. Prueba con otro símbolo.
              </p>
            )}
          </div>
        </div>
      ) : (
        /* ── Paso 2: token elegido → solo elegir exchange ── */
        <div className="space-y-4">
          {/* Token seleccionado (resumen) */}
          <div className="flex items-center justify-between bg-ink-700 rounded-xl px-4 py-3">
            <div>
              <p className="font-bold">{selected.symbol}
                <span className="text-gray-400 font-normal text-sm ml-2">{selected.nombre}</span>
              </p>
              <div className="flex items-center gap-1.5 mt-1">
                <span className="text-[10px] text-gray-400">{selected.narrativa}</span>
                <span className={`chip text-[10px] ${
                  selected.categoria === 'nucleo'
                    ? 'bg-profit/15 text-profit'
                    : 'bg-loss/15 text-loss'
                }`}>
                  {selected.categoria === 'nucleo' ? '⭐ Núcleo' : '⚠️ Especulativo'}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="text-xs text-gray-500 active:text-gray-200 underline"
            >
              Cambiar
            </button>
          </div>

          {/* Exchange */}
          <div>
            <label className="label">¿En qué exchange tienes este token?</label>
            <div className="flex flex-wrap gap-2">
              {EXCHANGES.map((ex) => (
                <button
                  type="button"
                  key={ex}
                  onClick={() => setExchange(ex)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${
                    exchange === ex
                      ? EXCHANGE_COLOR[ex] || EXCHANGE_COLOR['Otro']
                      : 'border-ink-600 text-gray-400'
                  }`}
                >
                  {ex}
                </button>
              ))}
            </div>
          </div>

          {/* Botones */}
          <div className="flex gap-2">
            <button type="button" onClick={onCancel}
              className="flex-1 py-3 rounded-xl border border-ink-600 text-gray-400 font-semibold">
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              Agregar
            </button>
          </div>
        </div>
      )}

      {!selected && (
        <button type="button" onClick={onCancel}
          className="w-full py-2.5 rounded-xl border border-ink-600 text-gray-400 font-semibold text-sm">
          Cancelar
        </button>
      )}
    </form>
  )
}
