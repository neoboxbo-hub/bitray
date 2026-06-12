import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
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
import { loadAllFromSupabase, saveToSupabase } from '../services/supabase'

const PortfolioContext = createContext(null)
const REFRESH_MS  = 15000
const DEBOUNCE_MS = 1500   // espera antes de guardar en Supabase

const load = (key, fallback) => {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function makeTokenActions(setter) {
  const addToken = (token) =>
    setter((prev) =>
      prev.find((t) => t.symbol === token.symbol) ? prev
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
  const setPrecioManual = (symbol, precio) =>
    setter((prev) =>
      prev.map((t) =>
        t.symbol === symbol
          ? { ...t, precioManual: precio === null ? undefined : Number(precio) }
          : t,
      ),
    )
  return { addToken, removeToken, addCompra, updateCompra, deleteCompra, clearCompras, setPrecioManual }
}

export function PortfolioProvider({ children }) {
  const [prices, setPrices]             = useState(mockPrices)
  const [changes, setChanges]           = useState({})
  const [pricesStatus, setPricesStatus] = useState('mock')
  const [pricesUpdated, setPricesUpdated] = useState(null)

  // syncStatus: 'loading' | 'synced' | 'local' | 'error'
  const [syncStatus, setSyncStatus] = useState('loading')
  const [syncedAt, setSyncedAt]     = useState(null)

  const [cofreCompras, setCofreCompras]   = useState(() => load('bitray.cofre', mockCofreCompras))
  const [cofreVentas, setCofreVentas]     = useState(() => load('bitray.cofre.ventas', []))
  const [cosechaTokens, setCosechaTokens] = useState(() => load('bitray.cosecha', mockCosechaTokens))
  const [turboTokens, setTurboTokens]     = useState(() => load('bitray.turbo', mockTurboTokens))

  // ── Carga inicial desde Supabase ──────────────────────────────────────────
  const initialLoadDone = useRef(false)

  useEffect(() => {
    if (initialLoadDone.current) return
    initialLoadDone.current = true

    loadAllFromSupabase()
      .then((remote) => {
        // Para cada clave, Supabase gana si tiene datos
        if (remote.cofre_compras?.value)   { setCofreCompras(remote.cofre_compras.value);   localStorage.setItem('bitray.cofre',        JSON.stringify(remote.cofre_compras.value)) }
        if (remote.cofre_ventas?.value)    { setCofreVentas(remote.cofre_ventas.value);     localStorage.setItem('bitray.cofre.ventas', JSON.stringify(remote.cofre_ventas.value)) }
        if (remote.cosecha_tokens?.value)  { setCosechaTokens(remote.cosecha_tokens.value); localStorage.setItem('bitray.cosecha',      JSON.stringify(remote.cosecha_tokens.value)) }
        if (remote.turbo_tokens?.value)    { setTurboTokens(remote.turbo_tokens.value);     localStorage.setItem('bitray.turbo',        JSON.stringify(remote.turbo_tokens.value)) }
        setSyncStatus('synced')
        setSyncedAt(new Date())
      })
      .catch((e) => {
        console.warn('Supabase carga inicial falló, usando localStorage:', e.message)
        setSyncStatus('local')
      })
  }, [])

  // ── Guardado en Supabase con debounce ─────────────────────────────────────
  const timers = useRef({})

  const debouncedSave = useCallback((key, value) => {
    clearTimeout(timers.current[key])
    timers.current[key] = setTimeout(async () => {
      try {
        await saveToSupabase(key, value)
        setSyncStatus('synced')
        setSyncedAt(new Date())
      } catch (e) {
        console.warn('Supabase save falló:', e.message)
        setSyncStatus('local')
      }
    }, DEBOUNCE_MS)
  }, [])

  // ── Persistencia local + sync remoto ──────────────────────────────────────
  useEffect(() => {
    localStorage.setItem('bitray.cofre', JSON.stringify(cofreCompras))
    if (!initialLoadDone.current) return
    debouncedSave('cofre_compras', cofreCompras)
  }, [cofreCompras, debouncedSave])

  useEffect(() => {
    localStorage.setItem('bitray.cofre.ventas', JSON.stringify(cofreVentas))
    if (!initialLoadDone.current) return
    debouncedSave('cofre_ventas', cofreVentas)
  }, [cofreVentas, debouncedSave])

  useEffect(() => {
    localStorage.setItem('bitray.cosecha', JSON.stringify(cosechaTokens))
    if (!initialLoadDone.current) return
    debouncedSave('cosecha_tokens', cosechaTokens)
  }, [cosechaTokens, debouncedSave])

  useEffect(() => {
    localStorage.setItem('bitray.turbo', JSON.stringify(turboTokens))
    if (!initialLoadDone.current) return
    debouncedSave('turbo_tokens', turboTokens)
  }, [turboTokens, debouncedSave])

  // ── Precios en vivo Binance ───────────────────────────────────────────────
  useEffect(() => {
    let active = true
    const tick = async () => {
      try {
        const { prices: p, changes: c } = await fetchPrices()
        if (!active) return
        setPrices(p); setChanges(c)
        setPricesStatus('live'); setPricesUpdated(new Date())
      } catch (e) {
        if (active) setPricesStatus((s) => (s === 'live' ? 'live' : 'error'))
        console.warn('Binance no disponible:', e.message)
      }
    }
    tick()
    const id = setInterval(tick, REFRESH_MS)
    return () => { active = false; clearInterval(id) }
  }, [])

  // ── Acciones Cofre ────────────────────────────────────────────────────────
  const addCompraCofre    = (compra)   => setCofreCompras((prev) => [...prev, { ...compra, id: Date.now() }])
  const updateCompraCofre = (id, patch) => setCofreCompras((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)))
  const deleteCompraCofre = (id)       => setCofreCompras((prev) => prev.filter((c) => c.id !== id))
  const clearCofre        = ()         => setCofreCompras([])
  const addVentaCofre     = (venta)    => setCofreVentas((prev) => [...prev, { ...venta, id: Date.now() }])
  const deleteVentaCofre  = (id)       => setCofreVentas((prev) => prev.filter((v) => v.id !== id))

  // ── Acciones Cosecha / Turbo ──────────────────────────────────────────────
  const cosechaActions = useMemo(() => makeTokenActions(setCosechaTokens), [])
  const turboActions   = useMemo(() => makeTokenActions(setTurboTokens), [])

  const moverAturbo = (symbol) => {
    setCosechaTokens((prev) => {
      const token = prev.find((t) => t.symbol === symbol)
      if (!token) return prev
      setTurboTokens((tp) => tp.find((t) => t.symbol === symbol) ? tp : [...tp, token])
      return prev.filter((t) => t.symbol !== symbol)
    })
  }

  const moverACosecha = (symbol) => {
    setTurboTokens((prev) => {
      const token = prev.find((t) => t.symbol === symbol)
      if (!token) return prev
      setCosechaTokens((cp) => cp.find((t) => t.symbol === symbol) ? cp : [...cp, token])
      return prev.filter((t) => t.symbol !== symbol)
    })
  }

  // ── Derivados ─────────────────────────────────────────────────────────────
  const cofre = useMemo(
    () => calcCofre(cofreCompras, prices.BTC, cofreVentas),
    [cofreCompras, prices.BTC, cofreVentas],
  )

  const cosecha = useMemo(
    () => cosechaTokens.map((t) => {
      const p = t.precioManual ?? prices[t.symbol] ?? 0
      return { ...t, ...calcToken(t.compras, p), precioActual: p }
    }),
    [cosechaTokens, prices],
  )

  const turbo = useMemo(
    () => turboTokens.map((t) => {
      const p = t.precioManual ?? prices[t.symbol] ?? 0
      return { ...t, ...calcToken(t.compras, p), precioActual: p }
    }),
    [turboTokens, prices],
  )

  const cosechaValor = cosecha.reduce((s, t) => s + t.valorActual, 0)
  const turboValor   = turbo.reduce((s, t) => s + t.valorActual, 0)
  const balanceTotal = cofre.valorActual + cosechaValor + turboValor

  const pnl24h = useMemo(() => {
    const calcTokenPnl24 = (computed) =>
      computed.reduce((sum, t) => {
        const ch = changes[t.symbol]?.h24
        if (!ch || !t.valorActual) return sum
        return sum + (t.valorActual - t.valorActual / (1 + ch / 100))
      }, 0)
    const cofreCh = changes.BTC?.h24
    const cofrePnl = cofreCh ? cofre.valorActual - cofre.valorActual / (1 + cofreCh / 100) : 0
    return cofrePnl + calcTokenPnl24(cosecha) + calcTokenPnl24(turbo)
  }, [changes, cofre.valorActual, cosecha, turbo])

  const value = {
    prices, changes, pricesStatus, pricesUpdated,
    syncStatus, syncedAt,
    cofre, cofreCompras, addCompraCofre, updateCompraCofre, deleteCompraCofre, clearCofre,
    cofreVentas, addVentaCofre, deleteVentaCofre,
    cosecha, cosechaValor, ...Object.fromEntries(
      Object.entries(cosechaActions).map(([k, v]) => [`cosecha_${k}`, v])
    ),
    turbo, turboValor, ...Object.fromEntries(
      Object.entries(turboActions).map(([k, v]) => [`turbo_${k}`, v])
    ),
    balanceTotal, pnl24h,
    moverAturbo, moverACosecha,
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
