import { useEffect, useRef } from 'react'

const UMBRAL_PCT  = 3        // % de cambio para disparar alerta
const COOLDOWN_MS = 30 * 60 * 1000  // 30 min entre alertas del mismo token

// Guarda precios de referencia al inicio de la sesión (se resetean al recargar)
const BASELINE = {}   // { symbol: precio }
const ALERTED  = {}   // { symbol: timestamp última alerta }

function puedeAlertar(symbol) {
  const last = ALERTED[symbol]
  return !last || (Date.now() - last) > COOLDOWN_MS
}

function dispararNotificacion(symbol, nombre, pct, precioActual) {
  if (Notification.permission !== 'granted') return

  const subida = pct > 0
  const emoji  = subida ? '🚀' : '📉'
  const signo  = subida ? '+' : ''
  const precio = precioActual < 1
    ? `$${precioActual.toFixed(4)}`
    : `$${precioActual.toLocaleString('en-US', { maximumFractionDigits: 2 })}`

  new Notification(`${emoji} ${symbol} ${signo}${pct.toFixed(1)}%`, {
    body: `${nombre} cotiza a ${precio}`,
    icon: '/manifest.json',
    tag:  symbol,
    renotify: true,
  })

  ALERTED[symbol] = Date.now()
}

export function useAlertasPrecio({ tokens = [], prices = {} }) {
  const initialized = useRef(false)

  // Establece precios de referencia la primera vez que llegan precios reales
  useEffect(() => {
    if (initialized.current) return
    if (Object.keys(prices).length === 0) return

    tokens.forEach(({ symbol }) => {
      const p = prices[symbol]
      if (p && p > 0) BASELINE[symbol] = p
    })

    initialized.current = true
  }, [prices, tokens])

  // Revisa cambio vs baseline en cada actualización de precios
  useEffect(() => {
    if (!initialized.current) return
    if (Notification.permission !== 'granted') return

    tokens.forEach(({ symbol, nombre }) => {
      const base   = BASELINE[symbol]
      const actual = prices[symbol]
      if (!base || !actual || actual <= 0) return

      const pct = ((actual - base) / base) * 100

      if (Math.abs(pct) >= UMBRAL_PCT && puedeAlertar(symbol)) {
        dispararNotificacion(symbol, nombre || symbol, pct, actual)
      }
    })
  }, [prices, tokens])
}
