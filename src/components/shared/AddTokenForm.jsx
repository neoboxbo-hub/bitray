// Formulario para agregar un nuevo token a Cosecha o Turbo.
// onAdd recibe: { symbol, nombre, exchange, categoria, narrativa }
export default function AddTokenForm({ onAdd, onCancel }) {
  const EXCHANGES = ['Binance', 'Bybit', 'KuCoin', 'OKX', 'Otro']
  const CATEGORIAS = ['nucleo', 'spec']

  const [form, setForm] = useState({
    symbol: '',
    nombre: '',
    exchange: 'Binance',
    categoria: 'nucleo',
    narrativa: '',
  })

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }))

  const submit = (e) => {
    e.preventDefault()
    if (!form.symbol.trim()) return
    onAdd({
      ...form,
      symbol: form.symbol.trim().toUpperCase(),
      nombre: form.nombre.trim() || form.symbol.trim().toUpperCase(),
    })
  }

  return (
    <form onSubmit={submit} className="card p-4 space-y-3 border-brand/30">
      <h3 className="font-semibold text-sm flex items-center gap-2">
        <span>➕</span> Agregar token
      </h3>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Símbolo *</label>
          <input
            type="text"
            className="field uppercase py-2"
            placeholder="SOL"
            value={form.symbol}
            onChange={(e) => set('symbol', e.target.value)}
            autoCapitalize="characters"
            required
          />
        </div>
        <div>
          <label className="label">Nombre</label>
          <input
            type="text"
            className="field py-2"
            placeholder="Solana"
            value={form.nombre}
            onChange={(e) => set('nombre', e.target.value)}
          />
        </div>
      </div>

      <div>
        <label className="label">Exchange</label>
        <div className="flex flex-wrap gap-1.5">
          {EXCHANGES.map((ex) => (
            <button
              type="button"
              key={ex}
              onClick={() => set('exchange', ex)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                form.exchange === ex
                  ? 'bg-brand/20 border-brand text-brand-soft'
                  : 'border-ink-600 text-gray-400'
              }`}
            >
              {ex}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="label">Categoría</label>
          <div className="flex gap-1.5">
            {CATEGORIAS.map((c) => (
              <button
                type="button"
                key={c}
                onClick={() => set('categoria', c)}
                className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                  form.categoria === c
                    ? c === 'nucleo'
                      ? 'bg-profit/20 border-profit text-profit'
                      : 'bg-loss/20 border-loss text-loss'
                    : 'border-ink-600 text-gray-400'
                }`}
              >
                {c === 'nucleo' ? 'Núcleo' : 'Especulativo'}
              </button>
            ))}
          </div>
        </div>
        <div>
          <label className="label">Narrativa</label>
          <input
            type="text"
            className="field py-2 text-sm"
            placeholder="L1 / AI / DeFi…"
            value={form.narrativa}
            onChange={(e) => set('narrativa', e.target.value)}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl border border-ink-600 text-gray-400 font-semibold text-sm"
        >
          Cancelar
        </button>
        <button type="submit" className="btn-primary flex-1 py-2.5 text-sm">
          Agregar
        </button>
      </div>
    </form>
  )
}

// Necesita importar useState en este archivo
import { useState } from 'react'
