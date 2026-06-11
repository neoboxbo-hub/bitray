import { useState } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtNum, fmtPct } from '../../utils/calculations'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import TpSlPanel from '../../components/shared/TpSlPanel'
import AddTokenForm from '../../components/shared/AddTokenForm'
import FearGreedWidget from './FearGreedWidget'
import LiquidationHeatmap from './LiquidationHeatmap'
import AINews from './AINews'
import TurboCalculator from './TurboCalculator'

const EXCHANGE_COLOR = {
  Binance: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Bybit:   'text-orange-400 bg-orange-400/10 border-orange-400/30',
  KuCoin:  'text-green-400  bg-green-400/10  border-green-400/30',
  OKX:     'text-blue-400   bg-blue-400/10   border-blue-400/30',
  Otro:    'text-gray-400   bg-gray-400/10   border-gray-400/30',
}

// Tarjeta de token de Turbo — idéntica a Cosecha pero con foco en TP/SL
function TurboTokenCard({ token, onAdd, onClear, onUpdate, onDelete, onRemoveToken }) {
  const [open, setOpen]               = useState(false)
  const [showList, setShowList]       = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [confirmDel, setConfirmDel]   = useState(null)
  const [cantidad, setCantidad]       = useState('')
  const [precio, setPrecio]           = useState(token.precioActual?.toString() || '')
  const [editId, setEditId]           = useState(null)
  const [editForm, setEditForm]       = useState({ cantidad: '', precio: '' })

  const up = token.pnlPct >= 0
  const exColor = EXCHANGE_COLOR[token.exchange] || EXCHANGE_COLOR['Otro']

  const submit = (e) => {
    e.preventDefault()
    const cant = parseFloat(cantidad)
    const pr   = parseFloat(precio)
    if (!cant || !pr) return
    onAdd(token.symbol, { fecha: new Date().toISOString().slice(0, 10), cantidad: cant, precio: pr })
    setCantidad('')
    setOpen(false)
  }

  const startEdit = (c) => {
    setEditId(c.id)
    setEditForm({ cantidad: c.cantidad.toString(), precio: c.precio.toString() })
  }

  const saveEdit = () => {
    const cant = parseFloat(editForm.cantidad)
    const pr   = parseFloat(editForm.precio)
    if (!cant || !pr) return
    onUpdate(token.symbol, editId, { cantidad: cant, precio: pr })
    setEditId(null)
  }

  return (
    <div className="card p-4">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-1.5">
            <p className="font-semibold">{token.symbol}</p>
            {token.exchange &&
              <span className={`chip border text-[10px] ${exColor}`}>{token.exchange}</span>}
            {token.narrativa &&
              <span className="chip bg-ink-600 text-gray-400 text-[10px]">{token.narrativa}</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {token.nombre} · {fmtNum(token.cantidad, 4)} unidades
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold tabular-nums">{fmtUsd(token.valorActual)}</p>
          {token.compras.length > 0 && (
            <p className={`text-xs font-medium ${up ? 'text-profit' : 'text-loss'}`}>
              {fmtPct(token.pnlPct)}
            </p>
          )}
        </div>
      </div>

      {/* Precio actual y entrada */}
      {token.compras.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3 text-center">
          <div className="bg-ink-800 rounded-lg py-2">
            <p className="text-[10px] text-gray-500">Entrada (prom.)</p>
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
      )}

      {/* Panel TP / Stop Loss — el corazón del Turbo */}
      {token.compras.length > 0 && (
        <TpSlPanel
          precioEntrada={token.precioPromedio}
          capital={token.costo}
          precioActual={token.precioActual}
          symbol={token.symbol}
        />
      )}

      {/* Toggle compras */}
      {token.compras.length > 0 && (
        <button
          onClick={() => setShowList((v) => !v)}
          className="w-full mt-2 text-xs font-medium text-gray-400 active:text-gray-200 py-1"
        >
          {showList ? '▲ Ocultar compras' : `▼ Ver ${token.compras.length} compra(s)`}
        </button>
      )}

      {showList && (
        <ul className="mt-2 space-y-1.5">
          {token.compras.map((c) =>
            editId === c.id ? (
              <li key={c.id} className="bg-ink-800 rounded-lg p-2 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <input type="number" inputMode="decimal" className="field py-1.5 text-sm"
                    placeholder="Cantidad" value={editForm.cantidad}
                    onChange={(e) => setEditForm({ ...editForm, cantidad: e.target.value })} />
                  <input type="number" inputMode="decimal" className="field py-1.5 text-sm"
                    placeholder="Precio" value={editForm.precio}
                    onChange={(e) => setEditForm({ ...editForm, precio: e.target.value })} />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => setEditId(null)}
                    className="flex-1 py-1.5 rounded-lg border border-ink-600 text-gray-400 text-xs font-semibold">Cancelar</button>
                  <button onClick={saveEdit} className="btn-primary flex-1 py-1.5 text-xs">Guardar</button>
                </div>
              </li>
            ) : (
              <li key={c.id} className="flex items-center justify-between gap-2 bg-ink-800 rounded-lg px-3 py-2 text-sm">
                <div className="min-w-0">
                  <p className="tabular-nums">{fmtNum(c.cantidad, 4)} @ {fmtUsd(c.precio, 4)}</p>
                  <p className="text-[11px] text-gray-500">{c.fecha}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <button onClick={() => startEdit(c)}
                    className="h-7 w-7 rounded-md border border-ink-600 text-gray-400 active:text-brand text-xs">✏️</button>
                  <button onClick={() => setConfirmDel(c.id)}
                    className="h-7 w-7 rounded-md border border-ink-600 text-loss/80 active:text-loss text-xs">🗑</button>
                </div>
              </li>
            )
          )}
        </ul>
      )}

      {/* Acciones */}
      {!open ? (
        <div className="flex gap-2 mt-3">
          <button onClick={() => setOpen(true)}
            className="flex-1 py-2 rounded-lg border border-ink-600 text-sm font-semibold text-gray-300 active:scale-[0.99]">
            + Registrar compra
          </button>
          {token.compras.length > 0 && (
            <button onClick={() => setConfirmClear(true)}
              className="px-3 py-2 rounded-lg border border-ink-600 text-loss/80 active:text-loss">🗑</button>
          )}
          <button onClick={() => setConfirmRemove(true)}
            className="px-3 py-2 rounded-lg border border-ink-600 text-gray-500 active:text-loss text-sm">✕</button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <input type="number" inputMode="decimal" className="field py-2" placeholder="Cantidad"
              value={cantidad} onChange={(e) => setCantidad(e.target.value)} />
            <input type="number" inputMode="decimal" className="field py-2" placeholder="Precio"
              value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setOpen(false)}
              className="flex-1 py-2 rounded-lg border border-ink-600 text-gray-400 text-sm font-semibold">Cancelar</button>
            <button type="submit" className="btn-primary flex-1 py-2 text-sm">Guardar</button>
          </div>
        </form>
      )}

      <ConfirmDialog open={confirmClear} title={`¿Limpiar compras de ${token.symbol}?`}
        message="Se borran todas las compras del token."
        confirmText="Sí, limpiar"
        onConfirm={() => { onClear(token.symbol); setConfirmClear(false) }}
        onCancel={() => setConfirmClear(false)} />

      <ConfirmDialog open={confirmRemove} title={`¿Eliminar ${token.symbol} del Turbo?`}
        message="Se eliminará el token y todas sus compras."
        confirmText="Sí, eliminar"
        onConfirm={() => { onRemoveToken(token.symbol); setConfirmRemove(false) }}
        onCancel={() => setConfirmRemove(false)} />

      <ConfirmDialog open={confirmDel !== null} title="¿Eliminar esta compra?"
        message="Se elimina solo este registro. El promedio se recalcula."
        confirmText="Sí, eliminar"
        onConfirm={() => { onDelete(token.symbol, confirmDel); setConfirmDel(null) }}
        onCancel={() => setConfirmDel(null)} />
    </div>
  )
}

// Pantalla Módulo 3
export default function TurboCiclo() {
  const {
    turbo, turboValor,
    turbo_addToken, turbo_removeToken,
    turbo_addCompra, turbo_updateCompra,
    turbo_deleteCompra, turbo_clearCompras,
  } = usePortfolio()

  const [showAddForm, setShowAddForm]       = useState(false)
  const [showCalculator, setShowCalculator] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-xl font-bold">El Turbo-Ciclo</h1>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="h-9 w-9 rounded-xl bg-blue-500/20 text-blue-300 font-bold text-xl flex items-center justify-center active:scale-95"
          >
            {showAddForm ? '✕' : '+'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">Corto plazo · Captura ganancias del 2–4% por ciclo.</p>
      </header>

      {/* Formulario agregar token */}
      {showAddForm && (
        <AddTokenForm
          onAdd={(token) => { turbo_addToken(token); setShowAddForm(false) }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {/* Balance Turbo */}
      {turbo.length > 0 && turboValor > 0 && (
        <section className="card p-5">
          <p className="text-xs uppercase tracking-wide text-gray-400">Capital en Turbo</p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">{fmtUsd(turboValor)}</p>
        </section>
      )}

      {/* Tokens de trading */}
      {turbo.length === 0 && !showAddForm ? (
        <div className="card p-8 text-center space-y-3">
          <p className="text-4xl">⚡</p>
          <p className="font-semibold text-gray-300">Sin tokens en el Turbo</p>
          <p className="text-sm text-gray-500">
            Toca <span className="text-blue-300 font-bold">+</span> para agregar un token de trading.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {turbo.map((t) => (
            <TurboTokenCard
              key={t.symbol}
              token={t}
              onAdd={turbo_addCompra}
              onClear={turbo_clearCompras}
              onUpdate={turbo_updateCompra}
              onDelete={turbo_deleteCompra}
              onRemoveToken={turbo_removeToken}
            />
          ))}
        </div>
      )}

      {/* Asistente de operación (colapsado) */}
      <section>
        <button
          onClick={() => setShowCalculator((v) => !v)}
          className="w-full card p-4 flex items-center justify-between active:scale-[0.99] transition-transform"
        >
          <div className="flex items-center gap-3">
            <span className="text-xl">🎯</span>
            <div className="text-left">
              <p className="font-semibold">Asistente de operación</p>
              <p className="text-xs text-gray-500">Calcula TP/SL manualmente para cualquier par</p>
            </div>
          </div>
          <span className="text-gray-400 text-lg">{showCalculator ? '▲' : '▼'}</span>
        </button>
        {showCalculator && (
          <div className="mt-2">
            <TurboCalculator />
          </div>
        )}
      </section>

      {/* Indicadores de decisión */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-400">
          Indicadores de decisión
        </h2>
        <FearGreedWidget />
        <LiquidationHeatmap />
        <AINews />
      </section>
    </div>
  )
}
