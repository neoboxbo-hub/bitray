import { useState, useMemo } from 'react'
import { usePortfolio } from '../../context/PortfolioContext'
import { TOKEN_CATALOG } from '../../data/tokenCatalog'
import { fmtUsd, fmtNum, calcTurbo } from '../../utils/calculations'
import { TRADING_FEE_PCT } from '../../data/mockData'
import LiquidationHeatmap from '../turbo/LiquidationHeatmap'
import FearGreedWidget from '../turbo/FearGreedWidget'
import AINews from '../turbo/AINews'
import LiquidityPools from './LiquidityPools'
import RadarOportunidades from './RadarOportunidades'

// Análisis de sentimiento simulado por token.
const SENTIMIENTO = {
  BTC:  { texto: 'Bitcoin consolida por encima de los $105K tras la semana de menor volatilidad del trimestre. El índice Fear & Greed se mantiene en zona codiciosa (72). On-chain muestra acumulación neta de holders a largo plazo. Proyección: rango $103K–$112K en los próximos 7 días con sesgo alcista moderado.', tendencia: '📈 Alcista moderado', horizonte: '7–14 días' },
  ETH:  { texto: 'Ethereum rompe resistencia en $2,700 con volumen 2.1x superior al promedio. El ratio ETH/BTC repunta desde mínimos de 3 meses. Flujos netos positivos en ETFs spot desde hace 5 días consecutivos. Proyección: objetivo técnico $2,950, soporte clave en $2,580.', tendencia: '📈 Alcista', horizonte: '5–10 días' },
  SOL:  { texto: 'Solana mantiene dominio en actividad DeFi on-chain (52% del volumen DEX total). Precio rebota desde EMA50 diaria con vela envolvente alcista. Narrativa de gaming y memecoins sigue activa. Proyección: resistencia en $195, soporte fuerte $172.', tendencia: '📈 Alcista', horizonte: '3–7 días' },
  XRP:  { texto: 'XRP cotiza en rango estrecho $1.10–$1.22 a la espera del fallo final SEC. Volumen decae un 18% respecto a la semana pasada. Sin catalizador claro a corto plazo. Proyección: movimiento lateral probable, breakout esperado solo con noticia macro. Riesgo: ruptura bajista hacia $1.00.', tendencia: '➡️ Lateral', horizonte: '3–5 días' },
  FET:  { texto: 'Fetch.ai (FET) comprime en triángulo simétrico tras corrección del 28% desde máximos. La narrativa AI sigue siendo el sector con mayor capital rotante. Volumen de contratos perpetuos aumenta. Proyección: resolución del patrón en 3–5 días, objetivo alcista $2.10, stop sugerido $1.55.', tendencia: '⚡ Volátil / Breakout pendiente', horizonte: '3–5 días' },
  RON:  { texto: 'Ronin Network sorprende con un aumento del 340% en volumen de transacciones en 24h asociado al lanzamiento de una colaboración gaming. Zona de liquidaciones $3.20 actúa como imán de precio. Proyección: impulso de corto plazo viable hacia $3.60–$3.80, trailing stop recomendado.', tendencia: '📈 Alcista fuerte', horizonte: '1–4 días' },
  NEAR: { texto: 'NEAR Protocol confirma acumulación institucional en rango $4.80–$5.10. La integración con modelos de IA generativa atrae atención del mercado. Volumen 15% sobre media de 30 días. Proyección: objetivo $5.80, invalidación bajo $4.60.', tendencia: '📈 Alcista moderado', horizonte: '7–10 días' },
  DEFAULT: { texto: 'Sin datos de sentimiento disponibles para este token en este momento. Los indicadores generales del mercado muestran un sentimiento neutral-positivo. Procede con análisis técnico propio antes de operar.', tendencia: '➡️ Sin datos', horizonte: 'N/A' },
}

const GUIA_DEFAULT = `Mis reglas de trading:
• Solo opero con tendencia alcista confirmada (EMA 20 > EMA 50).
• Máximo 3% del capital por operación.
• Si Fear & Greed < 30 → busco compras. Si > 75 → soy cauto.
• Nunca muevo el Stop Loss en contra.`

export default function AsistenteOperacion() {
  const { cosecha, turbo, prices } = usePortfolio()

  // Todos los tokens del catálogo enriquecidos con datos de portafolio si existen
  const portfolioMap = useMemo(() => {
    const map = {}
    ;[...cosecha, ...turbo].forEach(t => { map[t.symbol] = t })
    return map
  }, [cosecha, turbo])

  const allOptions = useMemo(() => {
    return TOKEN_CATALOG.map(t => ({
      ...t,
      enPortafolio: !!portfolioMap[t.symbol],
      modulo: portfolioMap[t.symbol]
        ? (cosecha.find(c => c.symbol === t.symbol) ? 'Cosecha 🌱' : 'Turbo ⚡')
        : null,
    }))
  }, [portfolioMap, cosecha, turbo])

  const [selectedSymbol, setSelectedSymbol] = useState('')
  const [guia, setGuia] = useState(GUIA_DEFAULT)
  const [editingGuia, setEditingGuia] = useState(false)

  // Inputs de capital y precio (editables independientemente)
  const portfolioToken = portfolioMap[selectedSymbol]
  const [capital, setCapital]     = useState('200')
  const [entrada, setEntrada]     = useState('')

  // Cuando cambia el token, pre-rellena con datos del portafolio si existen
  const handleSelectToken = (sym) => {
    setSelectedSymbol(sym)
    const pt = portfolioMap[sym]
    if (pt) {
      setCapital(pt.costo > 0 ? pt.costo.toFixed(2) : '200')
      setEntrada(pt.precioPromedio > 0 ? pt.precioPromedio.toFixed(6) : '')
    } else {
      setCapital('200')
      setEntrada('')
    }
  }

  const precioEntrada  = parseFloat(entrada) || 0
  const capitalNum     = parseFloat(capital) || 0
  const precioActual   = portfolioToken?.precioActual ?? prices[selectedSymbol] ?? 0
  const hasCalcData    = precioEntrada > 0 && capitalNum > 0

  // Recalcula TP/SL en tiempo real
  const resultado = useMemo(() => {
    if (!hasCalcData) return null
    return calcTurbo({
      precioCompra: precioEntrada,
      capital: capitalNum,
      feePct: TRADING_FEE_PCT,
      riesgoPct: 1.5,
      targets: [2, 3, 4],
    })
  }, [precioEntrada, capitalNum, hasCalcData])

  const [riesgoPct, setRiesgoPct] = useState('1.5')
  const resultadoFull = useMemo(() => {
    if (!hasCalcData) return null
    return calcTurbo({
      precioCompra: precioEntrada,
      capital: capitalNum,
      feePct: TRADING_FEE_PCT,
      riesgoPct: parseFloat(riesgoPct) || 1.5,
      targets: [2, 3, 4],
    })
  }, [precioEntrada, capitalNum, riesgoPct, hasCalcData])

  const sentimiento = selectedSymbol
    ? (SENTIMIENTO[selectedSymbol] || SENTIMIENTO.DEFAULT)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <header>
        <div className="flex items-center gap-2">
          <span className="text-2xl">🎯</span>
          <h1 className="text-xl font-bold">Asistente de Operación</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">Análisis y toma de decisiones centralizada.</p>
      </header>

      {/* ── Selector de Token ── */}
      <section className="card p-4 space-y-3">
        <label className="text-xs uppercase tracking-wide text-gray-400 font-semibold">
          ¿Con qué token quieres operar?
        </label>
        <select
          value={selectedSymbol}
          onChange={e => handleSelectToken(e.target.value)}
          className="field text-sm"
        >
          <option value="">— Selecciona un token —</option>
          <optgroup label="En tu portafolio">
            {allOptions.filter(t => t.enPortafolio).map(t => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol} · {t.nombre} ({t.modulo})
              </option>
            ))}
          </optgroup>
          <optgroup label="Lista de seguimiento">
            {allOptions.filter(t => !t.enPortafolio).map(t => (
              <option key={t.symbol} value={t.symbol}>
                {t.symbol} · {t.nombre} · {t.narrativa}
              </option>
            ))}
          </optgroup>
        </select>

        {/* Precio actual de mercado */}
        {selectedSymbol && (
          <div className="flex items-center justify-between bg-ink-800 rounded-lg px-3 py-2">
            <span className="text-xs text-gray-500">Precio actual ({selectedSymbol})</span>
            <span className="font-semibold tabular-nums text-sm">
              {precioActual > 0 ? fmtUsd(precioActual, 4) : '—'}
            </span>
          </div>
        )}
      </section>

      {/* ── A) Calculadora TP/SL con inputs editables ── */}
      {selectedSymbol && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold px-1">
            A · Matriz de objetivos
          </h2>
          <div className="card p-4 space-y-3">
            {/* Inputs de capital y precio */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-500">Capital (USD)</label>
                <input
                  type="number" inputMode="decimal" className="field py-2 text-sm mt-1"
                  placeholder="200"
                  value={capital}
                  onChange={e => setCapital(e.target.value)}
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-wide text-gray-500">Precio entrada</label>
                <input
                  type="number" inputMode="decimal" className="field py-2 text-sm mt-1"
                  placeholder={precioActual > 0 ? precioActual.toFixed(4) : '0.00'}
                  value={entrada}
                  onChange={e => setEntrada(e.target.value)}
                />
              </div>
            </div>

            {/* Botón "usar precio actual" */}
            {precioActual > 0 && (
              <button
                onClick={() => setEntrada(precioActual.toFixed(6))}
                className="text-xs text-blue-400 underline active:text-blue-300"
              >
                Usar precio actual ({fmtUsd(precioActual, 4)})
              </button>
            )}

            {/* Selector de riesgo */}
            {hasCalcData && (
              <>
                <div>
                  <p className="text-[10px] uppercase tracking-wide text-gray-500 mb-1">Riesgo Stop Loss</p>
                  <div className="flex gap-1.5">
                    {['1', '1.5', '2', '3'].map(v => (
                      <button key={v} onClick={() => setRiesgoPct(v)}
                        className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                          riesgoPct === v ? 'bg-loss/20 border-loss text-loss' : 'border-ink-600 text-gray-400'
                        }`}>
                        {v}%
                      </button>
                    ))}
                  </div>
                </div>

                {/* Resumen */}
                <div className="grid grid-cols-3 gap-1.5 text-center">
                  <div className="bg-ink-800 rounded-lg py-2">
                    <p className="text-[10px] text-gray-500">Entrada</p>
                    <p className="text-xs font-semibold tabular-nums">{fmtUsd(precioEntrada, 4)}</p>
                  </div>
                  <div className="bg-ink-800 rounded-lg py-2">
                    <p className="text-[10px] text-gray-500">Capital</p>
                    <p className="text-xs font-semibold tabular-nums">{fmtUsd(capitalNum)}</p>
                  </div>
                  <div className="bg-ink-800 rounded-lg py-2">
                    <p className="text-[10px] text-gray-500">Unidades</p>
                    <p className="text-xs font-semibold tabular-nums">{fmtNum(resultadoFull?.tokens, 3)}</p>
                  </div>
                </div>

                {/* Take Profits */}
                <div className="space-y-1.5">
                  {resultadoFull?.tps.map(tp => (
                    <div key={tp.pct}
                      className="flex items-center gap-2 bg-profit/10 border border-profit/25 rounded-xl px-3 py-2">
                      <span className="chip bg-profit/20 text-profit text-[11px] shrink-0">+{tp.pct}%</span>
                      <span className="font-bold tabular-nums text-sm flex-1 text-center">{fmtUsd(tp.precioVenta, 4)}</span>
                      <span className="text-xs text-profit font-semibold shrink-0">+{fmtUsd(tp.gananciaUsd)}</span>
                    </div>
                  ))}
                </div>

                {/* Stop Limit */}
                <div className="bg-loss/10 border border-loss/25 rounded-xl px-3 py-2.5 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="chip bg-loss/20 text-loss text-[11px]">🛡️ Stop trigger</span>
                    <span className="font-bold tabular-nums text-sm text-loss">{fmtUsd(resultadoFull?.stopPrice, 4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">Limit</span>
                    <span className="text-[11px] text-gray-400 tabular-nums">{fmtUsd(resultadoFull?.stopLimit, 4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-gray-500">Pérdida máx.</span>
                    <span className="text-[11px] text-loss tabular-nums">{fmtUsd(resultadoFull?.perdidaMax)}</span>
                  </div>
                </div>

                <p className="text-[10px] text-gray-600">
                  Neto descontando {TRADING_FEE_PCT}% comisión por lado.
                </p>
              </>
            )}

            {!hasCalcData && (
              <p className="text-xs text-gray-500 text-center py-2">
                Ingresa capital y precio de entrada para calcular.
              </p>
            )}
          </div>
        </section>
      )}

      {/* ── Análisis de Sentimiento ── */}
      {sentimiento && (
        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold px-1">
            Análisis de sentimiento · {selectedSymbol}
          </h2>
          <div className="card p-4 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="chip bg-blue-500/20 text-blue-300 text-[10px]">🤖 Perplexity*</span>
              <span className={`chip text-[10px] ${
                sentimiento.tendencia.startsWith('📈') ? 'bg-profit/15 text-profit' :
                sentimiento.tendencia.startsWith('➡️') ? 'bg-gray-500/15 text-gray-400' :
                'bg-yellow-400/15 text-yellow-400'
              }`}>{sentimiento.tendencia}</span>
              <span className="text-[10px] text-gray-500">Horizonte: {sentimiento.horizonte}</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed">{sentimiento.texto}</p>
            <p className="text-[10px] text-gray-600">* Análisis simulado. Integración real con Perplexity en Fase 2.</p>
          </div>
        </section>
      )}

      {/* ── B) Indicadores ── */}
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

      {/* ── C) Inteligencia ── */}
      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wide text-gray-400 font-semibold px-1">
          C · Inteligencia y guía personal
        </h2>
        <AINews />
        <RadarOportunidades />

        {/* Mis reglas */}
        <div className="card p-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">📋 Mis reglas de operación</h3>
            <button onClick={() => setEditingGuia(v => !v)}
              className="text-xs text-gray-400 underline active:text-gray-200">
              {editingGuia ? 'Guardar' : 'Editar'}
            </button>
          </div>
          {editingGuia ? (
            <textarea className="field text-sm leading-relaxed resize-none" rows={8}
              value={guia} onChange={e => setGuia(e.target.value)}
              placeholder="Escribe aquí tus reglas personales de trading..." />
          ) : (
            <div className="space-y-1">
              {guia.split('\n').filter(Boolean).map((line, i) => (
                <p key={i} className="text-sm text-gray-300 leading-snug">{line}</p>
              ))}
            </div>
          )}
          <p className="text-[10px] text-gray-600">Estas notas se guardan solo en este dispositivo.</p>
        </div>
      </section>
    </div>
  )
}
