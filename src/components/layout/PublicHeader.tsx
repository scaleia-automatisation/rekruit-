import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X } from 'lucide-react'

const navLinks = [
  { to: '/features', label: 'Fonctionnalités' },
  { to: '/how-it-works', label: 'Comment ça marche' },
  { to: '/pricing', label: 'Tarifs' },
  { to: '/faq', label: 'FAQ' },
]

export function PublicHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 16)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-200' : 'bg-transparent'}`}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">rekruit</span>
          </Link>

          {/* Nav desktop */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label }) => (
              <Link key={to} to={to}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                {label}
              </Link>
            ))}
          </nav>

          {/* Actions desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/connexion" className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors">
              Se connecter
            </Link>
            <Link to="/inscription"
              className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
              Commencer gratuitement
            </Link>
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setMobileOpen(v => !v)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-100 text-slate-700">
            {mobileOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 flex flex-col gap-1 shadow-lg">
          {navLinks.map(({ to, label }) => (
            <Link key={to} to={to}
              className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl transition-colors">
              {label}
            </Link>
          ))}
          <div className="mt-2 pt-2 border-t border-slate-100 flex flex-col gap-2">
            <Link to="/connexion"
              className="px-4 py-3 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-xl text-center transition-colors">
              Se connecter
            </Link>
            <Link to="/inscription"
              className="px-4 py-3 bg-blue-600 text-white text-sm font-semibold rounded-xl text-center hover:bg-blue-700 transition-colors">
              Commencer gratuitement
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
