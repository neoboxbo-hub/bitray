// Catálogo de tokens de tu lista de seguimiento.
// Al seleccionar uno, el formulario se autocompleta.
// categoria: 'nucleo' = calidad, hold de ciclo | 'spec' = especulativo, posición pequeña.
// narrativa: sector del proyecto (para detectar sobreconcentración).

export const TOKEN_CATALOG = [
  // ── Largo plazo (Cofre) ──────────────────────────────
  { symbol: 'BTC',    nombre: 'Bitcoin',        categoria: 'nucleo', narrativa: 'Reserva de valor' },

  // ── L1 / Infraestructura ─────────────────────────────
  { symbol: 'ETH',    nombre: 'Ethereum',        categoria: 'nucleo', narrativa: 'L1' },
  { symbol: 'SOL',    nombre: 'Solana',          categoria: 'nucleo', narrativa: 'L1' },
  { symbol: 'NEAR',   nombre: 'NEAR Protocol',   categoria: 'nucleo', narrativa: 'L1 / AI' },
  { symbol: 'XRP',    nombre: 'XRP',             categoria: 'nucleo', narrativa: 'Pagos' },
  { symbol: 'LINK',   nombre: 'Chainlink',       categoria: 'nucleo', narrativa: 'Infraestructura' },

  // ── Exchange tokens ──────────────────────────────────
  { symbol: 'BNB',    nombre: 'BNB',             categoria: 'nucleo', narrativa: 'Exchange' },
  { symbol: 'KCS',    nombre: 'KuCoin Token',    categoria: 'spec',   narrativa: 'Exchange' },

  // ── DeFi ─────────────────────────────────────────────
  { symbol: 'AAVE',   nombre: 'Aave',            categoria: 'nucleo', narrativa: 'DeFi' },

  // ── AI / DePIN ───────────────────────────────────────
  { symbol: 'RENDER', nombre: 'Render',          categoria: 'nucleo', narrativa: 'AI / DePIN' },
  { symbol: 'FET',    nombre: 'Fetch.ai',        categoria: 'nucleo', narrativa: 'AI / DePIN' },
  { symbol: 'AR',     nombre: 'Arweave',         categoria: 'nucleo', narrativa: 'AI / DePIN' },
  { symbol: 'THETA',  nombre: 'Theta Network',   categoria: 'nucleo', narrativa: 'AI / DePIN' },
  { symbol: 'AKT',    nombre: 'Akash Network',   categoria: 'spec',   narrativa: 'AI / DePIN' },
  { symbol: 'TAO',    nombre: 'Bittensor',       categoria: 'spec',   narrativa: 'AI / DePIN' },
  { symbol: 'ATH',    nombre: 'Aethir',          categoria: 'spec',   narrativa: 'AI / DePIN' },
  { symbol: 'TFUEL',  nombre: 'Theta Fuel',      categoria: 'spec',   narrativa: 'AI / DePIN' },

  // ── Supply-chain / Empresa ───────────────────────────
  { symbol: 'VET',    nombre: 'VeChain',         categoria: 'spec',   narrativa: 'Supply-chain' },

  // ── Gaming / NFT ─────────────────────────────────────
  { symbol: 'RON',    nombre: 'Ronin',           categoria: 'spec',   narrativa: 'Gaming' },
  { symbol: 'PIXEL',  nombre: 'Pixels',          categoria: 'spec',   narrativa: 'Gaming' },

  // ── Trading liquido (Turbo) ──────────────────────────
  { symbol: 'DOGE',   nombre: 'Dogecoin',        categoria: 'spec',   narrativa: 'Memecoin' },

  // ── Sin clasificar ───────────────────────────────────
  { symbol: 'HAI',    nombre: 'HAI',             categoria: 'spec',   narrativa: 'Sin clasificar' },
]

export const EXCHANGES = ['Binance', 'Bybit', 'KuCoin', 'OKX', 'Otro']
