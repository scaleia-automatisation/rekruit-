import { useState, useEffect } from 'react'
import { TrendingUp, Building2, Users, CreditCard, Activity, DollarSign } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface DashboardStats {
  totalOrgs: number
  activeOrgs: number
  freeOrgs: number
  tpeOrgs: number
  agenceOrgs: number
  totalUsers: number
  totalCandidates: number
  mrr: number
  arr: number
}

export function SuperAdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      const [{ data: orgs }, { count: totalUsers }, { count: totalCandidates }] = await Promise.all([
        supabase.from('organizations').select('plan, plan_status, plan_interval'),
        supabase.from('users').select('id', { count: 'exact', head: true }),
        supabase.from('candidates').select('id', { count: 'exact', head: true }),
      ])

      if (!orgs) { setLoading(false); return }

      let mrr = 0
      let tpeOrgs = 0, agenceOrgs = 0, freeOrgs = 0, activeOrgs = 0
      for (const o of orgs) {
        if (o.plan_status === 'active' || o.plan_status === 'trialing') activeOrgs++
        if (o.plan === 'tpe_pme') {
          tpeOrgs++
          mrr += o.plan_interval === 'annual' ? 399 / 12 : 39.90
        } else if (o.plan === 'agence') {
          agenceOrgs++
          mrr += o.plan_interval === 'annual' ? 799 / 12 : 79.90
        } else {
          freeOrgs++
        }
      }

      setStats({
        totalOrgs: orgs.length,
        activeOrgs,
        freeOrgs,
        tpeOrgs,
        agenceOrgs,
        totalUsers: totalUsers ?? 0,
        totalCandidates: totalCandidates ?? 0,
        mrr: Math.round(mrr),
        arr: Math.round(mrr * 12),
      })
      setLoading(false)
    }
    fetch()
  }, [])

  const kpis = stats ? [
    { label: 'MRR', value: `${stats.mrr.toLocaleString('fr-FR')}€`, icon: DollarSign, color: 'text-emerald-400 bg-emerald-500/10' },
    { label: 'ARR', value: `${stats.arr.toLocaleString('fr-FR')}€`, icon: TrendingUp, color: 'text-blue-400 bg-blue-500/10' },
    { label: 'Entreprises', value: stats.totalOrgs, icon: Building2, color: 'text-violet-400 bg-violet-500/10' },
    { label: 'Utilisateurs', value: stats.totalUsers, icon: Users, color: 'text-amber-400 bg-amber-500/10' },
    { label: 'Candidats', value: stats.totalCandidates, icon: Activity, color: 'text-pink-400 bg-pink-500/10' },
    { label: 'Plans actifs', value: stats.activeOrgs, icon: CreditCard, color: 'text-cyan-400 bg-cyan-500/10' },
  ] : []

  const planDist = stats ? [
    { label: 'Free', count: stats.freeOrgs, color: 'bg-slate-400' },
    { label: 'TPE/PME', count: stats.tpeOrgs, color: 'bg-blue-500' },
    { label: 'Agence', count: stats.agenceOrgs, color: 'bg-violet-500' },
  ] : []

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Dashboard Platform</h1>
        <p className="text-slate-400 text-sm mt-0.5">Vue d'ensemble rekruit.net</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {kpis.map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={16} />
                </div>
                <p className="text-2xl font-extrabold text-white">{value}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-5">Répartition par plan</h2>
            <div className="flex gap-6">
              {planDist.map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="text-sm text-slate-300">{label}</span>
                  <span className="text-sm font-bold text-white">{count}</span>
                </div>
              ))}
            </div>
            {stats && stats.totalOrgs > 0 && (
              <div className="mt-4 h-3 bg-white/10 rounded-full overflow-hidden flex">
                {planDist.map(({ label, count, color }) => (
                  <div
                    key={label}
                    className={`${color} h-full transition-all`}
                    style={{ width: `${(count / stats.totalOrgs) * 100}%` }}
                  />
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
