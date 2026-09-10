import { type ReactNode } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { LayoutDashboard, Building2, CreditCard, TrendingUp, Activity, LogOut, Shield } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'

const nav = [
  { to: '/super-admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/super-admin/entreprises', icon: Building2, label: 'Entreprises' },
  { to: '/super-admin/abonnements', icon: CreditCard, label: 'Abonnements' },
  { to: '/super-admin/revenus', icon: TrendingUp, label: 'Revenus' },
  { to: '/super-admin/usage', icon: Activity, label: 'Usage IA' },
]

export function SuperAdminLayout({ children }: { children: ReactNode }) {
  const { isSuperAdmin, profile, signOut } = useAuth()
  const navigate = useNavigate()

  if (!isSuperAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0A0A0F]">
        <div className="text-center">
          <Shield size={40} className="text-red-400 mx-auto mb-4" />
          <p className="text-white font-bold text-xl mb-2">Accès refusé</p>
          <p className="text-slate-400 text-sm">Cette zone est réservée aux super-administrateurs.</p>
        </div>
      </div>
    )
  }

  const initials = `${profile?.first_name?.[0] ?? ''}${profile?.last_name?.[0] ?? ''}`.toUpperCase() || 'SA'

  return (
    <div className="min-h-screen flex bg-[#0A0A0F] text-white font-['Plus_Jakarta_Sans',system-ui,sans-serif]">
      {/* Sidebar */}
      <aside className="w-60 flex flex-col shrink-0 border-r border-white/10 bg-[#0D0D14]">
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-white/10">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-violet-600 rounded-lg flex items-center justify-center">
            <Shield size={16} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-white text-sm">Super Admin</p>
            <p className="text-xs text-slate-500">rekruit Platform</p>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 flex flex-col gap-0.5">
          {nav.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
              )}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2.5 mb-1">
            <div className="w-7 h-7 bg-gradient-to-br from-blue-500 to-violet-600 rounded-full flex items-center justify-center text-xs font-bold text-white">{initials}</div>
            <span className="text-sm text-slate-300 truncate">{profile?.first_name}</span>
          </div>
          <button
            onClick={async () => { await signOut(); navigate('/') }}
            className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all w-full"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
          <NavLink to="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm text-slate-500 hover:text-white hover:bg-white/5 transition-all mt-0.5">
            ← App
          </NavLink>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  )
}
