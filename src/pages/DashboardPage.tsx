import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Briefcase, Users, UserCheck, CalendarDays, TrendingUp, Plus, ArrowRight, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

interface Stats {
  activeOffers: number
  totalCandidates: number
  shortlisted: number
  upcomingInterviews: number
  hired: number
}

interface PipelineItem {
  id: string
  first_name: string
  last_name: string
  job_title: string
  score_global: number | null
  status: string
  progression: number | null
}

const statusConfig: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple' }> = {
  new: { label: 'Nouveau', variant: 'gray' },
  analyzing: { label: 'Analyse...', variant: 'blue' },
  analyzed: { label: 'Analysé', variant: 'blue' },
  shortlisted: { label: 'Retenu', variant: 'green' },
  interview_1: { label: 'Entretien 1', variant: 'orange' },
  interview_2: { label: 'Entretien 2', variant: 'orange' },
  interview_3: { label: 'Entretien 3', variant: 'purple' },
  offer: { label: 'Offre', variant: 'green' },
  hired: { label: 'Recruté', variant: 'green' },
  rejected: { label: 'Refusé', variant: 'red' },
  pool: { label: 'Vivier', variant: 'gray' },
}

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon size={22} className="text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { profile, organization } = useAuth()
  const [stats, setStats] = useState<Stats>({ activeOffers: 0, totalCandidates: 0, shortlisted: 0, upcomingInterviews: 0, hired: 0 })
  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.organization_id) return

      const [offersRes, candidatesRes, interviewsRes] = await Promise.all([
        supabase.from('job_offers').select('id, status').eq('organization_id', profile.organization_id),
        supabase.from('candidates').select('id, status, first_name, last_name, score_global, progression, job_offer_id').eq('organization_id', profile.organization_id).order('created_at', { ascending: false }).limit(50),
        supabase.from('interviews').select('id, scheduled_at, status').eq('organization_id', profile.organization_id).eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()),
      ])

      const offers = offersRes.data || []
      const candidates = candidatesRes.data || []
      const interviews = interviewsRes.data || []

      setStats({
        activeOffers: offers.filter(o => o.status === 'active').length,
        totalCandidates: candidates.length,
        shortlisted: candidates.filter(c => ['shortlisted', 'interview_1', 'interview_2', 'interview_3', 'offer'].includes(c.status)).length,
        upcomingInterviews: interviews.length,
        hired: candidates.filter(c => c.status === 'hired').length,
      })

      // Build pipeline (recent active candidates)
      const activeCandidates = candidates.filter(c => !['rejected', 'pool', 'hired'].includes(c.status)).slice(0, 8)

      // Get job titles
      if (activeCandidates.length > 0) {
        const jobIds = [...new Set(activeCandidates.map(c => c.job_offer_id).filter(Boolean))]
        const { data: jobs } = await supabase.from('job_offers').select('id, title').in('id', jobIds as string[])
        const jobMap = Object.fromEntries((jobs || []).map(j => [j.id, j.title]))

        setPipeline(activeCandidates.map(c => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          job_title: c.job_offer_id ? (jobMap[c.job_offer_id] || 'Poste non précisé') : 'Poste non précisé',
          score_global: c.score_global,
          status: c.status,
          progression: c.progression,
        })))
      }

      setLoading(false)
    }

    fetchData()
  }, [profile?.organization_id])

  const contextMessage = () => {
    if (stats.activeOffers === 0) return { msg: 'Votre première étape : ajoutez une offre d\'emploi.', to: '/offres' }
    if (stats.totalCandidates === 0) return { msg: 'Votre offre est prête. Ajoutez votre premier candidat.', to: '/candidats' }
    if (stats.shortlisted > 0) return { msg: `${stats.shortlisted} candidat${stats.shortlisted > 1 ? 's' : ''} retenu${stats.shortlisted > 1 ? 's' : ''} — proposez un entretien.`, to: '/entretiens' }
    return null
  }
  const ctx = contextMessage()

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Bonjour {profile?.first_name} 👋
          </h1>
          <p className="text-slate-500 mt-1">Voici l'état de vos recrutements.</p>
        </div>
        <div className="flex gap-3">
          <Link to="/offres/nouvelle">
            <Button size="sm" variant="secondary">
              <Plus size={16} />
              Offre
            </Button>
          </Link>
          <Link to="/candidats/nouveau">
            <Button size="sm">
              <Plus size={16} />
              Candidat
            </Button>
          </Link>
        </div>
      </div>

      {/* Context message */}
      {ctx && (
        <Link to={ctx.to} className="block mb-6">
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-center justify-between group hover:bg-blue-100 transition-colors">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <span className="text-white text-sm">💡</span>
              </div>
              <p className="text-sm font-medium text-blue-800">{ctx.msg}</p>
            </div>
            <ChevronRight size={18} className="text-blue-500 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      )}

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        <StatCard icon={Briefcase} label="Offres actives" value={stats.activeOffers} color="bg-blue-500" />
        <StatCard icon={Users} label="Candidats" value={stats.totalCandidates} color="bg-slate-700" />
        <StatCard icon={UserCheck} label="Retenus" value={stats.shortlisted} color="bg-green-600" />
        <StatCard icon={CalendarDays} label="Entretiens" value={stats.upcomingInterviews} color="bg-orange-500" />
        <StatCard icon={TrendingUp} label="Recrutés" value={stats.hired} color="bg-purple-600" />
      </div>

      {/* Pipeline */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card padding="none">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-900">Pipeline actif</h2>
              <Link to="/candidats" className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                Tout voir <ArrowRight size={14} />
              </Link>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : pipeline.length === 0 ? (
              <div className="p-12 text-center">
                <div className="text-4xl mb-3">🎯</div>
                <p className="text-slate-500 mb-4">Aucun candidat actif pour l'instant.</p>
                <Link to="/candidats/nouveau">
                  <Button size="sm">
                    <Plus size={15} />
                    Ajouter un candidat
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {pipeline.map(c => {
                  const st = statusConfig[c.status] || { label: c.status, variant: 'gray' as const }
                  return (
                    <Link key={c.id} to={`/candidats/${c.id}`} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-700 text-sm font-bold">
                          {c.first_name[0]}{c.last_name[0]}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-semibold text-slate-900 truncate">
                            {c.first_name} {c.last_name}
                          </p>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{c.job_title}</p>
                      </div>
                      {c.score_global !== null && (
                        <div className="text-center shrink-0">
                          <p className={`text-lg font-bold ${
                            c.score_global >= 75 ? 'text-green-600' :
                            c.score_global >= 50 ? 'text-orange-500' : 'text-red-500'
                          }`}>{c.score_global}</p>
                          <p className="text-xs text-slate-400">/100</p>
                        </div>
                      )}
                      <div className="shrink-0">
                        <Badge variant={st.variant}>{st.label}</Badge>
                      </div>
                      <ChevronRight size={16} className="text-slate-300 shrink-0" />
                    </Link>
                  )
                })}
              </div>
            )}
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col gap-4">
          <Card>
            <h2 className="font-bold text-slate-900 mb-4">Actions rapides</h2>
            <div className="flex flex-col gap-2">
              <Link to="/offres/nouvelle">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group cursor-pointer">
                  <div className="w-9 h-9 bg-blue-100 rounded-lg flex items-center justify-center">
                    <Briefcase size={18} className="text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">Nouvelle offre</p>
                    <p className="text-xs text-slate-500">Publier un poste</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-blue-400 transition-colors" />
                </div>
              </Link>
              <Link to="/candidats/nouveau">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-green-300 hover:bg-green-50 transition-all group cursor-pointer">
                  <div className="w-9 h-9 bg-green-100 rounded-lg flex items-center justify-center">
                    <Users size={18} className="text-green-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">Ajouter un candidat</p>
                    <p className="text-xs text-slate-500">Déposer un CV</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-green-400 transition-colors" />
                </div>
              </Link>
              <Link to="/entretiens">
                <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 hover:border-orange-300 hover:bg-orange-50 transition-all group cursor-pointer">
                  <div className="w-9 h-9 bg-orange-100 rounded-lg flex items-center justify-center">
                    <CalendarDays size={18} className="text-orange-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-800">Planifier un entretien</p>
                    <p className="text-xs text-slate-500">Gérer le calendrier</p>
                  </div>
                  <ChevronRight size={16} className="text-slate-300 group-hover:text-orange-400 transition-colors" />
                </div>
              </Link>
            </div>
          </Card>

          {organization && (
            <Card>
              <h2 className="font-bold text-slate-900 mb-3">Votre organisation</h2>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white font-bold">{organization.name[0]}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{organization.name}</p>
                  <p className="text-xs text-slate-500 capitalize">Plan {organization.plan}</p>
                </div>
              </div>
              <Link to="/parametres">
                <Button variant="ghost" size="sm" className="w-full">
                  Gérer les paramètres
                </Button>
              </Link>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
