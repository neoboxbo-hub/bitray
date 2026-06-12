// CoinGecko public API — sin API key, límite ~30 req/min
// alternative.me — Fear & Greed index, gratis y sin key

const CG_BASE = 'https://api.coingecko.com/api/v3'
const FNG_URL  = 'https://api.alternative.me/fng/?limit=1'

// Mapa symbol → CoinGecko coin ID
export const CG_IDS = {
  BTC:    'bitcoin',
  ETH:    'ethereum',
  SOL:    'solana',
  XRP:    'ripple',
  BNB:    'binancecoin',
  NEAR:   'near',
  LINK:   'chainlink',
  AAVE:   'aave',
  RENDER: 'render-token',
  FET:    'fetch-ai',
  AR:     'arweave',
  THETA:  'theta-token',
  TFUEL:  'theta-fuel',
  AKT:    'akash-network',
  TAO:    'bittensor',
  ATH:    'aethir',
  VET:    'vechain',
  RON:    'ronin',
  PIXEL:  'pixels',
  DOGE:   'dogecoin',
  KCS:    'kucoin-shares',
  HAI:    'hacken-token',
}

// Datos de un token específico: precio, cambio 24h, market cap, rank
export async function fetchCoinData(symbol) {
  const id = CG_IDS[symbol]
  if (!id) throw new Error(`Sin ID CoinGecko para ${symbol}`)

  const res = await fetch(
    `${CG_BASE}/coins/${id}?localization=false&tickers=false&community_data=false&developer_data=false&sparkline=false`,
    { signal: AbortSignal.timeout(8000) }
  )
  if (!res.ok) throw new Error(`CoinGecko ${res.status}`)
  const d = await res.json()

  return {
    symbol,
    nombre:      d.name,
    precio:      d.market_data.current_price.usd,
    cambio1h:    d.market_data.price_change_percentage_1h_in_currency?.usd ?? null,
    cambio24h:   d.market_data.price_change_percentage_24h,
    cambio7d:    d.market_data.price_change_percentage_7d,
    marketCap:   d.market_data.market_cap.usd,
    volumen24h:  d.market_data.total_volume.usd,
    rank:        d.market_cap_rank,
    ath:         d.market_data.ath.usd,
    athPct:      d.market_data.ath_change_percentage.usd,
    descripcion: d.description?.en?.split('. ')[0] ?? '',
  }
}

// Datos globales del mercado: dominancia BTC, market cap total
export async function fetchGlobalData() {
  const res = await fetch(`${CG_BASE}/global`, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`CoinGecko global ${res.status}`)
  const { data } = await res.json()
  return {
    marketCapTotal:  data.total_market_cap.usd,
    cambio24hTotal:  data.market_cap_change_percentage_24h_usd,
    dominanciaBTC:   data.market_cap_percentage.btc,
    dominanciaETH:   data.market_cap_percentage.eth,
    activeCryptos:   data.active_cryptocurrencies,
  }
}

// Fear & Greed index (0–100)
export async function fetchFearGreed() {
  const res = await fetch(FNG_URL, { signal: AbortSignal.timeout(6000) })
  if (!res.ok) throw new Error(`FNG ${res.status}`)
  const { data } = await res.json()
  const item = data[0]
  return {
    value:         parseInt(item.value),
    label:         item.value_classification,  // "Fear", "Greed", etc.
    timestamp:     item.timestamp,
  }
}

// Genera resumen textual inteligente a partir de los datos (sin IA de pago)
export function generarResumen({ coin, global, fg, precioEntrada = null }) {
  const lines = []

  // Movimiento del precio
  const c24 = coin.cambio24h
  const mov =
    c24 >= 8   ? `🚀 impulso alcista fuerte (+${c24.toFixed(1)}% en 24h)` :
    c24 >= 3   ? `📈 alza moderada (+${c24.toFixed(1)}% en 24h)` :
    c24 >= 0   ? `➡️ movimiento lateral al alza (+${c24.toFixed(1)}% en 24h)` :
    c24 >= -3  ? `➡️ movimiento lateral a la baja (${c24.toFixed(1)}% en 24h)` :
    c24 >= -8  ? `📉 corrección moderada (${c24.toFixed(1)}% en 24h)` :
                 `🔻 caída fuerte (${c24.toFixed(1)}% en 24h)`

  lines.push(`${coin.nombre} muestra ${mov}. Cotiza a $${coin.precio.toLocaleString('en-US', { maximumFractionDigits: 4 })}, rank #${coin.rank} por market cap.`)

  // Semana
  if (coin.cambio7d !== null) {
    const w = coin.cambio7d
    lines.push(`En los últimos 7 días ${w >= 0 ? 'acumula' : 'pierde'} un ${Math.abs(w).toFixed(1)}%.`)
  }

  // vs precio de entrada del usuario
  if (precioEntrada && precioEntrada > 0) {
    const diffPct = ((coin.precio - precioEntrada) / precioEntrada) * 100
    const signo = diffPct >= 0 ? '+' : ''
    lines.push(`Vs tu precio de entrada ($${precioEntrada.toFixed(4)}): ${signo}${diffPct.toFixed(2)}%.`)
  }

  // vs ATH
  if (coin.athPct) {
    const fromAth = Math.abs(coin.athPct).toFixed(0)
    lines.push(`Está un ${fromAth}% por debajo de su máximo histórico ($${coin.ath.toLocaleString('en-US', { maximumFractionDigits: 2 })}).`)
  }

  // Mercado global
  const domBtc = global.dominanciaBTC.toFixed(1)
  const mktMov = global.cambio24hTotal >= 0
    ? `subió +${global.cambio24hTotal.toFixed(1)}%`
    : `cayó ${global.cambio24hTotal.toFixed(1)}%`
  lines.push(`El mercado global ${mktMov} en 24h. Dominancia BTC: ${domBtc}%.`)

  // Fear & Greed
  const fgTexto =
    fg.value <= 20  ? `Miedo Extremo (${fg.value}) — zona histórica de compra.` :
    fg.value <= 40  ? `Miedo (${fg.value}) — el mercado siente presión vendedora.` :
    fg.value <= 60  ? `Neutral (${fg.value}) — sin sesgo claro.` :
    fg.value <= 80  ? `Codicia (${fg.value}) — cautela, el rally puede estar maduro.` :
                      `Codicia Extrema (${fg.value}) — riesgo elevado de corrección.`
  lines.push(`Índice Fear & Greed: ${fgTexto}`)

  return lines.join(' ')
}
