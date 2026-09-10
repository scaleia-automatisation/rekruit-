import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Users, Briefcase, UserPlus, Settings, TrendingUp, BarChart3 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Stats {
  totalUsers: number
  totalOffers: number
  totalCandidates: number
  activeOffers: number
}

export function AdminPage() {
  const { organization, profile } = useAuth()
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalOffers: 0, totalCandidates: 0, activeOffers: 0 })

  useEffect(() => {
    if (!organization?.id) return
    const fetchStats = async () => {
      const [{ count: totalUsers }, { count: totalOffers }, { count: totalCandidates }, { count: activeOffers }] = await Promise.all([
        supabase.from('users').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id),
        supabase.from('job_offers').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id),
        supabase.from('candidates').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id),
        supabase.from('job_offers').select('id', { count: 'exact', head: true }).eq('organization_id', organization.id).eq('status', 'active'),
      ])
      setStats({ totalUsers: totalUsers ?? 0, totalOffers: totalOffers ?? 0, totalCandidates: totalCandidates ?? 0, activeOffers: activeOffers ?? 0 })
    }
    fetchStats()
  }, [organization?.id])

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full p-10 text-center">
        <div>
          <p className="text-slate-500 font-medium">Accès réservé aux administrateurs</p>
        </div>
      </div>
    )
  }

  const cards = [
    { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'bg-blue-50 text-blue-600', href: '/admin/utilisateurs' },
    { label: 'Offres publiées', value: stats.totalOffers, icon: Briefcase, color: 'bg-violet-50 text-violet-600', href: '/offres' },
    { label: 'Offres actives', value: stats.activeOffers, icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', href: '/offres' },
    { label: 'Candidats total', value: stats.totalCandidates, icon: BarChart3, color: 'bg-amber-50 text-amber-600', href: '/candidats' },
  ]

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Administration</h1>
          <p className="text-slate-500 text-sm mt-0.5">{organization?.name}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {cards.map(({ label, value, icon: Icon, color, href }) => (
          <Link to={href} key={label} className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-slate-300 hover:shadow-sm transition-all group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={18} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500 font-medium mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid md:grid-cols-2 gap-4">
        <Link to="/admin/utilisateurs" className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-blue-200 hover:shadow-sm transition-all">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
              <UserPlus size={20} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Gestion des utilisateurs</h3>
              <p className="text-sm text-slate-500 mt-0.5">Inviter, gérer les rôles et accès de votre équipe.</p>
            </div>
          </div>
        </Link>

        <Link to="/parametres" className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-slate-300 hover:shadow-sm transition-all">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-slate-50 rounded-xl flex items-center justify-center shrink-0">
              <Settings size={20} className="text-slate-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Paramètres entreprise</h3>
              <p className="text-sm text-slate-500 mt-0.5">Modifier le nom, logo et informations de votre organisation.</p>
            </div>
          </div>
        </Link>

        <Link to="/analytics" className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-violet-200 hover:shadow-sm transition-all">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
              <BarChart3 size={20} className="text-violet-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Analytics de recrutement</h3>
              <p className="text-sm text-slate-500 mt-0.5">Suivre la performance de vos recrutements en temps réel.</p>
            </div>
          </div>
        </Link>

        <Link to="/billing" className="bg-white rounded-2xl border border-slate-200 p-6 hover:border-emerald-200 hover:shadow-sm transition-all">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
              <TrendingUp size={20} className="text-emerald-600" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900">Facturation</h3>
              <p className="text-sm text-slate-500 mt-0.5">Gérer votre abonnement, usage et paiements.</p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  )
}
