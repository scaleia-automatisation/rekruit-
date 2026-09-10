import { useState, useEffect } from 'react'
import { Building2, Search } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface Company {
  id: string
  name: string
  email: string | null
  plan: string
  plan_status: string | null
  plan_interval: string | null
  created_at: string
  stripe_customer_id: string | null
}

const planColors: Record<string, string> = {
  free: 'bg-slate-800 text-slate-400',
  tpe_pme: 'bg-blue-900 text-blue-300',
  agence: 'bg-violet-900 text-violet-300',
}

export function SuperAdminCompanies() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    supabase.from('organizations').select('id, name, email, plan, plan_status, plan_interval, created_at, stripe_customer_id')
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) setCompanies(data as Company[])
        setLoading(false)
      })
  }, [])

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || (c.email ?? '').toLowerCase().includes(search.toLowerCase()))

  const planLabel: Record<string, string> = { free: 'Free', tpe_pme: 'TPE/PME', agence: 'Agence' }
  const statusLabel: Record<string, string> = { active: 'Actif', canceled: 'Annulé', past_due: 'En retard', trialing: 'Essai' }

  return (
    <div className="px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Entreprises</h1>
          <p className="text-slate-400 text-sm mt-0.5">{companies.length} organisations</p>
        </div>
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
            className="bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 w-56"
          />
        </div>
      </div>

      <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="text-center py-16 text-slate-400 text-sm">Chargement...</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Entreprise</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Plan</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Statut</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Interval</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Créé le</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Stripe</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
                        <Building2 size={14} className="text-slate-400" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">{c.name}</p>
                        {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${planColors[c.plan] ?? 'bg-slate-800 text-slate-400'}`}>
                      {planLabel[c.plan] ?? c.plan}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs font-medium ${c.plan_status === 'active' ? 'text-emerald-400' : c.plan_status === 'past_due' ? 'text-red-400' : 'text-slate-400'}`}>
                      {statusLabel[c.plan_status ?? ''] ?? (c.plan_status ?? '—')}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-400">{c.plan_interval === 'annual' ? 'Annuel' : c.plan_interval === 'monthly' ? 'Mensuel' : '—'}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-500">{new Date(c.created_at).toLocaleDateString('fr-FR')}</span>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className="text-xs text-slate-600 font-mono">{c.stripe_customer_id ? c.stripe_customer_id.slice(0, 14) + '…' : '—'}</span>
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
