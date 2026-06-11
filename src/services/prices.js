// ============================================================
//  Servicio de precios · Binance API pública (gratis, sin key)
//  GET /api/v3/ticker/price  → precios spot en vivo.
// ============================================================
import { mockPrices } from '../data/mockData'

// Símbolo interno → par USDT de Binance (solo los que existen en spot).
// Los que NO están aquí (KCS, AKT, RON, ATH) conservan su precio mock.
export const BINANCE_PAIRS = {
  BTC: 'BTCUSDT',
  ETH: 'ETHUSDT',
  BNB: 'BNBUSDT',
  SOL: 'SOLUSDT',
  NEAR: 'NEARUSDT',
  AAVE: 'AAVEUSDT',
  RENDER: 'RENDERUSDT',
  FET: 'FETUSDT',
  AR: 'ARUSDT',
  THETA: 'THETAUSDT',
  VET: 'VETUSDT',
  XRP: 'XRPUSDT',
  DOGE: 'DOGEUSDT',
  LINK: 'LINKUSDT',
  TFUEL: 'TFUELUSDT',
  PIXEL: 'PIXELUSDT',
}

const BASE = 'https://api.binance.com/api/v3/ticker/price'

// Devuelve un mapa { SYMBOL: precio } combinando Binance (en vivo) + mock (fallback).
export async function fetchPrices() {
  const pairs = Object.values(BINANCE_PAIRS)
  const url = `${BASE}?symbols=${encodeURIComponent(JSON.stringify(pairs))}`

  const res = await fetch(url)
  if (!res.ok) throw new Error(`Binance respondió ${res.status}`)

  const data = await res.json() // [{ symbol: 'BTCUSDT', price: '67250.00' }, ...]
  const byPair = Object.fromEntries(
    data.map((d) => [d.symbol, parseFloat(d.price)]),
  )

  // Partimos del mock para conservar los tokens que no están en Binance.
  const prices = { ...mockPrices }
  for (const [symbol, pair] of Object.entries(BINANCE_PAIRS)) {
    if (Number.isFinite(byPair[pair])) prices[symbol] = byPair[pair]
  }
  return prices
}
