import { useState } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtNum, fmtPct } from '../../utils/calculations'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import TpSlPanel from '../../components/shared/TpSlPanel'

// Tarjeta por token con precio promedio (punto de equilibrio) y PnL flotante.
function TokenCard({ token, onAdd, onClear, onUpdate, onDelete }) {
  const [open, setOpen] = useState(false)
  const [showList, setShowList] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [cantidad, setCantidad] = useState('')
  const [precio, setPrecio] = useState(token.precioActual.toString())
  const [editId, setEditId] = useState(null)
  const [editForm, setEditForm] = useState({ cantidad: '', precio: '' })
  const [confirmDel, setConfirmDel] = useState(null)

  const startEdit = (c) => {
    setEditId(c.id)
    setEditForm({ cantidad: c.cantidad.toString(), precio: c.precio.toString() })
  }

  const saveEdit = () => {
    const cant = parseFloat(editForm.cantidad)
    const pr = parseFloat(editForm.precio)
    if (!cant || !pr) return
    onUpdate(token.symbol, editId, { cantidad: cant, precio: pr })
    setEditId(null)
  }

  const submit = (e) => {
    e.preventDefault()
    const cant = parseFloat(cantidad)
    const pr = parseFloat(precio)
    if (!cant || !pr) return
    onAdd(token.symbol, {
      fecha: new Date().toISOString().slice(0, 10),
      cantidad: cant,
      precio: pr,
    })
    setCantidad('')
    setOpen(false)
  }

  const up = token.pnlPct >= 0

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <p className="font-semibold">{token.symbol}</p>
            {token.categoria === 'spec' ? (
              <span className="chip bg-loss/15 text-loss">Especulativo</span>
            ) : (
              <span className="chip bg-profit/15 text-profit">Núcleo</span>
            )}
            {token.narrativa && (
              <span className="chip bg-ink-600 text-gray-400">
                {token.narrativa}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {token.nombre} · {fmtNum(token.cantidad, 2)} unidades
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold tabular-nums">
            {fmtUsd(token.valorActual)}
          </p>
          <p className={`text-xs font-medium ${up ? 'text-profit' : 'text-loss'}`}>
            {fmtPct(token.pnlPct)} · {fmtUsd(token.pnl)}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mt-3 text-center">
        <div className="bg-ink-800 rounded-lg py-2">
          <p className="text-[10px] text-gray-500">Equilibrio (prom.)</p>
          <p className="text-sm font-semibold tabular-nums">
            {fmtUsd(token.precioPromedio, 4)}
          </p>
        </div>
        <div className="bg-ink-800 rounded-lg py-2">
          <p className="text-[10px] text-gray-500">Precio actual</p>
          <p className="text-sm font-semibold tabular-nums">
            {fmtUsd(token.precioActual, 4)}
          </p>
        </div>
      </div>

      {/* Panel TP / Stop Loss basado en precio promedio y capital real */}
      {token.compras.length > 0 && (
        <TpSlPanel
          precioEntrada={token.precioPromedio}
          capital={token.costo}
          precioActual={token.precioActual}
          symbol={token.symbol}
        />
      )}

      {/* Ver / ocultar compras individuales */}
      {token.compras.length > 0 && (
        <button
          onClick={() => setShowList((v) => !v)}
          className="w-full mt-3 text-xs font-medium text-gray-400 active:text-gray-200"
        >
          {showList ? '▲ Ocultar' : `▼ Ver ${token.compras.length} compra(s)`}
        </button>
      )}

      {showList && (
        <ul className="mt-2 space-y-1.5">
          {token.compras.map((c) =>
            editId === c.id ? (
              <li key={c.id} className="bg-ink-800 rounded-lg p-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="number"
                    inputMode="decimal"
                    className="field py-1.5 text-sm"
                    placeholder="Cantidad"
                    value={editForm.cantidad}
                    onChange={(e) =>
                      setEditForm({ ...editForm, cantidad: e.target.value })
                    }
                  />
                  <input
                    type="number"
                    inputMode="decimal"
                    className="field py-1.5 text-sm"
                    placeholder="Precio"
                    value={editForm.precio}
                    onChange={(e) =>
                      setEditForm({ ...editForm, precio: e.target.value })
                    }
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditId(null)}
                    className="flex-1 py-1.5 rounded-lg border border-ink-600 text-gray-400 text-xs font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={saveEdit}
                    className="btn-primary flex-1 py-1.5 text-xs"
                  >
                    Guardar
                  </button>
                </div>
              </li>
            ) : (
              <li
                key={c.id}
                className="flex items-center justify-between gap-2 bg-ink-800 rounded-lg px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <p className="tabular-nums">
                    {fmtNum(c.cantidad, 2)} @ {fmtUsd(c.precio, 4)}
                  </p>
                  <p className="text-[11px] text-gray-500">{c.fecha}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => startEdit(c)}
                    className="h-7 w-7 rounded-md border border-ink-600 text-gray-400 active:text-brand text-xs"
                    aria-label="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => setConfirmDel(c.id)}
                    className="h-7 w-7 rounded-md border border-ink-600 text-loss/80 active:text-loss text-xs"
                    aria-label="Eliminar"
                  >
                    🗑
                  </button>
                </div>
              </li>
            ),
          )}
        </ul>
      )}

      {!open ? (
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setOpen(true)}
            className="flex-1 py-2 rounded-lg border border-ink-600 text-sm font-semibold text-gray-300 active:scale-[0.99] transition-transform"
          >
            + Registrar compra
          </button>
          {token.compras.length > 0 && (
            <button
              onClick={() => setConfirmClear(true)}
              className="px-3 py-2 rounded-lg border border-ink-600 text-loss/80 active:text-loss"
              aria-label="Limpiar registros"
            >
              🗑
            </button>
          )}
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input
              type="number"
              inputMode="decimal"
              className="field"
              placeholder="Cantidad"
              value={cantidad}
              onChange={(e) => setCantidad(e.target.value)}
            />
            <input
              type="number"
              inputMode="decimal"
              className="field"
              placeholder="Precio"
              value={precio}
              onChange={(e) => setPrecio(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-lg border border-ink-600 text-gray-400 text-sm font-semibold"
            >
              Cancelar
            </button>
            <button type="submit" className="btn-primary flex-1 py-2 text-sm">
              Guardar
            </button>
          </div>
        </form>
      )}

      <ConfirmDialog
        open={confirmClear}
        title={`¿Limpiar registros de ${token.symbol}?`}
        message="Se borrarán todas las compras registradas de este token. Esta acción no se puede deshacer."
        confirmText="Sí, limpiar"
        onConfirm={() => {
          onClear(token.symbol)
          setConfirmClear(false)
        }}
        onCancel={() => setConfirmClear(false)}
      />

      <ConfirmDialog
        open={confirmDel !== null}
        title="¿Eliminar esta compra?"
        message="Se eliminará solo este registro. El precio promedio se recalculará. Esta acción no se puede deshacer."
        confirmText="Sí, eliminar"
        onConfirm={() => {
          onDelete(token.symbol, confirmDel)
          setConfirmDel(null)
        }}
        onCancel={() => setConfirmDel(null)}
      />
    </div>
  )
}

// MÓDULO 2 · Mediano plazo / Ciclo alcista.
export default function CosechaFeliz() {
  const {
    cosecha,
    cosechaValor,
    addCompraToken,
    updateCompraToken,
    deleteCompraToken,
    clearTokenCompras,
  } = usePortfolio()

  // Concentración por narrativa (alerta de sobreexposición, ej. AI/DePIN).
  const porNarrativa = cosecha.reduce((acc, t) => {
    const k = t.narrativa || 'Otros'
    acc[k] = (acc[k] || 0) + t.valorActual
    return acc
  }, {})
  const top = Object.entries(porNarrativa).sort((a, b) => b[1] - a[1])[0]
  const topPct = cosechaValor > 0 && top ? (top[1] / cosechaValor) * 100 : 0
  const concentrado = topPct >= 40

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🌱</span>
          <h1 className="text-xl font-bold">La Cosecha Feliz</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Mediano plazo · Altcoins</p>
      </header>

      <section className="card p-5">
        <p className="text-xs uppercase tracking-wide text-gray-400">
          Valor de la cosecha
        </p>
        <p className="text-3xl font-extrabold mt-1 tabular-nums">
          {fmtUsd(cosechaValor)}
        </p>
      </section>

      {concentrado && (
        <div className="card p-4 border-loss/30 bg-loss/5 flex gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm text-gray-300 leading-snug">
            <span className="font-semibold text-loss">
              {topPct.toFixed(0)}% de tu cosecha es {top[0]}.
            </span>{' '}
            Mucha concentración en una sola narrativa. Si ese sector se enfría,
            todo cae junto — considera diversificar.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {cosecha.map((t) => (
          <TokenCard
            key={t.symbol}
            token={t}
            onAdd={addCompraToken}
            onClear={clearTokenCompras}
            onUpdate={updateCompraToken}
            onDelete={deleteCompraToken}
          />
        ))}
      </div>
    </div>
  )
}
