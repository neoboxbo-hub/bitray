import { useState, useMemo } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { fmtUsd } from '../../utils/calculations'
import TpSlPanel from '../../components/shared/TpSlPanel'
import LiquidationHeatmap from '../turbo/LiquidationHeatmap'
import FearGreedWidget from '../turbo/FearGreedWidget'
import AINews from '../turbo/AINews'
import LiquidityPools from './LiquidityPools'

const GUIA_DEFAULT = `Mis reglas de trading:
• Solo opero con tendencia alcista confirmada (EMA 20 > EMA 50).
• Máximo 3% del capital por operación.
• Si Fear & Greed < 30 → busco compras. Si > 75 → soy cauto.
• Nunca muevo el Stop Loss en contra.`

export default function AsistenteOperacion() {
  const { cosecha, turbo, prices } = usePortfolio()

  // Todos los tokens del portafolio como opciones
  const allTokens = useMemo(() => {
    const c = cosecha.map(t => ({ ...t, modulo: 'Cosecha 🌱' }))
    const t = turbo.map(t => ({ ...t, modulo: 'Turbo ⚡' }))
    return [...c, ...t]
  }, [cosecha, turbo])

  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [guia, setGuia] = useState(GUIA_DEFAULT)
  const [editingGuia, setEditingGuia] = useState(false)

  const token = allTokens.find(t => t.symbol === selectedSymbol) || null

  // Cuando no hay token en portafolio, permite ingresar datos manuales
  const [manualEntrada, setManualEntrada] = useState('')
  const [manualCapital, setManualCapital] = useState('')

  const precioEntrada = token ? token.precioPromedio : parseFloat(manualEntrada) || 0
  const capital       = token ? token.costo         : parseFloat(manualCapital) || 0
  const precioActual  = token ? token.precioActual  : (prices[selectedSymbol] ?? 0)
  const hasData       = precioEntrada > 0 && capital > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h1 className="text-xl font-bold">Asistente de Operación</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Análisis técnico y toma de decisiones centralizada.
        </p>
      </header>

      {/* ── Selector de Token ── */}
      <section className="card p-4 space-y-3">
        <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
          ¿Con qué token quieres operar?
        </label>

        <select
          value={selectedSymbol}
          onChange={e => setSelectedSymbol(e.target.value)}
          className="field text-sm"
        >
          <option value="">— Selecciona un token —</option>
          {allTokens.map(t => (
            <option key={t.symbol} value={t.symbol}>
              {t.symbol} · {t.nombre} ({t.modulo})
            </option>
          ))}
        </select>

        {/* Si el token está en portafolio, muestra resumen rápido */}
        {token && (
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="bg-ink-800 rounded-lg py-2">
              <p className="text-[10px] text-gray-500">Entrada prom.</p>
              <p className="text-sm font-semibold tabular-nums">{fmtUsd(precioEntrada, 4)}</p>
            </div>
            <div className="bg-ink-800 rounded-lg py-2">
              <p className="text-[10px] text-gray-500">Precio actual</p>
              <p className="text-sm font-semibold tabular-nums">{fmtUsd(precioActual, 4)}</p>
            </div>
            <div className="bg-ink-800 rounded-lg py-2">
              <p className="text-[10px] text-gray-500">Capital</p>
              <p className="text-sm font-semibold tabular-nums">{fmtUsd(capital)}</p>
            </div>
          </div>
        )}

        {/* Entrada manual cuando no hay token seleccionado */}
        {!token && selectedSymbol === '' && (
          <div className="space-y-2 pt-1">
            <p className="text-xs text-gray-500">
              O calcula para cualquier par ingresando los datos:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number" inputMode="decimal" className="field py-2 text-sm"
                placeholder="Precio de entrada"
                value={manualEntrada}
                onChange={e => setManualEntrada(e.target.value)}
              />
              <input
                type="number" inputMode="decimal" className="field py-2 text-sm"
                placeholder="Capital invertido $"
                value={manualCapital}
                onChange={e => setManualCapital(e.target.value)}
              />
            </div>
          </div>
        )}
      </section>

      {/* ── A) Matriz de Objetivos TP / SL ── */}
      {hasData && (
        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold px-1">
            A · Matriz de objetivos
          </h2>
          <TpSlPanel
            precioEntrada={precioEntrada}
            capital={capital}
            precioActual={precioActual}
            symbol={selectedSymbol || '—'}
            forceOpen
          />
        </section>
      )}

      {!hasData && (
        <div className="card p-8 text-center space-y-2 border-dashed border-ink-600">
          <p className="text-3xl">🎯</p>
          <p className="text-sm text-gray-400">
            Selecciona un token arriba para ver la Matriz de TP/SL.
          </p>
        </div>
      )}

      {/* ── B) Indicadores de Decisión ── */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold px-1">
          B · Indicadores de decisión y liquidez
        </h2>
        <FearGreedWidget />
        <LiquidationHeatmap />
        <LiquidityPools
          symbol={selectedSymbol || 'BTC'}
          precioActual={precioActual || prices['BTC'] || 0}
        />
      </section>

      {/* ── C) Inteligencia y Guía Personal ── */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold px-1">
          C · Inteligencia y guía personal
        </h2>

        <AINews />

        {/* Prompt de Guía Extra */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              📋 Mis reglas de operación
            </h3>
            <button
              onClick={() => setEditingGuia(v => !v)}
              className="text-xs text-gray-400 underline active:text-gray-200"
            >
              {editingGuia ? 'Guardar' : 'Editar'}
            </button>
          </div>

          {editingGuia ? (
            <textarea
              className="field text-sm leading-relaxed resize-none"
              rows={8}
              value={guia}
              onChange={e => setGuia(e.target.value)}
              placeholder="Escribe aquí tus reglas personales de trading..."
            />
          ) : (
            <div className="space-y-1">
              {guia.split('\n').filter(Boolean).map((line, i) => (
                <p key={i} className="text-sm text-gray-300 leading-snug">
                  {line}
                </p>
              ))}
            </div>
          )}

          <p className="text-[10px] text-gray-600">
            Estas notas se guardan solo en este dispositivo.
          </p>
        </div>
      </section>
    </div>
  )
}
