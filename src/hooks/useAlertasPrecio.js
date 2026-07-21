import { useEffect, useRef } from 'react'
import { sendTelegram, getTgConfig } from '../services/telegram'

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

function notifBrowser(titulo, cuerpo, urgente = false) {
  if (Notification.permission !== 'granted') return
  if (urgente && 'vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300])
  new Notification(titulo, { body: cuerpo, tag: titulo, renotify: true, requireInteraction: urgente })
}

function notifTelegram(emoji, symbol, pct, precioActual, precioPromedio, mensaje) {
  if (!getTgConfig()) return
  const signo = pct >= 0 ? '+' : ''
  const texto =
    `${emoji} <b>${symbol} ${signo}${pct.toFixed(1)}%</b>\n` +
    `💰 Precio actual: <b>${fmtP(precioActual)}</b>\n` +
    `📌 Tu entrada: ${fmtP(precioPromedio)}\n` +
    `${mensaje}`
  sendTelegram(texto)
}

function revisar({ symbol, nombre, precioPromedio, precioActual }) {
  if (!precioPromedio || precioPromedio <= 0) return
  if (!precioActual  || precioActual  <= 0) return

  const pct = ((precioActual - precioPromedio) / precioPromedio) * 100

  if (Math.abs(pct) <= 0.5 && puedeAlertar(symbol, 'be')) {
    notifBrowser(`⚖️ ${symbol} tocó tu precio promedio`, `${fmtP(precioActual)} · Entrada: ${fmtP(precioPromedio)}`, true)
    notifTelegram('⚖️', symbol, pct, precioActual, precioPromedio, '📊 Tocó tu precio de entrada (break-even)')
    marcarAlertado(symbol, 'be')
  }
  if (pct >= 2 && pct < 3 && puedeAlertar(symbol, 'p2')) {
    notifBrowser(`📈 ${symbol} +2% sobre tu entrada`, `${fmtP(precioActual)}`, false)
    notifTelegram('📈', symbol, pct, precioActual, precioPromedio, '💡 +2% sobre tu precio de entrada')
    marcarAlertado(symbol, 'p2')
  }
  if (pct >= 3 && pct < 5 && puedeAlertar(symbol, 'p3')) {
    notifBrowser(`🚀 ${symbol} +3% sobre tu entrada`, `${fmtP(precioActual)} · Considera tomar ganancias`, true)
    notifTelegram('🚀', symbol, pct, precioActual, precioPromedio, '💡 Considera tomar ganancias parciales')
    marcarAlertado(symbol, 'p3')
  }
  if (pct >= 5 && puedeAlertar(symbol, 'p5')) {
    notifBrowser(`🔥 ${symbol} +5% sobre tu entrada`, `${fmtP(precioActual)} · ¡TP cerca!`, true)
    notifTelegram('🔥', symbol, pct, precioActual, precioPromedio, '🎯 ¡Tu Take Profit puede estar cerca!')
    marcarAlertado(symbol, 'p5')
  }
  if (pct <= -3 && puedeAlertar(symbol, 'sl')) {
    notifBrowser(`⚠️ ${symbol} -3% bajo tu entrada`, `${fmtP(precioActual)} · Revisa tu Stop Loss`, true)
    notifTelegram('⚠️', symbol, pct, precioActual, precioPromedio, '🛡️ Revisa tu Stop Loss')
    marcarAlertado(symbol, 'sl')
  }
}

export function useAlertasPrecio({ tokens = [] }) {
  const prevPrices = useRef({})

  useEffect(() => {
    if (tokens.length === 0) return

    let hayCambio = false
    for (const t of tokens) {
      if (prevPrices.current[t.symbol] !== t.precioActual) { hayCambio = true; break }
    }
    if (!hayCambio) return

    tokens.forEach(revisar)

    const next = {}
    tokens.forEach(t => { next[t.symbol] = t.precioActual })
    prevPrices.current = next
  })
}
