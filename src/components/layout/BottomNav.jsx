import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Inicio', icon: '🏠', end: true },
  { to: '/cofre', label: 'Cofre', icon: '🔒' },
  { to: '/cosecha', label: 'Cosecha', icon: '🌱' },
  { to: '/turbo', label: 'Turbo', icon: '⚡' },
]

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 bg-ink-800/95 backdrop-blur border-t border-ink-600">
      <ul className="grid grid-cols-4 max-w-md mx-auto">
        {items.map((it) => (
          <li key={it.to}>
            <NavLink
              to={it.to}
              end={it.end}
              className={({ isActive }) =>
                `flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors ${
                  isActive ? 'text-brand' : 'text-gray-500'
                }`
              }
            >
              <span className="text-lg leading-none">{it.icon}</span>
              {it.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )
}
