import { useState, useEffect } from 'react'
import { Activity, Zap } from 'lucide-react'
import { supabase } from '../../lib/supabase'

interface UsageLog {
  id: string
  organization_id: string
  type: string
  tokens_in: number | null
  tokens_out: number | null
  cost_estimated: number | null
  created_at: string
  organization?: { name: string }
}

export function SuperAdminUsage() {
  const [logs, setLogs] = useState<UsageLog[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCost, setTotalCost] = useState(0)
  const [totalTokens, setTotalTokens] = useState(0)

  useEffect(() => {
    supabase.from('ai_usage_logs').select('*, organization:organizations(name)')
      .order('created_at', { ascending: false })
      .limit(200)
      .then(({ data }) => {
        if (data) {
          setLogs(data as UsageLog[])
          let cost = 0, tokens = 0
          for (const l of data) {
            if (l.cost_estimated) cost += l.cost_estimated
            if (l.tokens_in) tokens += l.tokens_in
            if (l.tokens_out) tokens += l.tokens_out
          }
          setTotalCost(cost)
          setTotalTokens(tokens)
        }
        setLoading(false)
      })
  }, [])

  const typeColors: Record<string, string> = {
    analyze_offer: 'text-blue-400 bg-blue-500/10',
    analyze_candidate: 'text-violet-400 bg-violet-500/10',
    analyze_interview: 'text-amber-400 bg-amber-500/10',
    generate_message: 'text-emerald-400 bg-emerald-500/10',
  }
  const typeLabels: Record<string, string> = {
    analyze_offer: 'Analyse offre',
    analyze_candidate: 'Analyse candidat',
    analyze_interview: 'Analyse entretien',
    generate_message: 'Génération message',
  }

  return (
    <div className="px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Usage IA</h1>
        <p className="text-slate-400 text-sm mt-0.5">Utilisation de l'API Claude (200 derniers appels)</p>
      </div>

      {loading ? (
        <div className="text-slate-400 text-sm">Chargement...</div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="w-9 h-9 bg-violet-500/10 rounded-xl flex items-center justify-center mb-3">
                <Zap size={16} className="text-violet-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">{logs.length}</p>
              <p className="text-xs text-slate-400 mt-0.5">Appels IA</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="w-9 h-9 bg-blue-500/10 rounded-xl flex items-center justify-center mb-3">
                <Activity size={16} className="text-blue-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">{(totalTokens / 1000).toFixed(0)}K</p>
              <p className="text-xs text-slate-400 mt-0.5">Tokens totaux</p>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
              <div className="w-9 h-9 bg-emerald-500/10 rounded-xl flex items-center justify-center mb-3">
                <Zap size={16} className="text-emerald-400" />
              </div>
              <p className="text-2xl font-extrabold text-white">${totalCost.toFixed(4)}</p>
              <p className="text-xs text-slate-400 mt-0.5">Coût estimé (USD)</p>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Entreprise</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Type</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400">Tokens in</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400">Tokens out</th>
                  <th className="text-right px-5 py-3.5 text-xs font-semibold text-slate-400">Coût $</th>
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-slate-400">Date</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(l => (
                  <tr key={l.id} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <span className="text-sm text-slate-300">{(l.organization as { name: string } | undefined)?.name ?? l.organization_id.slice(0, 8) + '…'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[l.type] ?? 'text-slate-400 bg-white/5'}`}>
                        {typeLabels[l.type] ?? l.type}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs text-slate-500">{l.tokens_in?.toLocaleString() ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs text-slate-500">{l.tokens_out?.toLocaleString() ?? '—'}</span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span className="text-xs text-slate-400">{l.cost_estimated ? `$${l.cost_estimated.toFixed(5)}` : '—'}</span>
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs text-slate-500">{new Date(l.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {logs.length === 0 && (
              <div className="text-center py-16 text-slate-400 text-sm">Aucun log d'usage.</div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
