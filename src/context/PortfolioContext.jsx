import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  mockPrices,
  mockCofreCompras,
  mockCosechaTokens,
  mockTurboTokens,
} from '../data/mockData'
import { calcCofre, calcToken } from '../utils/calculations'
import { fetchPrices } from '../services/prices'

const PortfolioContext = createContext(null)
const REFRESH_MS = 15000

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

// Fábrica de acciones CRUD reutilizable para colecciones de tokens.
// Evita duplicar la misma lógica para Cosecha y Turbo.
function makeTokenActions(setter) {
  const addToken = (token) =>
    setter((prev) =>
      prev.find((t) => t.symbol === token.symbol)
        ? prev // no duplicar
        : [...prev, { ...token, compras: [] }],
    )

  const removeToken = (symbol) =>
    setter((prev) => prev.filter((t) => t.symbol !== symbol))

  const addCompra = (symbol, compra) =>
    setter((prev) =>
      prev.map((t) =>
        t.symbol === symbol
          ? { ...t, compras: [...t.compras, { ...compra, id: Date.now() }] }
          : t,
      ),
    )

  const updateCompra = (symbol, id, patch) =>
    setter((prev) =>
      prev.map((t) =>
        t.symbol === symbol
          ? { ...t, compras: t.compras.map((c) => (c.id === id ? { ...c, ...patch } : c)) }
          : t,
      ),
    )

  const deleteCompra = (symbol, id) =>
    setter((prev) =>
      prev.map((t) =>
        t.symbol === symbol
          ? { ...t, compras: t.compras.filter((c) => c.id !== id) }
          : t,
      ),
    )

  const clearCompras = (symbol) =>
    setter((prev) =>
      prev.map((t) => (t.symbol === symbol ? { ...t, compras: [] } : t)),
    )

  return { addToken, removeToken, addCompra, updateCompra, deleteCompra, clearCompras }
}

export function PortfolioProvider({ children }) {
  const [prices, setPrices] = useState(mockPrices)
  const [changes, setChanges] = useState({})
  const [pricesStatus, setPricesStatus] = useState('mock')
  const [pricesUpdated, setPricesUpdated] = useState(null)

  const [cofreCompras, setCofreCompras] = useState(() =>
    load('bitray.cofre', mockCofreCompras),
  )
  const [cosechaTokens, setCosechaTokens] = useState(() =>
    load('bitray.cosecha', mockCosechaTokens),
  )
  const [turboTokens, setTurboTokens] = useState(() =>
    load('bitray.turbo', mockTurboTokens),
  )

  // Precios en vivo de Binance (refresco cada 15s, fallback a mock).
  useEffect(() => {
    let active = true
    const tick = async () => {
      try {
        const { prices: p, changes: c } = await fetchPrices()
        if (!active) return
        setPrices(p)
        setChanges(c)
        setPricesStatus('live')
        setPricesUpdated(new Date())
      } catch (e) {
        if (active) setPricesStatus((s) => (s === 'live' ? 'live' : 'error'))
        console.warn('Binance no disponible:', e.message)
      }
    }
    tick()
    const id = setInterval(tick, REFRESH_MS)
    return () => { active = false; clearInterval(id) }
  }, [])

  // Persistencia automática.
  useEffect(() => { localStorage.setItem('bitray.cofre', JSON.stringify(cofreCompras)) }, [cofreCompras])
  useEffect(() => { localStorage.setItem('bitray.cosecha', JSON.stringify(cosechaTokens)) }, [cosechaTokens])
  useEffect(() => { localStorage.setItem('bitray.turbo', JSON.stringify(turboTokens)) }, [turboTokens])

  // --- Acciones Cofre ---
  const addCompraCofre = (compra) =>
    setCofreCompras((prev) => [...prev, { ...compra, id: Date.now() }])
  const updateCompraCofre = (id, patch) =>
    setCofreCompras((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const deleteCompraCofre = (id) =>
    setCofreCompras((prev) => prev.filter((c) => c.id !== id))
  const clearCofre = () => setCofreCompras([])

  // --- Acciones Cosecha ---
  const cosechaActions = useMemo(() => makeTokenActions(setCosechaTokens), [])

  // --- Acciones Turbo ---
  const turboActions = useMemo(() => makeTokenActions(setTurboTokens), [])

  // --- Derivados ---
  const cofre = useMemo(
    () => calcCofre(cofreCompras, prices.BTC),
    [cofreCompras, prices.BTC],
  )

  const cosecha = useMemo(
    () => cosechaTokens.map((t) => ({
      ...t,
      ...calcToken(t.compras, prices[t.symbol] ?? 0),
      precioActual: prices[t.symbol] ?? 0,
    })),
    [cosechaTokens, prices],
  )

  const turbo = useMemo(
    () => turboTokens.map((t) => ({
      ...t,
      ...calcToken(t.compras, prices[t.symbol] ?? 0),
      precioActual: prices[t.symbol] ?? 0,
    })),
    [turboTokens, prices],
  )

  const cosechaValor = cosecha.reduce((s, t) => s + t.valorActual, 0)
  const turboValor   = turbo.reduce((s, t) => s + t.valorActual, 0)
  const balanceTotal = cofre.valorActual + cosechaValor + turboValor

  // PnL 24h estimado del portafolio completo.
  const pnl24h = useMemo(() => {
    const calcTokenPnl24 = (tokens, computed) =>
      computed.reduce((sum, t) => {
        const ch = changes[t.symbol]?.h24
        if (!ch || !t.valorActual) return sum
        const val24agoEst = t.valorActual / (1 + ch / 100)
        return sum + (t.valorActual - val24agoEst)
      }, 0)

    const cofreCh = changes.BTC?.h24
    const cofrePnl = cofreCh
      ? cofre.valorActual - cofre.valorActual / (1 + cofreCh / 100)
      : 0

    return cofrePnl + calcTokenPnl24(cosechaTokens, cosecha) + calcTokenPnl24(turboTokens, turbo)
  }, [changes, cofre.valorActual, cosecha, turbo, cosechaTokens, turboTokens])

  const value = {
    prices, changes, pricesStatus, pricesUpdated,
    // Cofre
    cofre, cofreCompras, addCompraCofre, updateCompraCofre, deleteCompraCofre, clearCofre,
    // Cosecha
    cosecha, cosechaValor, ...Object.fromEntries(
      Object.entries(cosechaActions).map(([k, v]) => [`cosecha_${k}`, v])
    ),
    // Turbo
    turbo, turboValor, ...Object.fromEntries(
      Object.entries(turboActions).map(([k, v]) => [`turbo_${k}`, v])
    ),
    // Totales
    balanceTotal, pnl24h,
  }

  return (
    <PortfolioContext.Provider value={value}>
      {children}
    </PortfolioContext.Provider>
  )
}

export const usePortfolio = () => {
  const ctx = useContext(PortfolioContext)
  if (!ctx) throw new Error('usePortfolio debe usarse dentro de PortfolioProvider')
  return ctx
}
