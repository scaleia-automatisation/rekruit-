import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

interface Sub {
  id: string
  organization_id: string
  plan: string
  status: string
  interval: string | null
  stripe_subscription_id: string | null
  created_at: string
  organization?: { name: string }
}

const planColors: Record<string, string> = {
  free: 'text-slate-400',
  tpe_pme: 'text-blue-400',
  agence: 'text-violet-400',
}

export function SuperAdminSubscriptions() {
  const [subs, setSubs] = useState<Sub[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('subscriptions').select('*, organization:organizations(name)')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setSubs(data as Sub[])
        setLoading(false)
      })
  }, [])

  const planLabel: Record<string, string> = { free: 'Free', tpe_pme: 'TPE/PME', agence: 'Agence' }
  const statusColors: Record<string, string> = {
    active: 'text-emerald-400', canceled: 'text-slate-500', past_due: 'text-red-400', trialing: 'text-blue-400',
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Abonnements</h1>
        <p className="text-slate-400 text-sm mt-0.5">{subs.length} abonnements</p>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Chargement...</div>
        ) : subs.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-sm">Aucun abonnement.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Entreprise</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Plan</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Statut</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Interval</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Stripe Sub</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Date</th>
              </tr>
            </thead>
            <tbody>
              {subs.map(s => (
                <tr key={s.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="text-sm text-white font-medium">{(s.organization as { name: string } | undefined)?.name ?? '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-bold ${planColors[s.plan] ?? 'text-slate-400'}`}>{planLabel[s.plan] ?? s.plan}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-sm font-medium ${statusColors[s.status] ?? 'text-slate-400'}`}>{s.status}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-400">{s.interval === 'annual' ? 'Annuel' : s.interval === 'monthly' ? 'Mensuel' : '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-600 font-mono">{s.stripe_subscription_id ? s.stripe_subscription_id.slice(0, 18) + '…' : '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-500">{new Date(s.created_at).toLocaleDateString('fr-FR')}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
