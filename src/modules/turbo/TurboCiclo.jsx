import { useState } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd, fmtNum, fmtPct } from '../../utils/calculations'
import ConfirmDialog from '../../components/shared/ConfirmDialog'
import TpSlPanel from '../../components/shared/TpSlPanel'
import AddTokenForm from '../../components/shared/AddTokenForm'
import TransactionHistory from '../../components/shared/TransactionHistory'
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

function TurboTokenCard({ token, onAdd, onClear, onUpdate, onDelete, onRemoveToken, onSetPrecio }) {
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
  const transacciones = token.compras   // all tx (buys + sells)
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
          {totalTx > 0 && (
            <p className={`text-xs font-medium ${up ? 'text-profit' : 'text-loss'}`}>
              {fmtPct(token.pnlPct)}
            </p>
          )}
        </div>
      </div>

      {/* Precio entrada / actual */}
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

      {/* PnL realizado */}
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

      <ConfirmDialog open={confirmClear} title={`¿Limpiar historial de ${token.symbol}?`}
        message="Se borran TODAS las transacciones (compras y ventas)."
        confirmText="Sí, limpiar"
        onConfirm={() => { onClear(token.symbol); setConfirmClear(false) }}
        onCancel={() => setConfirmClear(false)} />

      <ConfirmDialog open={confirmRemove} title={`¿Eliminar ${token.symbol} del Turbo?`}
        message="Se eliminará el token y todas sus transacciones."
        confirmText="Sí, eliminar"
        onConfirm={() => { onRemoveToken(token.symbol); setConfirmRemove(false) }}
        onCancel={() => setConfirmRemove(false)} />
    </div>
  )
}

export default function TurboCiclo() {
  const {
    turbo, turboValor,
    turbo_addToken, turbo_removeToken,
    turbo_addCompra, turbo_updateCompra,
    turbo_deleteCompra, turbo_clearCompras,
    turbo_setPrecioManual,
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

      {showAddForm && (
        <AddTokenForm
          onAdd={(token) => { turbo_addToken(token); setShowAddForm(false) }}
          onCancel={() => setShowAddForm(false)}
          excludeSymbols={turbo.map((t) => t.symbol)}
        />
      )}

      {turbo.length > 0 && turboValor > 0 && (
        <section className="card p-5">
          <p className="text-xs uppercase tracking-wide text-gray-400">Capital en Turbo</p>
          <p className="text-3xl font-extrabold mt-1 tabular-nums">{fmtUsd(turboValor)}</p>
        </section>
      )}

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
              onSetPrecio={turbo_setPrecioManual}
            />
          ))}
        </div>
      )}

      {/* Asistente de operación */}
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
