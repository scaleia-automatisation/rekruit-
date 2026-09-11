import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Briefcase, Users, UserCheck, CalendarDays, TrendingUp,
  Plus, ArrowRight, ChevronRight, Sparkles,
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { SkeletonStat, SkeletonRow } from '../components/ui/Skeleton'

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
}

const statusConfig: Record<string, { label: string; variant: 'cyan' | 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple' }> = {
  new:         { label: 'Nouveau',    variant: 'gray' },
  analyzing:   { label: 'Analyse…',  variant: 'blue' },
  analyzed:    { label: 'Analysé',   variant: 'blue' },
  shortlisted: { label: 'Retenu',    variant: 'green' },
  interview_1: { label: 'Entretien 1', variant: 'orange' },
  interview_2: { label: 'Entretien 2', variant: 'orange' },
  interview_3: { label: 'Entretien 3', variant: 'purple' },
  offer:       { label: 'Offre',     variant: 'cyan' },
  hired:       { label: 'Recruté',   variant: 'green' },
  rejected:    { label: 'Refusé',    variant: 'red' },
  pool:        { label: 'Vivier',    variant: 'gray' },
}

interface StatTileProps {
  icon: React.ElementType
  label: string
  value: number
  accent?: boolean
}

function StatTile({ icon: Icon, label, value, accent }: StatTileProps) {
  return (
    <div className={`bg-[var(--surface)] rounded-[var(--radius-lg)] border ${
      accent ? 'border-[var(--cyan-20)]' : 'border-[var(--border)]'
    } p-5 shadow-[var(--shadow-sm)] flex items-center gap-4`}>
      <div className={`w-10 h-10 rounded-[var(--radius-md)] flex items-center justify-center shrink-0 ${
        accent ? 'bg-[var(--cyan-10)]' : 'bg-[var(--bg-secondary)]'
      }`}>
        <Icon size={18} className={accent ? 'text-[var(--cyan-700)]' : 'text-[var(--text-muted)]'} />
      </div>
      <div>
        <p className={`text-2xl font-bold tabular-nums ${accent ? 'text-[var(--cyan-700)]' : 'text-[var(--text-primary)]'}`}>
          {value}
        </p>
        <p className="text-xs text-[var(--text-muted)] mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export function DashboardPage() {
  const { profile, organization } = useAuth()
  const [stats, setStats] = useState<Stats>({
    activeOffers: 0, totalCandidates: 0, shortlisted: 0, upcomingInterviews: 0, hired: 0,
  })
  const [pipeline, setPipeline] = useState<PipelineItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      if (!profile?.organization_id) return

      const [offersRes, candidatesRes, interviewsRes] = await Promise.all([
        supabase.from('job_offers').select('id, status').eq('organization_id', profile.organization_id),
        supabase.from('candidates').select('id, status, first_name, last_name, score_global, job_offer_id')
          .eq('organization_id', profile.organization_id)
          .order('created_at', { ascending: false })
          .limit(50),
        supabase.from('interviews').select('id').eq('organization_id', profile.organization_id)
          .eq('status', 'scheduled').gte('scheduled_at', new Date().toISOString()),
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

      const active = candidates.filter(c => !['rejected', 'pool', 'hired'].includes(c.status)).slice(0, 8)

      if (active.length > 0) {
        const jobIds = [...new Set(active.map(c => c.job_offer_id).filter(Boolean))]
        const { data: jobs } = await supabase.from('job_offers').select('id, title').in('id', jobIds as string[])
        const jobMap = Object.fromEntries((jobs || []).map(j => [j.id, j.title]))

        setPipeline(active.map(c => ({
          id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          job_title: c.job_offer_id ? (jobMap[c.job_offer_id] || 'Poste non précisé') : 'Poste non précisé',
          score_global: c.score_global,
          status: c.status,
        })))
      }

      setLoading(false)
    }
    fetchData()
  }, [profile?.organization_id])

  const contextMessage = () => {
    if (stats.activeOffers === 0) return { msg: 'Votre première étape : ajoutez une offre d\'emploi.', to: '/offres' }
    if (stats.totalCandidates === 0) return { msg: 'Votre offre est prête. Ajoutez votre premier candidat.', to: '/candidats' }
    if (stats.shortlisted > 0) return { msg: `${stats.shortlisted} candidat${stats.shortlisted > 1 ? 's' : ''} retenu${stats.shortlisted > 1 ? 's' : ''} — proposez un entretien.`, to: '/calendrier' }
    return null
  }
  const ctx = contextMessage()

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bonne après-midi' : 'Bonsoir'

  return (
    <div className="p-5 sm:p-7 max-w-[1200px] mx-auto animate-fade-in">

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-7">
        <div>
          <h1 className="text-[22px] font-bold text-[var(--text-primary)] tracking-tight">
            {greeting}, {profile?.first_name}
          </h1>
          <p className="text-[13.5px] text-[var(--text-muted)] mt-0.5">
            Voici l'état de vos recrutements
            {organization ? ` — ${organization.name}` : ''}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link to="/offres/nouvelle">
            <Button size="sm" variant="secondary">
              <Plus size={14} />
              Offre
            </Button>
          </Link>
          <Link to="/candidats/nouveau">
            <Button size="sm">
              <Plus size={14} />
              Candidat
            </Button>
          </Link>
        </div>
      </div>

      {/* Context nudge */}
      {!loading && ctx && (
        <Link to={ctx.to} className="block mb-6">
          <div className="flex items-center justify-between gap-3 px-4 py-3 bg-[var(--cyan-05)] border border-[var(--cyan-20)] rounded-[var(--radius-lg)] group hover:bg-[var(--cyan-10)] transition-colors">
            <div className="flex items-center gap-3">
              <Sparkles size={15} className="text-[var(--cyan-700)] shrink-0" />
              <p className="text-[13px] font-medium text-[var(--text-primary)]">{ctx.msg}</p>
            </div>
            <ChevronRight size={15} className="text-[var(--cyan-700)] shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </div>
        </Link>
      )}

      {/* KPI tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-7">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonStat key={i} />)
        ) : (
          <div className="contents stagger">
            <StatTile icon={Briefcase}    label="Offres actives"  value={stats.activeOffers}       />
            <StatTile icon={Users}        label="Candidats"       value={stats.totalCandidates}    />
            <StatTile icon={UserCheck}    label="Retenus"         value={stats.shortlisted}  accent />
            <StatTile icon={CalendarDays} label="Entretiens"      value={stats.upcomingInterviews} />
            <StatTile icon={TrendingUp}   label="Recrutés"        value={stats.hired}              />
          </div>
        )}
      </div>

      {/* Pipeline + sidebar */}
      <div className="grid lg:grid-cols-3 gap-5">

        {/* Pipeline table */}
        <div className="lg:col-span-2 bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-sm)] overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
            <h2 className="text-[13.5px] font-semibold text-[var(--text-primary)]">Pipeline actif</h2>
            <Link
              to="/candidats"
              className="flex items-center gap-1 text-[12px] font-medium text-[var(--cyan-700)] hover:opacity-80 transition-opacity"
            >
              Tout voir <ArrowRight size={12} />
            </Link>
          </div>

          {loading ? (
            <div className="divide-y divide-[var(--border)]">
              {Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)}
            </div>
          ) : pipeline.length === 0 ? (
            <div className="py-14 text-center">
              <div className="w-12 h-12 bg-[var(--bg-secondary)] rounded-[var(--radius-lg)] flex items-center justify-center mx-auto mb-3">
                <Users size={22} className="text-[var(--text-muted)]" />
              </div>
              <p className="text-[13px] font-medium text-[var(--text-secondary)] mb-1">Aucun candidat actif</p>
              <p className="text-[12px] text-[var(--text-muted)] mb-5">Ajoutez votre premier candidat pour démarrer.</p>
              <Link to="/candidats/nouveau">
                <Button size="sm">
                  <Plus size={14} />
                  Ajouter un candidat
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-[var(--border)]">
              {pipeline.map(c => {
                const st = statusConfig[c.status] || { label: c.status, variant: 'gray' as const }
                const initials = `${c.first_name?.[0] ?? ''}${c.last_name?.[0] ?? ''}`.toUpperCase()
                return (
                  <Link
                    key={c.id}
                    to={`/candidats/${c.id}`}
                    className="flex items-center gap-3 px-5 py-3.5 hover:bg-[var(--bg)] transition-colors group"
                  >
                    <div className="w-8 h-8 bg-[var(--cyan-10)] rounded-full flex items-center justify-center shrink-0">
                      <span className="text-[var(--cyan-700)] text-[11px] font-bold">{initials}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-medium text-[var(--text-primary)] truncate">
                        {c.first_name} {c.last_name}
                      </p>
                      <p className="text-[11px] text-[var(--text-muted)] truncate">{c.job_title}</p>
                    </div>
                    {c.score_global !== null && (
                      <div className="text-right shrink-0">
                        <p className={`text-[13px] font-bold tabular-nums ${
                          c.score_global >= 75 ? 'text-[var(--success)]' :
                          c.score_global >= 50 ? 'text-[var(--warning)]' : 'text-[var(--error)]'
                        }`}>{c.score_global}<span className="text-[10px] font-normal text-[var(--text-muted)]">/100</span></p>
                      </div>
                    )}
                    <div className="shrink-0">
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <ChevronRight size={14} className="text-[var(--text-muted)] shrink-0 group-hover:text-[var(--text-secondary)] transition-colors" />
                  </Link>
                )
              })}
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex flex-col gap-4">

          {/* Quick actions */}
          <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-4">
            <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
              Actions rapides
            </p>
            <div className="flex flex-col gap-1.5">
              {[
                { to: '/offres/nouvelle',  icon: Briefcase,    label: 'Nouvelle offre',       sub: 'Publier un poste' },
                { to: '/candidats/nouveau', icon: Users,       label: 'Ajouter un candidat',  sub: 'Déposer un CV' },
                { to: '/calendrier',       icon: CalendarDays, label: 'Planifier un entretien', sub: 'Gérer le calendrier' },
              ].map(({ to, icon: Icon, label, sub }) => (
                <Link key={to} to={to}>
                  <div className="flex items-center gap-3 p-2.5 rounded-[var(--radius-md)] border border-[var(--border)] hover:border-[var(--border-strong)] hover:bg-[var(--bg)] transition-all group">
                    <div className="w-8 h-8 bg-[var(--bg-secondary)] rounded-[var(--radius-sm)] flex items-center justify-center shrink-0">
                      <Icon size={15} className="text-[var(--text-muted)] group-hover:text-[var(--text-secondary)] transition-colors" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12.5px] font-medium text-[var(--text-primary)]">{label}</p>
                      <p className="text-[11px] text-[var(--text-muted)]">{sub}</p>
                    </div>
                    <ChevronRight size={13} className="text-[var(--text-muted)] shrink-0" />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Org card */}
          {organization && (
            <div className="bg-[var(--surface)] rounded-[var(--radius-lg)] border border-[var(--border)] shadow-[var(--shadow-sm)] p-4">
              <p className="text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-widest mb-3">
                Organisation
              </p>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 bg-[var(--cyan-10)] border border-[var(--cyan-20)] rounded-[var(--radius-md)] flex items-center justify-center shrink-0">
                  <span className="text-[var(--cyan-700)] font-bold text-[13px]">{organization.name[0]}</span>
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[var(--text-primary)]">{organization.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)] capitalize">Plan {organization.plan}</p>
                </div>
              </div>
              <Link to="/parametres">
                <Button variant="ghost" size="sm" className="w-full">
                  Gérer les paramètres
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
