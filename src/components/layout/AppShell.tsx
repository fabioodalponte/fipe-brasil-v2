import { BarChart3, Car, GitCompareArrows, Home, LineChart, Menu } from 'lucide-react'
import { NavLink, Outlet } from 'react-router-dom'
import { SearchAutocomplete } from '../search/SearchAutocomplete'

const navItems = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/vehicle/toyota-corolla-xei-2020', label: 'Veiculo', icon: Car },
  { to: '/compare', label: 'Comparar', icon: GitCompareArrows },
  { to: '/index', label: 'IFB Index', icon: LineChart },
]

export function AppShell() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 lg:px-5">
          <NavLink to="/" className="flex items-center gap-2 text-slate-950">
            <span className="flex h-9 w-9 items-center justify-center rounded bg-slate-900 text-white">
              <BarChart3 size={18} />
            </span>
            <span>
              <span className="block text-sm font-bold leading-none">FIPE Brasil</span>
              <span className="block text-[11px] font-semibold uppercase leading-none text-slate-500">Market intelligence</span>
            </span>
          </NavLink>

          <SearchAutocomplete className="hidden flex-1 md:block" />

          <nav className="ml-auto hidden items-center gap-1 lg:flex">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    `inline-flex items-center gap-2 rounded px-3 py-2 text-sm font-semibold transition ${
                      isActive ? 'bg-slate-900 text-white' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-950'
                    }`
                  }
                >
                  <Icon size={16} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <button className="inline-flex h-9 w-9 items-center justify-center rounded border border-slate-200 bg-white text-slate-700 lg:hidden" aria-label="Abrir navegacao">
            <Menu size={18} />
          </button>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-slate-100 px-4 py-2 lg:hidden">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `inline-flex shrink-0 items-center gap-2 rounded px-3 py-2 text-sm font-semibold ${
                    isActive ? 'bg-slate-900 text-white' : 'text-slate-600'
                  }`
                }
              >
                <Icon size={15} />
                {item.label}
              </NavLink>
            )
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1440px] min-w-0 overflow-hidden px-4 py-5 lg:px-5">
        <Outlet />
      </main>
    </div>
  )
}
