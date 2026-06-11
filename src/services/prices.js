// ============================================================
//  Servicio de precios · Binance API pública (gratis, sin key)
//  GET /api/v3/ticker/24hr  → precio spot + variación 1h y 24h.
// ============================================================
import { mockPrices } from '../data/mockData'

// Símbolo interno → par USDT de Binance (solo los que existen en spot).
// Los que NO están aquí (KCS, AKT, RON, ATH) conservan precio mock sin variación.
export const BINANCE_PAIRS = {
  BTC:    'BTCUSDT',
  ETH:    'ETHUSDT',
  BNB:    'BNBUSDT',
  SOL:    'SOLUSDT',
  NEAR:   'NEARUSDT',
  AAVE:   'AAVEUSDT',
  RENDER: 'RENDERUSDT',
  FET:    'FETUSDT',
  AR:     'ARUSDT',
  THETA:  'THETAUSDT',
  VET:    'VETUSDT',
  XRP:    'XRPUSDT',
  DOGE:   'DOGEUSDT',
  LINK:   'LINKUSDT',
  TFUEL:  'TFUELUSDT',
  PIXEL:  'PIXELUSDT',
}

// Nota: Binance expone cambio 24h directamente.
// Para 1h usamos el endpoint windowSize=1h (disponible en /api/v3/ticker).
const BASE_24H = 'https://api.binance.com/api/v3/ticker/24hr'
const BASE_1H  = 'https://api.binance.com/api/v3/ticker?windowSize=1h'

// Devuelve { prices: {SYMBOL: precio}, changes: {SYMBOL: {h1, h24}} }
export async function fetchPrices() {
  const pairs = Object.values(BINANCE_PAIRS)
  const qs = `symbols=${encodeURIComponent(JSON.stringify(pairs))}`

  const [res24, res1h] = await Promise.all([
    fetch(`${BASE_24H}?${qs}`),
    fetch(`${BASE_1H}&${qs}`),
  ])

  if (!res24.ok) throw new Error(`Binance 24h respondió ${res24.status}`)
  if (!res1h.ok) throw new Error(`Binance 1h respondió ${res1h.status}`)

  const [data24, data1h] = await Promise.all([res24.json(), res1h.json()])

  // Indexar por par
  const by24 = Object.fromEntries(data24.map((d) => [d.symbol, d]))
  const by1h  = Object.fromEntries(data1h.map((d) => [d.symbol, d]))

  // Partir del mock y sobreescribir con datos reales
  const prices  = { ...mockPrices }
  const changes = {}

  for (const [symbol, pair] of Object.entries(BINANCE_PAIRS)) {
    const d24 = by24[pair]
    const d1  = by1h[pair]
    if (d24) {
      prices[symbol] = parseFloat(d24.lastPrice)
      changes[symbol] = {
        h24: parseFloat(d24.priceChangePercent),          // % cambio 24h
        h1:  d1 ? parseFloat(d1.priceChangePercent) : null, // % cambio 1h
      }
    }
  }

  return { prices, changes }
}
