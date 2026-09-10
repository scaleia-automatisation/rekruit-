import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface RevenueOrg {
  plan: string
  plan_interval: string | null
  plan_status: string | null
}

export function SuperAdminRevenue() {
  const [orgs, setOrgs] = useState<RevenueOrg[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('organizations').select('plan, plan_interval, plan_status')
      .then(({ data }) => {
        if (data) setOrgs(data as RevenueOrg[])
        setLoading(false)
      })
  }, [])

  const prices: Record<string, { monthly: number; annual: number }> = {
    tpe_pme: { monthly: 39.90, annual: 399 / 12 },
    agence: { monthly: 79.90, annual: 799 / 12 },
  }

  const active = orgs.filter(o => o.plan_status === 'active' || o.plan_status === 'trialing')
  let mrr = 0
  const byPlan: Record<string, { count: number; revenue: number }> = { tpe_pme: { count: 0, revenue: 0 }, agence: { count: 0, revenue: 0 } }

  for (const o of active) {
    if (o.plan !== 'free' && prices[o.plan]) {
      const rev = o.plan_interval === 'annual' ? prices[o.plan].annual : prices[o.plan].monthly
      mrr += rev
      byPlan[o.plan].count++
      byPlan[o.plan].revenue += rev
    }
  }

  const planLabel: Record<string, string> = { tpe_pme: 'Pro', agence: 'Business' }
  const planColors: Record<string, string> = { tpe_pme: 'bg-blue-500', agence: 'bg-violet-500' }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Revenus</h1>
        <p className="text-slate-400 text-sm mt-0.5">Estimations basées sur les abonnements actifs</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-gradient-to-br from-emerald-600/20 to-emerald-800/10 border border-emerald-500/20 rounded-2xl p-6">
              <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center mb-4">
                <DollarSign size={18} className="text-emerald-400" />
              </div>
              <p className="text-xs text-emerald-400 font-semibold uppercase tracking-widest mb-1">MRR</p>
              <p className="text-4xl font-extrabold text-white">{Math.round(mrr).toLocaleString('fr-FR')}€</p>
              <p className="text-sm text-emerald-400/70 mt-1">Revenu mensuel récurrent</p>
            </div>
            <div className="bg-gradient-to-br from-blue-600/20 to-blue-800/10 border border-blue-500/20 rounded-2xl p-6">
              <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp size={18} className="text-blue-400" />
              </div>
              <p className="text-xs text-blue-400 font-semibold uppercase tracking-widest mb-1">ARR</p>
              <p className="text-4xl font-extrabold text-white">{Math.round(mrr * 12).toLocaleString('fr-FR')}€</p>
              <p className="text-sm text-blue-400/70 mt-1">Revenu annuel récurrent</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
            <h2 className="text-sm font-bold text-white mb-5">Répartition par plan</h2>
            <div className="flex flex-col gap-4">
              {Object.entries(byPlan).map(([plan, { count, revenue }]) => (
                <div key={plan}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${planColors[plan]}`} />
                      <span className="text-sm text-slate-300 font-medium">{planLabel[plan]}</span>
                      <span className="text-xs text-slate-500">{count} clients</span>
                    </div>
                    <span className="text-sm font-bold text-white">{Math.round(revenue).toLocaleString('fr-FR')}€/mois</span>
                  </div>
                  <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${planColors[plan]}`}
                      style={{ width: mrr > 0 ? `${(revenue / mrr) * 100}%` : '0%' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
