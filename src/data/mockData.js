// ============================================================
//  MOCK DATA · Fase 1 (sin APIs reales)
//  Simula mercado, Binance, Bybit y Coinglass.
//  Cambiar estos valores recalcula toda la interfaz.
// ============================================================

// Precios "en vivo" simulados. Más adelante saldrán de Binance/Bybit.
export const mockPrices = {
  BTC: 67250.0,
  ETH: 3520.0,
  BNB: 612.0,
  SOL: 172.4,
  NEAR: 6.8,
  AAVE: 142.0,
  RENDER: 9.4,
  FET: 1.34,
  AR: 28.5,
  THETA: 2.1,
  AKT: 4.2,
  VET: 0.045,
  RON: 2.18,
  // Líquidos extra para Turbo
  XRP: 0.62,
  DOGE: 0.165,
  LINK: 18.2,
  // Especulativos / microcaps (referencia)
  KCS: 11.5,
  ATH: 0.08,
  TFUEL: 0.12,
  PIXEL: 0.18,
  HAI: 0.07,
}

// ---------- MÓDULO 1: El Cofre Inmortal (solo BTC) ----------
export const mockCofreCompras = [
  { id: 1, fecha: '2024-01-15', usd: 500, precioBtc: 42800 },
  { id: 2, fecha: '2024-03-10', usd: 300, precioBtc: 68500 },
  { id: 3, fecha: '2024-08-05', usd: 450, precioBtc: 58000 },
  { id: 4, fecha: '2025-02-20', usd: 600, precioBtc: 95000 },
]

// ---------- MÓDULO 2: La Cosecha Feliz ----------
// Arranca VACÍO. El usuario agrega tokens manualmente con botón "+".
export const mockCosechaTokens = []

// ---------- MÓDULO 3: El Turbo-Ciclo — tokens de trading ----------
// Misma estructura que Cosecha. SOL trasladado aquí como ejemplo inicial.
export const mockTurboTokens = [
  {
    symbol: 'SOL',
    nombre: 'Solana',
    exchange: 'Binance',
    categoria: 'nucleo',
    narrativa: 'L1',
    compras: [
      { id: 1, fecha: '2024-06-01', cantidad: 5, precio: 140 },
      { id: 2, fecha: '2024-09-12', cantidad: 3, precio: 128 },
    ],
  },
]

// ---------- MÓDULO 3: El Turbo-Ciclo ----------
// Comisión simulada por lado (maker/taker). 0.1% = estándar Binance spot.
export const TRADING_FEE_PCT = 0.1

// Watchlist de Turbo: SOLO tokens de alta liquidez (para llenar órdenes de
// scalp 2-4% sin slippage). Los microcaps NO entran aquí a propósito.
export const mockTurboWatchlist = [
  { symbol: 'BTC', nombre: 'Bitcoin' },
  { symbol: 'ETH', nombre: 'Ethereum' },
  { symbol: 'SOL', nombre: 'Solana' },
  { symbol: 'BNB', nombre: 'BNB' },
  { symbol: 'XRP', nombre: 'XRP' },
  { symbol: 'DOGE', nombre: 'Dogecoin' },
  // Añadidos por el usuario — baja liquidez (cuidado con el slippage en el scalp).
  { symbol: 'ATH', nombre: 'Aethir', lowLiq: true },
  { symbol: 'TFUEL', nombre: 'Theta Fuel', lowLiq: true },
  { symbol: 'PIXEL', nombre: 'Pixels', lowLiq: true },
]

// Fear & Greed Index simulado (estilo alternative.me / Coinglass)
export const mockFearGreed = {
  value: 22,
  label: 'Miedo Extremo',
  updated: 'Hoy 09:00',
  history: [
    { day: 'Lun', value: 41 },
    { day: 'Mar', value: 38 },
    { day: 'Mié', value: 30 },
    { day: 'Jue', value: 27 },
    { day: 'Vie', value: 22 },
  ],
}

// Mapa de liquidaciones simulado (estilo Coinglass).
// Cada nivel: precio, magnitud (millones USD) y lado dominante.
export const mockLiquidationMap = {
  symbol: 'BTC',
  current: 67250,
  levels: [
    { price: 71000, usdM: 180, side: 'short' },
    { price: 69500, usdM: 95, side: 'short' },
    { price: 68200, usdM: 42, side: 'short' },
    { price: 66800, usdM: 60, side: 'long' },
    { price: 65000, usdM: 140, side: 'long' },
    { price: 62500, usdM: 210, side: 'long' },
  ],
}

// Noticias AI simuladas (placeholder de la futura API de Perplexity)
export const mockAINews = {
  generatedAt: 'Resumen de las últimas 3 horas',
  sentiment: 'Cautelosamente alcista',
  items: [
    {
      id: 1,
      title: 'BTC defiende los $67K pese a salidas en ETFs',
      summary:
        'El precio se mantiene lateral tras un día de baja liquidez. Los traders esperan datos macro de EE.UU. esta semana.',
      tag: 'Macro',
    },
    {
      id: 2,
      title: 'Solana lidera el rebote de las altcoins',
      summary:
        'El ecosistema SOL registra aumento de actividad on-chain; el sentimiento minorista mejora ligeramente.',
      tag: 'Altcoins',
    },
    {
      id: 3,
      title: 'Liquidaciones de cortos acumuladas cerca de $71K',
      summary:
        'Un movimiento alcista podría acelerarse si el precio rompe la zona de liquidez de posiciones cortas.',
      tag: 'Derivados',
    },
  ],
}
