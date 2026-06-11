import { useState } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtNum, fmtPct } from '../../utils/calculations'
import ConfirmDialog from '../../components/shared/ConfirmDialog'

// MÓDULO 1 · Largo plazo / Jubilación. Solo BTC. SIN botón de vender.
export default function CofreInmortal() {
  const {
    cofre,
    cofreCompras,
    addCompraCofre,
    updateCompraCofre,
    deleteCompraCofre,
    clearCofre,
    prices,
  } = usePortfolio()
  const [open, setOpen] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [editId, setEditId] = useState(null) // id de compra en edición
  const [editForm, setEditForm] = useState({ fecha: '', usd: '', precioBtc: '' })
  const [confirmDel, setConfirmDel] = useState(null) // id a eliminar

  const startEdit = (c) => {
    setEditId(c.id)
    setEditForm({
      fecha: c.fecha,
      usd: c.usd.toString(),
      precioBtc: c.precioBtc.toString(),
    })
  }

  const saveEdit = () => {
    const usd = parseFloat(editForm.usd)
    const precioBtc = parseFloat(editForm.precioBtc)
    if (!usd || !precioBtc) return
    updateCompraCofre(editId, { fecha: editForm.fecha, usd, precioBtc })
    setEditId(null)
  }
  const [form, setForm] = useState({
    fecha: new Date().toISOString().slice(0, 10),
    usd: '',
    precioBtc: prices.BTC.toString(),
  })

  const submit = (e) => {
    e.preventDefault()
    const usd = parseFloat(form.usd)
    const precioBtc = parseFloat(form.precioBtc)
    if (!usd || !precioBtc) return
    addCompraCofre({ fecha: form.fecha, usd, precioBtc })
    setForm((f) => ({ ...f, usd: '' }))
    setOpen(false)
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🔒</span>
          <h1 className="text-xl font-bold">El Cofre Inmortal</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Largo plazo · Solo Bitcoin</p>
      </header>

      {/* Acumulado */}
      <section className="card p-5 bg-gradient-to-br from-brand/20 to-ink-800">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          BTC acumulado
        </p>
        <p className="text-3xl font-extrabold mt-1 tabular-nums">
          ₿ {fmtNum(cofre.btcAcumulado, 6)}
        </p>
        <p className="text-lg text-gray-300 mt-1 tabular-nums">
          ≈ {fmtUsd(cofre.valorActual)}
        </p>
        <div className="grid grid-cols-3 gap-2 mt-4 text-center">
          <div className="bg-ink-800/60 rounded-lg py-2">
            <p className="text-[10px] text-gray-500">Invertido</p>
            <p className="text-sm font-semibold">{fmtUsd(cofre.usdInvertido)}</p>
          </div>
          <div className="bg-ink-800/60 rounded-lg py-2">
            <p className="text-[10px] text-gray-500">Precio prom.</p>
            <p className="text-sm font-semibold">{fmtUsd(cofre.precioPromedio)}</p>
          </div>
          <div className="bg-ink-800/60 rounded-lg py-2">
            <p className="text-[10px] text-gray-500">PnL</p>
            <p
              className={`text-sm font-semibold ${
                cofre.pnlPct >= 0 ? 'text-profit' : 'text-loss'
              }`}
            >
              {fmtPct(cofre.pnlPct)}
            </p>
          </div>
        </div>
      </section>

      {/* Recordatorio motivacional (seguridad psicológica) */}
      <div className="card p-4 border-brand/30 bg-brand/5 flex gap-3">
        <span className="text-2xl">👨‍👩‍👧‍👦</span>
        <p className="text-sm text-gray-300 leading-snug">
          Esto no se vende. Cada satoshi es el futuro de tu familia. La paciencia
          de hoy es la libertad de mañana.
        </p>
      </div>

      {/* Botón añadir compra (NO existe Vender/Retirar) */}
      {!open ? (
        <button className="btn-primary" onClick={() => setOpen(true)}>
          + Añadir compra
        </button>
      ) : (
        <form onSubmit={submit} className="card p-5 space-y-3">
          <div>
            <label className="label">Fecha</label>
            <input
              type="date"
              className="field"
              value={form.fecha}
              onChange={(e) => setForm({ ...form, fecha: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Monto (USD)</label>
              <input
                type="number"
                inputMode="decimal"
                className="field"
                placeholder="100"
                value={form.usd}
                onChange={(e) => setForm({ ...form, usd: e.target.value })}
              />
            </div>
            <div>
              <label className="label">Precio BTC</label>
              <input
                type="number"
                inputMode="decimal"
                className="field"
                value={form.precioBtc}
                onChange={(e) => setForm({ ...form, precioBtc: e.target.value })}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-3 rounded-xl border border-ink-600 text-gray-400 font-semibold"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1">
              Guardar
            </button>
          </div>
        </form>
      )}

      {/* Historial */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
            Historial de compras
          </h2>
          {cofreCompras.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="text-xs font-semibold text-loss/80 active:text-loss"
            >
              🗑 Limpiar
            </button>
          )}
        </div>
        {cofreCompras.length === 0 && (
          <p className="text-sm text-gray-500 text-center py-6">
            Sin registros. Añade tu primera compra de BTC.
          </p>
        )}
        <ul className="space-y-2">
          {[...cofreCompras].reverse().map((c) =>
            editId === c.id ? (
              <li key={c.id} className="card px-4 py-3 space-y-2">
                <input
                  type="date"
                  className="field py-2"
                  value={editForm.fecha}
                  onChange={(e) =>
                    setEditForm({ ...editForm, fecha: e.target.value })
                  }
                />
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    className="field py-2"
                    placeholder="USD"
                    value={editForm.usd}
                    onChange={(e) =>
                      setEditForm({ ...editForm, usd: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    className="field py-2"
                    placeholder="Precio BTC"
                    value={editForm.precioBtc}
                    onChange={(e) =>
                      setEditForm({ ...editForm, precioBtc: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditId(null)}
                    className="flex-1 py-2 rounded-lg border border-ink-600 text-gray-400 text-sm font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveEdit}
                    className="btn-primary flex-1 py-2 text-sm"
                  >
                    Guardar
                  </button>
                </div>
              </li>
            ) : (
              <li
                key={c.id}
                className="card px-4 py-3 flex items-center justify-between gap-2"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium">{fmtUsd(c.usd)}</p>
                  <p className="text-xs text-gray-500">{c.fecha}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm tabular-nums">
                    ₿ {fmtNum(c.usd / c.precioBtc, 6)}
                  </p>
                  <p className="text-xs text-gray-500">@ {fmtUsd(c.precioBtc)}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(c)}
                    className="h-8 w-8 rounded-lg border border-ink-600 text-gray-400 active:text-brand"
                    aria-label="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setConfirmDel(c.id)}
                    className="h-8 w-8 rounded-lg border border-ink-600 text-loss/80 active:text-loss"
                    aria-label="Eliminar"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      </section>

      <ConfirmDialog
        open={confirmClear}
        title="¿Limpiar el historial del Cofre?"
        message="Se borrarán todos los registros de compra de BTC. Esto NO vende tus bitcoins, solo elimina el historial guardado. Esta acción no se puede deshacer."
        confirmText="Sí, limpiar"
        onConfirm={() => {
          clearCofre()
          setConfirmClear(false)
        }}
        onCancel={() => setConfirmClear(false)}
      />

      <ConfirmDialog
        open={confirmDel !== null}
        title="¿Eliminar esta compra?"
        message="Se eliminará solo este registro del historial. Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        onConfirm={() => {
          deleteCompraCofre(confirmDel)
          setConfirmDel(null)
        }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  )
}
