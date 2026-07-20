import { useEffect, useRef } from 'react'

// Alertas inteligentes vs precio promedio de compra:
// breakeven ±0.5%, +2%, +3%, +5%, -3% (riesgo)

const COOLDOWN_MS = 20 * 60 * 1000
const ALERTED = {}

function puedeAlertar(symbol, nivel) {
  const k = `${symbol}_${nivel}`
  const last = ALERTED[k]
  return !last || Date.now() - last > COOLDOWN_MS
}

function marcarAlertado(symbol, nivel) {
  ALERTED[`${symbol}_${nivel}`] = Date.now()
}

function fmtP(p) {
  if (!p) return '—'
  return p < 1 ? `$${p.toFixed(4)}` : `$${p.toLocaleString('en-US', { maximumFractionDigits: 2 })}`
}

function notif(titulo, cuerpo, urgente = false) {
  if (Notification.permission !== 'granted') return
  if (urgente && 'vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300])
  new Notification(titulo, {
    body: cuerpo,
    tag: titulo,
    renotify: true,
    requireInteraction: urgente,
  })
}

function revisar({ symbol, nombre, precioPromedio, precioActual }) {
  if (!precioPromedio || precioPromedio <= 0) return
  if (!precioActual  || precioActual  <= 0) return

  const pct = ((precioActual - precioPromedio) / precioPromedio) * 100
  const nom = nombre || symbol

  if (Math.abs(pct) <= 0.5 && puedeAlertar(symbol, 'be')) {
    notif(`⚖️ ${symbol} tocó tu precio promedio`, `${fmtP(precioActual)} · Entrada: ${fmtP(precioPromedio)}`, true)
    marcarAlertado(symbol, 'be')
  }
  if (pct >= 2 && pct < 3 && puedeAlertar(symbol, 'p2')) {
    notif(`📈 ${symbol} +2% sobre tu entrada`, `${fmtP(precioActual)} · ${nom}`, false)
    marcarAlertado(symbol, 'p2')
  }
  if (pct >= 3 && pct < 5 && puedeAlertar(symbol, 'p3')) {
    notif(`🚀 ${symbol} +3% sobre tu entrada`, `${fmtP(precioActual)} · Considera tomar ganancias parciales`, true)
    marcarAlertado(symbol, 'p3')
  }
  if (pct >= 5 && puedeAlertar(symbol, 'p5')) {
    notif(`🔥 ${symbol} +5% sobre tu entrada`, `${fmtP(precioActual)} · ¡Tu TP puede estar cerca!`, true)
    marcarAlertado(symbol, 'p5')
  }
  if (pct <= -3 && puedeAlertar(symbol, 'sl')) {
    notif(`⚠️ ${symbol} -3% bajo tu entrada`, `${fmtP(precioActual)} · Revisa tu Stop Loss`, true)
    marcarAlertado(symbol, 'sl')
  }
}

export function useAlertasPrecio({ tokens = [] }) {
  // Usar ref para detectar cambios reales de precio y no disparar en cada render
  const prevPrices = useRef({})

  useEffect(() => {
    if (Notification.permission !== 'granted') return
    if (tokens.length === 0) return

    // Solo revisar si algún precio cambió
    let hayCAmbio = false
    for (const t of tokens) {
      if (prevPrices.current[t.symbol] !== t.precioActual) {
        hayCAmbio = true
        break
      }
    }
    if (!hayCAmbio) return

    tokens.forEach(revisar)

    // Actualizar referencia
    const next = {}
    tokens.forEach(t => { next[t.symbol] = t.precioActual })
    prevPrices.current = next
  })
}
