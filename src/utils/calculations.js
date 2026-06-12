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
// ventas: [{ id, fecha, usd, precioBtc }] — registros de salida parcial.
export function calcCofre(compras, precioActual, ventas = []) {
  const usdInvertido  = compras.reduce((s, c) => s + c.usd, 0)
  const btcComprado   = compras.reduce((s, c) => s + c.usd / c.precioBtc, 0)
  const btcVendido    = ventas.reduce((s, v) => s + v.usd / v.precioBtc, 0)
  const btcAcumulado  = Math.max(0, btcComprado - btcVendido)
  const valorActual   = btcAcumulado * precioActual
  const precioPromedio = btcComprado > 0 ? usdInvertido / btcComprado : 0
  const usdRecuperado = ventas.reduce((s, v) => s + v.usd, 0)
  // PnL = (valor abierto − costo abierto) + ganancia ya realizada en ventas
  const costoAbierto  = btcAcumulado * precioPromedio
  const pnlRealizado  = ventas.reduce((s, v) => s + (v.precioBtc - precioPromedio) * (v.usd / v.precioBtc), 0)
  const pnl    = (valorActual - costoAbierto) + pnlRealizado
  const pnlPct = usdInvertido > 0 ? (pnl / usdInvertido) * 100 : 0
  return { usdInvertido, btcComprado, btcAcumulado, btcVendido, valorActual, precioPromedio, usdRecuperado, pnlRealizado, pnl, pnlPct }
}

// ---------- MÓDULO 2 y 3: Cosecha / Turbo (compras + ventas) ----------
// Cada transacción tiene tipo: 'compra' (default) | 'venta'.
export function calcToken(transacciones, precioActual) {
  const compras = transacciones.filter((t) => (t.tipo ?? 'compra') === 'compra')
  const ventas  = transacciones.filter((t) => t.tipo === 'venta')

  const cantidadComprada = compras.reduce((s, c) => s + c.cantidad, 0)
  const cantidadVendida  = ventas.reduce((s, v) => s + v.cantidad, 0)
  const cantidad = Math.max(0, cantidadComprada - cantidadVendida)

  const costo = compras.reduce((s, c) => s + c.cantidad * c.precio, 0)
  // Precio promedio ponderado solo de compras (punto de equilibrio).
  const precioPromedio = cantidadComprada > 0 ? costo / cantidadComprada : 0

  // PnL realizado: (precio de venta − precio promedio) × cantidad vendida.
  const pnlRealizado = ventas.reduce(
    (s, v) => s + (v.precio - precioPromedio) * v.cantidad,
    0,
  )

  // PnL no realizado: valor actual de la posición abierta vs su costo.
  const costoAbierto = cantidad * precioPromedio
  const valorActual  = cantidad * precioActual
  const pnlNoRealizado = valorActual - costoAbierto

  const pnlTotal = pnlNoRealizado + pnlRealizado
  const pnlPct   = costo > 0 ? (pnlTotal / costo) * 100 : 0

  return {
    cantidad,
    cantidadComprada,
    cantidadVendida,
    costo,
    precioPromedio,
    valorActual,
    pnl: pnlTotal,
    pnlPct,
    pnlRealizado,
    pnlNoRealizado,
  }
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
