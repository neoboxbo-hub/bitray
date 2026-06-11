import { Outlet } from 'react-router-dom'
import BottomNav from './BottomNav'

// Contenedor Mobile-First: ancho máximo tipo celular y nav inferior fija.
export default function MobileLayout() {
  return (
    <div className="min-h-screen bg-ink-900">
      <main className="max-w-md mx-auto px-4 pt-5 pb-24">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  )
}
