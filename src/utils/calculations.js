// ============================================================
//  Lógica financiera pura (sin React) — fácil de testear.
// ============================================================

export const fmtUsd = (n, max = 2) =>
  new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: max,
  }).format(Number.isFinite(n) ? n : 0)

export const fmtNum = (n, dec = 4) =>
  new Intl.NumberFormat('es-MX', {
    minimumFractionDigits: 0,
    maximumFractionDigits: dec,
  }).format(Number.isFinite(n) ? n : 0)

export const fmtPct = (n) =>
  `${n >= 0 ? '+' : ''}${(Number.isFinite(n) ? n : 0).toFixed(2)}%`

// ---------- MÓDULO 1: Cofre (DCA en BTC) ----------
export function calcCofre(compras, precioActual) {
  const usdInvertido = compras.reduce((s, c) => s + c.usd, 0)
  const btcAcumulado = compras.reduce((s, c) => s + c.usd / c.precioBtc, 0)
  const valorActual = btcAcumulado * precioActual
  const precioPromedio = btcAcumulado > 0 ? usdInvertido / btcAcumulado : 0
  const pnl = valorActual - usdInvertido
  const pnlPct = usdInvertido > 0 ? (pnl / usdInvertido) * 100 : 0
  return { usdInvertido, btcAcumulado, valorActual, precioPromedio, pnl, pnlPct }
}

// ---------- MÓDULO 2: Cosecha (precio promedio ponderado) ----------
export function calcToken(compras, precioActual) {
  const cantidad = compras.reduce((s, c) => s + c.cantidad, 0)
  const costo = compras.reduce((s, c) => s + c.cantidad * c.precio, 0)
  const precioPromedio = cantidad > 0 ? costo / cantidad : 0 // = punto de equilibrio
  const valorActual = cantidad * precioActual
  const pnl = valorActual - costo
  const pnlPct = costo > 0 ? (pnl / costo) * 100 : 0
  return { cantidad, costo, precioPromedio, valorActual, pnl, pnlPct }
}

// ---------- MÓDULO 3: Turbo-Ciclo ----------
// Calcula precios de Take Profit netos (descontando comisiones de compra y venta)
// y el Stop Loss según el riesgo máximo parametrizable.
export function calcTurbo({ precioCompra, capital, feePct, riesgoPct, targets }) {
  const fee = feePct / 100
  const tokens = capital > 0 && precioCompra > 0 ? capital / precioCompra : 0

  // Comisión pagada al comprar (reduce el capital efectivo invertido en cripto)
  const feeCompraUsd = capital * fee
  const costoBase = capital + feeCompraUsd // lo que realmente "pusiste"

  const tps = targets.map((pct) => {
    // Queremos que tras vender y pagar comisión de venta, la ganancia NETA = pct.
    // gananciaNeta = precioVenta*tokens*(1-fee) - costoBase
    // => precioVenta = (costoBase*(1+pct/100)) / (tokens*(1-fee))
    const objetivoNeto = costoBase * (1 + pct / 100)
    const precioVenta = tokens > 0 ? objetivoNeto / (tokens * (1 - fee)) : 0
    const gananciaUsd = objetivoNeto - costoBase
    return { pct, precioVenta, gananciaUsd }
  })

  // Stop Loss: pérdida máxima = riesgoPct del capital.
  // Aproximación neta incluyendo comisión de venta.
  const perdidaMax = capital * (riesgoPct / 100)
  const objetivoSL = costoBase - perdidaMax
  const stopPrice = tokens > 0 ? objetivoSL / (tokens * (1 - fee)) : 0
  // Stop "limit" un pelín por debajo del trigger para asegurar ejecución.
  const stopLimit = stopPrice * 0.999

  return { tokens, costoBase, feeCompraUsd, tps, stopPrice, stopLimit, perdidaMax }
}
