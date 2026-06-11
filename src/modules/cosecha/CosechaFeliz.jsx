import { useState } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtNum, fmtPct } from '../../utils/calculations'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import TpSlPanel from '../../components/shared/TpSlPanel'
import AddTokenForm from '../../components/shared/AddTokenForm'
import TransactionHistory from '../../components/shared/TransactionHistory'

const EXCHANGE_COLOR = {
  Binance: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30',
  Bybit:   'text-orange-400 bg-orange-400/10 border-orange-400/30',
  KuCoin:  'text-green-400  bg-green-400/10  border-green-400/30',
  OKX:     'text-blue-400   bg-blue-400/10   border-blue-400/30',
  Otro:    'text-gray-400   bg-gray-400/10   border-gray-400/30',
}

function TokenCard({ token, onAdd, onClear, onUpdate, onDelete, onRemoveToken, onSetPrecio }) {
  // formMode: null | 'compra' | 'venta'
  const [formMode, setFormMode]           = useState(null)
  const [showHistory, setShowHistory]     = useState(false)
  const [confirmClear, setConfirmClear]   = useState(false)
  const [confirmRemove, setConfirmRemove] = useState(false)
  const [cantidad, setCantidad]           = useState('')
  const [precio, setPrecio]               = useState(token.precioActual?.toString() || '')
  const [editingPrice, setEditingPrice]   = useState(false)
  const [precioInput, setPrecioInput]     = useState('')

  const up = token.pnlPct >= 0
  const exColor = EXCHANGE_COLOR[token.exchange] || EXCHANGE_COLOR['Otro']
  // token.compras almacena TODAS las transacciones (compras + ventas)
  const transacciones = token.compras
  const totalTx = transacciones.length
  const tieneVentas = transacciones.some((t) => t.tipo === 'venta')

  const openForm = (mode) => {
    setFormMode(mode)
    setPrecio(token.precioActual?.toString() || '')
    setCantidad('')
  }

  const submit = (e) => {
    e.preventDefault()
    const cant = parseFloat(cantidad)
    const pr   = parseFloat(precio)
    if (!cant || !pr) return
    onAdd(token.symbol, {
      fecha: new Date().toISOString().slice(0, 10),
      cantidad: cant,
      precio: pr,
      tipo: formMode,
    })
    setCantidad('')
    setFormMode(null)
  }

  return (
    <div className="card p-4">
      {/* Cabecera */}
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center flex-wrap gap-1.5">
            <p className="font-semibold">{token.symbol}</p>
            {token.categoria === 'spec'
              ? <span className="chip bg-loss/15 text-loss text-[10px]">Especulativo</span>
              : <span className="chip bg-profit/15 text-profit text-[10px]">Núcleo</span>}
            {token.narrativa &&
              <span className="chip bg-ink-600 text-gray-400 text-[10px]">{token.narrativa}</span>}
            {token.exchange &&
              <span className={`chip border text-[10px] ${exColor}`}>{token.exchange}</span>}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {token.nombre} · {fmtNum(token.cantidad, 4)} unidades
          </p>
        </div>
        <div className="text-right shrink-0">
          <p className="font-semibold tabular-nums">{fmtUsd(token.valorActual)}</p>
          <p className={`text-xs font-medium ${up ? 'text-profit' : 'text-loss'}`}>
            {fmtPct(token.pnlPct)}
          </p>
        </div>
      </div>

      {/* Equilibrio / precio actual */}
      {totalTx > 0 && (
        <div className="grid grid-cols-2 gap-2 mt-3 text-center">
          <div className="bg-ink-800 rounded-lg py-2">
            <p className="text-[10px] text-gray-500">Entrada (prom.)</p>
            <p className="text-sm font-semibold tabular-nums">
              {fmtUsd(token.precioPromedio, 4)}
            </p>
          </div>
          <div className="bg-ink-800 rounded-lg py-2 relative">
            <p className="text-[10px] text-gray-500 flex items-center justify-center gap-1">
              Precio actual
              {token.precioManual && (
                <span className="text-yellow-400 text-[9px]">✎manual</span>
              )}
            </p>
            {editingPrice ? (
              <div className="flex items-center gap-1 px-2">
                <input
                  type="number" inputMode="decimal"
                  className="field py-0.5 text-xs text-center w-full"
                  placeholder="0.00"
                  value={precioInput}
                  onChange={(e) => setPrecioInput(e.target.value)}
                  autoFocus
                />
                <button
                  onClick={() => {
                    const v = parseFloat(precioInput)
                    if (v > 0) onSetPrecio(token.symbol, v)
                    setEditingPrice(false)
                  }}
                  className="text-profit text-xs font-bold shrink-0">✓</button>
                <button
                  onClick={() => { onSetPrecio(token.symbol, null); setEditingPrice(false) }}
                  className="text-gray-500 text-xs shrink-0">✕</button>
              </div>
            ) : (
              <button
                onClick={() => { setPrecioInput(token.precioActual?.toString() || ''); setEditingPrice(true) }}
                className="text-sm font-semibold tabular-nums w-full active:opacity-70"
              >
                {fmtUsd(token.precioActual, 4)}
              </button>
            )}
          </div>
        </div>
      )}

      {/* PnL realizado (solo cuando hay ventas) */}
      {tieneVentas && (
        <div className="mt-2 bg-ink-800 rounded-lg px-3 py-2 flex justify-between items-center">
          <p className="text-[11px] text-gray-500">PnL Realizado</p>
          <p className={`text-sm font-semibold tabular-nums ${
            token.pnlRealizado >= 0 ? 'text-profit' : 'text-loss'
          }`}>
            {token.pnlRealizado >= 0 ? '+' : ''}{fmtUsd(token.pnlRealizado)}
          </p>
        </div>
      )}

      {/* Panel TP / Stop Loss */}
      {totalTx > 0 && (
        <TpSlPanel
          precioEntrada={token.precioPromedio}
          capital={token.costo}
          precioActual={token.precioActual}
          symbol={token.symbol}
        />
      )}

      {/* Toggle historial */}
      {totalTx > 0 && (
        <button
          onClick={() => setShowHistory((v) => !v)}
          className="w-full mt-2 text-xs font-medium text-gray-400 active:text-gray-200 py-1.5 flex items-center justify-center gap-1.5"
        >
          <span>📋</span>
          <span>{showHistory ? 'Ocultar historial' : `Ver historial (${totalTx})`}</span>
          <span>{showHistory ? '▲' : '▼'}</span>
        </button>
      )}

      {/* Historial unificado */}
      {showHistory && (
        <TransactionHistory
          transacciones={transacciones}
          precioPromedio={token.precioPromedio}
          onUpdate={onUpdate}
          onDelete={onDelete}
          symbol={token.symbol}
        />
      )}

      {/* Botones de acción / Formulario */}
      {formMode === null ? (
        <div className="flex gap-2 mt-3">
          <button onClick={() => openForm('compra')}
            className="flex-1 py-2 rounded-lg border border-ink-600 text-sm font-semibold text-profit/80 active:scale-[0.99]">
            ▲ Compra
          </button>
          <button onClick={() => openForm('venta')}
            className="flex-1 py-2 rounded-lg border border-ink-600 text-sm font-semibold text-loss/80 active:scale-[0.99]">
            ▼ Venta
          </button>
          {totalTx > 0 && (
            <button onClick={() => setConfirmClear(true)}
              className="px-3 py-2 rounded-lg border border-ink-600 text-gray-500 active:text-loss">🗑</button>
          )}
          <button onClick={() => setConfirmRemove(true)}
            className="px-3 py-2 rounded-lg border border-ink-600 text-gray-500 active:text-loss text-sm">✕</button>
        </div>
      ) : (
        <form onSubmit={submit} className="mt-3 space-y-2">
          <p className={`text-xs font-semibold uppercase tracking-wide ${
            formMode === 'compra' ? 'text-profit' : 'text-loss'
          }`}>
            {formMode === 'compra' ? '▲ Registrar compra' : '▼ Registrar venta'}
          </p>
          <input type="date" className="field py-2 text-sm"
            defaultValue={new Date().toISOString().slice(0, 10)} />
          <div className="grid grid-cols-2 gap-2">
            <input type="number" inputMode="decimal" className="field py-2" placeholder="Cantidad"
              value={cantidad} onChange={(e) => setCantidad(e.target.value)} autoFocus />
            <input type="number" inputMode="decimal" className="field py-2" placeholder="Precio"
              value={precio} onChange={(e) => setPrecio(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={() => setFormMode(null)}
              className="flex-1 py-2 rounded-lg border border-ink-600 text-gray-400 text-sm font-semibold">
              Cancelar
            </button>
            <button type="submit"
              className={`flex-1 py-2 rounded-xl text-sm font-bold ${
                formMode === 'compra'
                  ? 'bg-profit/20 text-profit border border-profit/40'
                  : 'bg-loss/20 text-loss border border-loss/40'
              }`}>
              Guardar {formMode}
            </button>
          </div>
        </form>
      )}

      {/* Diálogos de confirmación */}
      <ConfirmDialog open={confirmClear} title={`¿Limpiar historial de ${token.symbol}?`}
        message="Se borran TODAS las transacciones (compras y ventas)."
        confirmText="Sí, limpiar"
        onConfirm={() => { onClear(token.symbol); setConfirmClear(false) }}
        onCancel={() => setConfirmClear(false)} />

      <ConfirmDialog open={confirmRemove} title={`¿Eliminar ${token.symbol} de la Cosecha?`}
        message="Se eliminará el token y todas sus transacciones."
        confirmText="Sí, eliminar"
        onConfirm={() => { onRemoveToken(token.symbol); setConfirmRemove(false) }}
        onCancel={() => setConfirmRemove(false)} />
    </div>
  )
}

export default function CosechaFeliz() {
  const {
    cosecha, cosechaValor,
    cosecha_addToken, cosecha_removeToken,
    cosecha_addCompra, cosecha_updateCompra,
    cosecha_deleteCompra, cosecha_clearCompras,
    cosecha_setPrecioManual,
  } = usePortfolio()

  const [showAddForm, setShowAddForm] = useState(false)

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌱</span>
            <h1 className="text-xl font-bold">La Cosecha Feliz</h1>
          </div>
          <button
            onClick={() => setShowAddForm((v) => !v)}
            className="h-9 w-9 rounded-xl bg-brand/20 text-brand font-bold text-xl flex items-center justify-center active:scale-95"
          >
            {showAddForm ? '✕' : '+'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-1">Mediano plazo · Altcoins</p>
      </header>

      {showAddForm && (
        <AddTokenForm
          onAdd={(token) => { cosecha_addToken(token); setShowAddForm(false) }}
          onCancel={() => setShowAddForm(false)}
          excludeSymbols={cosecha.map((t) => t.symbol)}
        />
      )}

      {cosecha.length > 0 && (
        <section className="card p-5">
          <p className="text-xs uppercase tracking-wide text-gray-400">Valor de la cosecha</p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">{fmtUsd(cosechaValor)}</p>
        </section>
      )}

      {concentrado && (
        <div className="card p-4 border-loss/30 bg-loss/5 flex gap-3">
          <span className="text-2xl">⚠️</span>
          <p className="text-sm text-gray-300 leading-snug">
            <span className="font-semibold text-loss">{topPct.toFixed(0)}% de tu cosecha es {top[0]}.</span>{' '}
            Considera diversificar.
          </p>
        </div>
      )}

      {cosecha.length === 0 && !showAddForm ? (
        <div className="card p-8 text-center space-y-3">
          <p className="text-4xl">🌱</p>
          <p className="font-semibold text-gray-300">Sin tokens en la cosecha</p>
          <p className="text-sm text-gray-500">
            Toca el botón <span className="text-brand font-bold">+</span> para agregar tu primer token.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {cosecha.map((t) => (
            <TokenCard
              key={t.symbol}
              token={t}
              onAdd={cosecha_addCompra}
              onClear={cosecha_clearCompras}
              onUpdate={cosecha_updateCompra}
              onDelete={cosecha_deleteCompra}
              onRemoveToken={cosecha_removeToken}
              onSetPrecio={cosecha_setPrecioManual}
            />
          ))}
        </div>
      )}
    </div>
  )
}
