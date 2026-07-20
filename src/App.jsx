import { Routes, Route } from 'react-router-dom'
import MobileLayout from './components/layout/MobileLayout'
import Dashboard from './modules/dashboard/Dashboard'
import CofreInmortal from './modules/cofre/CofreInmortal'
import CosechaFeliz from './modules/cosecha/CosechaFeliz'
import TurboCiclo from './modules/turbo/TurboCiclo'
import AsistenteOperacion from './modules/asistente/AsistenteOperacion'
import { usePortfolio } from './context/PortfolioContext'
import { useAlertasPrecio } from './hooks/useAlertasPrecio'

function AlertasWatcher() {
  const { cosecha, turbo, cofre, prices } = usePortfolio()
  const alertasOn = localStorage.getItem('bitray.alertas') !== 'off'

  // Tokens de Cosecha y Turbo ya traen precioPromedio y precioActual calculados
  // Agregamos BTC del Cofre como token especial
  const tokens = alertasOn ? [
    ...cosecha,
    ...turbo,
    {
      symbol: 'BTC',
      nombre: 'Bitcoin',
      precioPromedio: cofre.precioPromedio,
      precioActual: prices.BTC ?? 0,
    },
  ] : []

  useAlertasPrecio({ tokens })
  return null
}

export default function App() {
  return (
    <>
      <AlertasWatcher />
      <Routes>
        <Route element={<MobileLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="cofre" element={<CofreInmortal />} />
          <Route path="cosecha" element={<CosechaFeliz />} />
          <Route path="turbo" element={<TurboCiclo />} />
          <Route path="asistente" element={<AsistenteOperacion />} />
        </Route>
      </Routes>
    </>
  )
}
