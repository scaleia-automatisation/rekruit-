import { useState, useEffect } from 'react'
import { TrendingUp, Users, Briefcase, Clock, Target, CheckCircle } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'

interface Analytics {
  totalCandidates: number
  totalOffers: number
  hiredCount: number
  rejectedCount: number
  avgScore: number
  statusBreakdown: Record<string, number>
  offerPerformance: { title: string; candidateCount: number; avgScore: number }[]
}

export function AnalyticsPage() {
  const { organization } = useAuth()
  const [data, setData] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<'30' | '90' | 'all'>('30')

  useEffect(() => {
    if (!organization?.id) return
    const fetchAnalytics = async () => {
      setLoading(true)
      const dateFilter = period !== 'all'
        ? new Date(Date.now() - Number(period) * 86400 * 1000).toISOString()
        : null

      let candidatesQuery = supabase.from('candidates').select('status, score_global, job_offer_id').eq('organization_id', organization.id)
      if (dateFilter) candidatesQuery = candidatesQuery.gte('created_at', dateFilter)
      const { data: candidates } = await candidatesQuery

      let offersQuery = supabase.from('job_offers').select('id, title').eq('organization_id', organization.id)
      const { data: offers } = await offersQuery

      if (!candidates) { setLoading(false); return }

      const statusBreakdown: Record<string, number> = {}
      let scoreSum = 0, scoreCount = 0
      for (const c of candidates) {
        statusBreakdown[c.status] = (statusBreakdown[c.status] ?? 0) + 1
        if (c.score_global) { scoreSum += c.score_global; scoreCount++ }
      }

      const offerMap: Record<string, { title: string; candidateCount: number; scoreSum: number; scoreCount: number }> = {}
      for (const o of (offers ?? [])) {
        offerMap[o.id] = { title: o.title, candidateCount: 0, scoreSum: 0, scoreCount: 0 }
      }
      for (const c of candidates) {
        if (c.job_offer_id && offerMap[c.job_offer_id]) {
          offerMap[c.job_offer_id].candidateCount++
          if (c.score_global) {
            offerMap[c.job_offer_id].scoreSum += c.score_global
            offerMap[c.job_offer_id].scoreCount++
          }
        }
      }

      setData({
        totalCandidates: candidates.length,
        totalOffers: (offers ?? []).length,
        hiredCount: statusBreakdown['hired'] ?? 0,
        rejectedCount: statusBreakdown['rejected'] ?? 0,
        avgScore: scoreCount > 0 ? Math.round(scoreSum / scoreCount) : 0,
        statusBreakdown,
        offerPerformance: Object.values(offerMap)
          .sort((a, b) => b.candidateCount - a.candidateCount)
          .slice(0, 5)
          .map(o => ({ title: o.title, candidateCount: o.candidateCount, avgScore: o.scoreCount > 0 ? Math.round(o.scoreSum / o.scoreCount) : 0 })),
      })
      setLoading(false)
    }
    fetchAnalytics()
  }, [organization?.id, period])

  const statusLabels: Record<string, string> = {
    new: 'Nouveau', analyzing: 'Analyse', analyzed: 'Analysé', shortlisted: 'Présélectionné',
    interview_1: 'Entretien 1', interview_2: 'Entretien 2', interview_3: 'Entretien 3',
    offer: 'Offre', hired: 'Embauché', rejected: 'Refusé', pool: 'Vivier',
  }
  const statusColors: Record<string, string> = {
    new: 'bg-slate-200', analyzing: 'bg-blue-300', analyzed: 'bg-blue-500',
    shortlisted: 'bg-violet-500', interview_1: 'bg-amber-400', interview_2: 'bg-amber-500',
    interview_3: 'bg-orange-500', offer: 'bg-emerald-400', hired: 'bg-emerald-600',
    rejected: 'bg-red-400', pool: 'bg-indigo-400',
  }

  return (
    <div className="max-w-5xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
          <p className="text-slate-500 text-sm mt-0.5">Performance de vos recrutements</p>
        </div>
        <div className="flex gap-2">
          {(['30', '90', 'all'] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-colors ${period === p ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {p === 'all' ? 'Tout' : `${p}j`}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="text-center py-20 text-slate-400">Chargement des données...</div>
      ) : !data ? (
        <div className="text-center py-20 text-slate-400">Aucune donnée disponible.</div>
      ) : (
        <>
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              { label: 'Candidats total', value: data.totalCandidates, icon: Users, color: 'text-blue-600 bg-blue-50' },
              { label: 'Offres publiées', value: data.totalOffers, icon: Briefcase, color: 'text-violet-600 bg-violet-50' },
              { label: 'Score IA moyen', value: data.avgScore > 0 ? `${data.avgScore}/100` : '—', icon: Target, color: 'text-emerald-600 bg-emerald-50' },
              { label: 'Embauchés', value: data.hiredCount, icon: CheckCircle, color: 'text-amber-600 bg-amber-50' },
            ].map(({ label, value, icon: Icon, color }) => (
              <div key={label} className="bg-white rounded-2xl border border-slate-200 p-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-2xl font-extrabold text-slate-900">{value}</p>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">{label}</p>
              </div>
            ))}
          </div>

          {/* Pipeline breakdown */}
          <div className="grid md:grid-cols-2 gap-5 mb-5">
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-slate-400" />
                Pipeline par statut
              </h2>
              <div className="flex flex-col gap-3">
                {Object.entries(data.statusBreakdown)
                  .sort((a, b) => b[1] - a[1])
                  .map(([status, count]) => {
                    const pct = data.totalCandidates > 0 ? (count / data.totalCandidates) * 100 : 0
                    return (
                      <div key={status}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-slate-600">{statusLabels[status] ?? status}</span>
                          <span className="text-xs font-bold text-slate-800">{count}</span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${statusColors[status] ?? 'bg-slate-400'}`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>

            {/* Offer performance */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Briefcase size={15} className="text-slate-400" />
                Top offres
              </h2>
              {data.offerPerformance.length === 0 ? (
                <p className="text-sm text-slate-400">Aucune offre sur la période.</p>
              ) : (
                <div className="flex flex-col gap-3">
                  {data.offerPerformance.map((o, i) => (
                    <div key={i} className="flex items-center justify-between gap-3">
                      <span className="text-sm text-slate-700 truncate flex-1">{o.title}</span>
                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-xs text-slate-500">{o.candidateCount} candidats</span>
                        {o.avgScore > 0 && (
                          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{o.avgScore}/100</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Conversion rate */}
          {data.totalCandidates > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h2 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                <Clock size={15} className="text-slate-400" />
                Taux de conversion
              </h2>
              <div className="grid grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {Math.round(((data.statusBreakdown['shortlisted'] ?? 0) / data.totalCandidates) * 100)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Présélection</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {Math.round(((data.statusBreakdown['offer'] ?? 0) / data.totalCandidates) * 100)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Offre envoyée</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-extrabold text-slate-900">
                    {Math.round((data.hiredCount / data.totalCandidates) * 100)}%
                  </p>
                  <p className="text-xs text-slate-500 mt-1">Embauché</p>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
