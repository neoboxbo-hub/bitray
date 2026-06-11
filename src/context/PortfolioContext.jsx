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
} from '../data/mockData'
import { calcCofre, calcToken } from '../utils/calculations'

const PortfolioContext = createContext(null)

// Carga inicial: localStorage si existe, si no el mock. (Fase 2 → Supabase)
const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch {
    return fallback
  }
}

// Estado central simulado. En la Fase 2 esto se reemplaza por Supabase/API.
export function PortfolioProvider({ children }) {
  const [prices] = useState(mockPrices)
  const [cofreCompras, setCofreCompras] = useState(() =>
    load('bitray.cofre', mockCofreCompras),
  )
  const [cosechaTokens, setCosechaTokens] = useState(() =>
    load('bitray.cosecha', mockCosechaTokens),
  )

  // Persistencia automática al cambiar.
  useEffect(() => {
    localStorage.setItem('bitray.cofre', JSON.stringify(cofreCompras))
  }, [cofreCompras])
  useEffect(() => {
    localStorage.setItem('bitray.cosecha', JSON.stringify(cosechaTokens))
  }, [cosechaTokens])

  // --- Acciones ---
  const addCompraCofre = (compra) =>
    setCofreCompras((prev) => [
      ...prev,
      { ...compra, id: Date.now() },
    ])

  const addCompraToken = (symbol, compra) =>
    setCosechaTokens((prev) =>
      prev.map((t) =>
        t.symbol === symbol
          ? { ...t, compras: [...t.compras, { ...compra, id: Date.now() }] }
          : t,
      ),
    )

  // --- Editar / eliminar compra individual ---
  const updateCompraCofre = (id, patch) =>
    setCofreCompras((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    )

  const deleteCompraCofre = (id) =>
    setCofreCompras((prev) => prev.filter((c) => c.id !== id))

  const updateCompraToken = (symbol, id, patch) =>
    setCosechaTokens((prev) =>
      prev.map((t) =>
        t.symbol === symbol
          ? {
              ...t,
              compras: t.compras.map((c) =>
                c.id === id ? { ...c, ...patch } : c,
              ),
            }
          : t,
      ),
    )

  const deleteCompraToken = (symbol, id) =>
    setCosechaTokens((prev) =>
      prev.map((t) =>
        t.symbol === symbol
          ? { ...t, compras: t.compras.filter((c) => c.id !== id) }
          : t,
      ),
    )

  // --- Limpieza de registros (con confirmación en la UI) ---
  const clearCofre = () => setCofreCompras([])

  const clearTokenCompras = (symbol) =>
    setCosechaTokens((prev) =>
      prev.map((t) => (t.symbol === symbol ? { ...t, compras: [] } : t)),
    )

  // --- Derivados (balance total del portafolio) ---
  const cofre = useMemo(
    () => calcCofre(cofreCompras, prices.BTC),
    [cofreCompras, prices.BTC],
  )

  const cosecha = useMemo(
    () =>
      cosechaTokens.map((t) => ({
        ...t,
        ...calcToken(t.compras, prices[t.symbol] ?? 0),
        precioActual: prices[t.symbol] ?? 0,
      })),
    [cosechaTokens, prices],
  )

  const cosechaValor = cosecha.reduce((s, t) => s + t.valorActual, 0)
  const balanceTotal = cofre.valorActual + cosechaValor

  const value = {
    prices,
    cofre,
    cofreCompras,
    addCompraCofre,
    updateCompraCofre,
    deleteCompraCofre,
    clearCofre,
    cosecha,
    cosechaValor,
    addCompraToken,
    updateCompraToken,
    deleteCompraToken,
    clearTokenCompras,
    balanceTotal,
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
