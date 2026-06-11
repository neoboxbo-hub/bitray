import { Routes, Route } from 'react-router-dom'
import MobileLayout from './components/layout/MobileLayout'
import Dashboard from './modules/dashboard/Dashboard'
import CofreInmortal from './modules/cofre/CofreInmortal'
import CosechaFeliz from './modules/cosecha/CosechaFeliz'
import TurboCiclo from './modules/turbo/TurboCiclo'

export default function App() {
  return (
    <Routes>
      <Route element={<MobileLayout />}>
        <Route index element={<Dashboard />} />
        <Route path="cofre" element={<CofreInmortal />} />
        <Route path="cosecha" element={<CosechaFeliz />} />
        <Route path="turbo" element={<TurboCiclo />} />
      </Route>
    </Routes>
  )
}
