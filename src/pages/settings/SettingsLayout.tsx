import { type ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { User, Building2, Bell, Shield, CreditCard, Users, Database } from 'lucide-react'

const nav = [
  { to: '/settings/profile', icon: <User size={16} />, label: 'Mon profil' },
  { to: '/settings/company', icon: <Building2 size={16} />, label: 'Entreprise' },
  { to: '/settings/notifications', icon: <Bell size={16} />, label: 'Notifications' },
  { to: '/settings/security', icon: <Shield size={16} />, label: 'Sécurité' },
  { to: '/settings/subscription', icon: <CreditCard size={16} />, label: 'Abonnement' },
  { to: '/settings/team', icon: <Users size={16} />, label: 'Équipe' },
  { to: '/settings/data', icon: <Database size={16} />, label: 'Données' },
]

export function SettingsLayout({ children }: { children: ReactNode }) {
  const location = useLocation()
  return (
    <div className="flex flex-col lg:flex-row gap-6">
      <aside className="lg:w-56 shrink-0">
        <nav className="flex lg:flex-col gap-1">
          {nav.map(({ to, icon, label }) => (
            <Link key={to} to={to}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${location.pathname === to ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}>
              {icon}
              <span className="hidden sm:block">{label}</span>
            </Link>
          ))}
        </nav>
      </aside>
      <div className="flex-1 min-w-0">{children}</div>
    </div>
  )
}
