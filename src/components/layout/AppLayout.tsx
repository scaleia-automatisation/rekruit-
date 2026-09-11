import { type ReactNode, useState, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, Briefcase, Users, CalendarDays, Settings,
  LogOut, Menu, X, BarChart3, Shield, UserCog,
  Search, Bell, ChevronDown, Zap,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { CommandPalette } from '../CommandPalette'

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/offres',     icon: Briefcase,        label: 'Offres' },
  { to: '/candidats',  icon: Users,            label: 'Candidats' },
  { to: '/calendrier', icon: CalendarDays,     label: 'Calendrier' },
  { to: '/analytics',  icon: BarChart3,        label: 'Analytics' },
]

const planLabels: Record<string, { label: string; color: string }> = {
  free:    { label: 'Gratuit', color: 'text-[var(--text-muted)]' },
  tpe_pme: { label: 'Pro',     color: 'text-[var(--cyan-700)]' },
  agence:  { label: 'Business',color: 'text-violet-600' },
}

interface AppLayoutProps {
  children: ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const { profile, organization, signOut, isSuperAdmin, planId } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [cmdOpen, setCmdOpen] = useState(false)

  const plan = planLabels[planId ?? 'free'] ?? planLabels.free

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  const initials = profile
    ? `${profile.first_name?.[0] ?? ''}${profile.last_name?.[0] ?? ''}`.toUpperCase() || '?'
    : '?'

  /* ⌘K / Ctrl+K */
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setCmdOpen(v => !v)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  /* Close mobile on route change */
  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const SidebarNav = () => (
    <nav className="flex-1 px-2 py-2">
      <p className="px-3 pt-1 pb-2 text-[10px] font-semibold text-[var(--text-muted)] uppercase tracking-widest">
        Menu
      </p>
      <ul className="space-y-0.5">
        {navItems.map(({ to, icon: Icon, label }) => (
          <li key={to}>
            <NavLink
              to={to}
              className={({ isActive }) =>
                `group flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13.5px] font-medium transition-all duration-150 relative ${
                  isActive
                    ? 'bg-[var(--cyan-05)] text-[var(--text-primary)]'
                    : 'text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 bg-[var(--cyan)] rounded-r-full" />
                  )}
                  <Icon
                    size={16}
                    className={`shrink-0 transition-colors ${
                      isActive ? 'text-[var(--cyan-700)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                    }`}
                  />
                  {label}
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  )

  return (
    <div className="flex h-screen bg-[var(--bg)] overflow-hidden">
      {/* ── Desktop Sidebar ──────────────────────────────── */}
      <aside className="hidden md:flex w-[220px] flex-col bg-[var(--surface)] border-r border-[var(--border)] shrink-0">

        {/* Logo + workspace */}
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 bg-[var(--text-primary)] rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
              <span className="text-[var(--cyan)] font-bold text-xs tracking-tight">R</span>
            </div>
            <span className="font-bold text-[var(--text-primary)] text-[15px] tracking-tight">rekruit</span>
          </div>
          {organization && (
            <button className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-[var(--radius-sm)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-strong)] transition-colors group">
              <div className="w-5 h-5 bg-[var(--cyan-10)] rounded-sm flex items-center justify-center shrink-0">
                <span className="text-[var(--cyan-700)] text-[9px] font-bold">{organization.name[0]}</span>
              </div>
              <span className="text-xs text-[var(--text-secondary)] font-medium truncate flex-1 text-left">{organization.name}</span>
              <ChevronDown size={12} className="text-[var(--text-muted)] shrink-0 group-hover:text-[var(--text-secondary)] transition-colors" />
            </button>
          )}
        </div>

        {/* Search / ⌘K */}
        <div className="px-2 pb-2">
          <button
            onClick={() => setCmdOpen(true)}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-[var(--radius-md)] bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--border-strong)] text-[var(--text-muted)] text-xs transition-all hover:text-[var(--text-secondary)] group"
          >
            <Search size={13} className="shrink-0" />
            <span className="flex-1 text-left">Rechercher...</span>
            <kbd className="hidden group-hover:flex items-center gap-0.5 font-mono text-[10px] bg-[var(--surface)] border border-[var(--border)] rounded px-1 py-0.5">
              ⌘K
            </kbd>
          </button>
        </div>

        <SidebarNav />

        {/* Bottom section */}
        <div className="px-2 py-3 border-t border-[var(--border)] space-y-0.5">
          {/* Plan indicator */}
          <NavLink
            to="/billing"
            className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--text-secondary)] transition-all group"
          >
            <Zap size={14} className={`shrink-0 ${plan.color}`} />
            <span className={`font-medium ${plan.color}`}>{plan.label}</span>
            {planId === 'free' && (
              <span className="ml-auto text-[10px] text-[var(--cyan-700)] bg-[var(--cyan-05)] px-1.5 py-0.5 rounded-full border border-[var(--cyan-20)] font-medium">
                Upgrade
              </span>
            )}
          </NavLink>

          <NavLink
            to="/parametres"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-medium transition-all ${
                isActive
                  ? 'bg-[var(--cyan-05)] text-[var(--text-primary)]'
                  : 'text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <Settings size={15} className={`shrink-0 ${isActive ? 'text-[var(--cyan-700)]' : 'text-[var(--text-muted)]'}`} />
                Paramètres
              </>
            )}
          </NavLink>

          {profile?.role === 'admin' && (
            <NavLink
              to="/admin"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-medium transition-all ${
                  isActive ? 'bg-violet-50 text-violet-700' : 'text-[var(--text-secondary)] hover:bg-[var(--bg)] hover:text-[var(--text-primary)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <UserCog size={15} className={`shrink-0 ${isActive ? 'text-violet-600' : 'text-[var(--text-muted)]'}`} />
                  Admin
                </>
              )}
            </NavLink>
          )}

          {isSuperAdmin && (
            <NavLink
              to="/super-admin"
              className={({ isActive }) =>
                `flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-medium transition-all ${
                  isActive ? 'bg-slate-900 text-white' : 'text-[var(--text-secondary)] hover:bg-slate-900 hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Shield size={15} className={`shrink-0 ${isActive ? 'text-white' : 'text-[var(--text-muted)]'}`} />
                  Super Admin
                </>
              )}
            </NavLink>
          )}

          {/* User */}
          <NavLink
            to="/mon-compte"
            className={({ isActive }) =>
              `flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-medium transition-all mt-1 ${
                isActive ? 'bg-[var(--cyan-05)]' : 'hover:bg-[var(--bg)]'
              }`
            }
          >
            <div className="w-6 h-6 rounded-full bg-[var(--text-primary)] flex items-center justify-center shrink-0">
              <span className="text-[9px] font-bold text-[var(--cyan)]">{initials}</span>
            </div>
            <span className="text-[var(--text-secondary)] truncate">{profile?.first_name} {profile?.last_name}</span>
          </NavLink>

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] font-medium text-[var(--text-muted)] hover:bg-[var(--bg)] hover:text-[var(--error)] transition-all text-left"
          >
            <LogOut size={14} className="shrink-0" />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Mobile overlay ──────────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Mobile Sidebar ──────────────────────────────── */}
      <aside className={`fixed inset-y-0 left-0 w-[260px] bg-[var(--surface)] border-r border-[var(--border)] z-50 flex flex-col transition-transform duration-300 ease-out md:hidden ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 bg-[var(--text-primary)] rounded-[var(--radius-sm)] flex items-center justify-center">
              <span className="text-[var(--cyan)] font-bold text-xs">R</span>
            </div>
            <span className="font-bold text-[var(--text-primary)] text-[15px]">rekruit</span>
          </div>
          <button onClick={() => setMobileOpen(false)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg)] text-[var(--text-muted)] transition-colors">
            <X size={18} />
          </button>
        </div>
        <SidebarNav />
        <div className="px-2 py-3 border-t border-[var(--border)] space-y-0.5">
          <NavLink to="/parametres" onClick={() => setMobileOpen(false)}
            className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] text-[var(--text-secondary)] hover:bg-[var(--bg)] transition-all">
            <Settings size={15} className="text-[var(--text-muted)]" />
            Paramètres
          </NavLink>
          <button onClick={handleSignOut}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-md)] text-[13px] text-[var(--text-muted)] hover:text-[var(--error)] hover:bg-[var(--bg)] transition-all text-left">
            <LogOut size={14} />
            Déconnexion
          </button>
        </div>
      </aside>

      {/* ── Main area ──────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile topbar */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 bg-[var(--surface)] border-b border-[var(--border)]">
          <button onClick={() => setMobileOpen(true)} className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg)] text-[var(--text-secondary)] transition-colors">
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-[var(--text-primary)] rounded-[var(--radius-xs)] flex items-center justify-center">
              <span className="text-[var(--cyan)] font-bold text-[10px]">R</span>
            </div>
            <span className="font-bold text-[var(--text-primary)] text-sm">rekruit</span>
          </div>
          <button className="p-1.5 rounded-[var(--radius-sm)] hover:bg-[var(--bg)] text-[var(--text-secondary)] transition-colors relative">
            <Bell size={18} />
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex items-center bg-[var(--surface)] border-t border-[var(--border)]">
          {navItems.slice(0, 4).map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-2.5 text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[var(--cyan-700)]' : 'text-[var(--text-muted)]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={20} />
                  {label}
                  {isActive && <span className="absolute bottom-0 w-8 h-[2px] bg-[var(--cyan)] rounded-t-full" />}
                </>
              )}
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Command Palette */}
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} />
    </div>
  )
}
