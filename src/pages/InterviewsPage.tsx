import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { CalendarDays, Clock, User, ChevronRight } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Badge } from '../components/ui/Badge'

interface Interview {
  id: string
  candidate_id: string
  number: number
  scheduled_at: string | null
  status: string
  score: number | null
  candidates: { first_name: string; last_name: string } | null
}

const statusConfig: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' | 'gray' }> = {
  pending: { label: 'À planifier', variant: 'gray' },
  scheduled: { label: 'Planifié', variant: 'blue' },
  completed: { label: 'Terminé', variant: 'green' },
  cancelled: { label: 'Annulé', variant: 'red' },
  no_show: { label: 'Absent', variant: 'orange' },
}

export function InterviewsPage() {
  const { profile } = useAuth()
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetch = async () => {
      if (!profile?.organization_id) return
      const { data } = await supabase
        .from('interviews')
        .select('*, candidates(first_name, last_name)')
        .eq('organization_id', profile.organization_id)
        .order('scheduled_at', { ascending: true, nullsFirst: false })
      setInterviews((data || []) as any)
      setLoading(false)
    }
    fetch()
  }, [profile?.organization_id])

  const upcoming = interviews.filter(i => i.status === 'scheduled' && i.scheduled_at && new Date(i.scheduled_at) >= new Date())
  const pending = interviews.filter(i => i.status === 'pending')
  const past = interviews.filter(i => i.status === 'completed' || i.status === 'cancelled' || i.status === 'no_show' || (i.status === 'scheduled' && i.scheduled_at && new Date(i.scheduled_at) < new Date()))

  const formatDate = (dt: string) => {
    const d = new Date(dt)
    return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })
  }

  const InterviewCard = ({ interview }: { interview: Interview }) => {
    const st = statusConfig[interview.status] || { label: interview.status, variant: 'gray' as const }
    const candidate = interview.candidates
    return (
      <Link to={`/candidats/${interview.candidate_id}`}>
        <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 transition-all flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
            <User size={18} className="text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="font-semibold text-slate-900">
                {candidate ? `${candidate.first_name} ${candidate.last_name}` : 'Candidat'}
              </p>
              <Badge variant={st.variant}>{st.label}</Badge>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span>Entretien {interview.number}</span>
              {interview.scheduled_at && (
                <span className="flex items-center gap-1">
                  <Clock size={11} />
                  {formatDate(interview.scheduled_at)}
                </span>
              )}
            </div>
          </div>
          {interview.score !== null && (
            <div className="text-center shrink-0">
              <p className={`text-xl font-bold ${interview.score >= 75 ? 'text-green-600' : interview.score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                {interview.score}
              </p>
              <p className="text-xs text-slate-400">/100</p>
            </div>
          )}
          <ChevronRight size={16} className="text-slate-300 shrink-0" />
        </div>
      </Link>
    )
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse" />
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Entretiens</h1>
        <p className="text-slate-500 mt-1">{interviews.length} entretien{interviews.length !== 1 ? 's' : ''} au total</p>
      </div>

      {interviews.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <CalendarDays size={48} className="mx-auto text-slate-200 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">Aucun entretien planifié</h2>
          <p className="text-slate-500">
            Sélectionnez un candidat et proposez-lui un entretien.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">À venir</h2>
              <div className="space-y-2">
                {upcoming.map(i => <InterviewCard key={i.id} interview={i} />)}
              </div>
            </section>
          )}
          {pending.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">À planifier</h2>
              <div className="space-y-2">
                {pending.map(i => <InterviewCard key={i.id} interview={i} />)}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">Passés</h2>
              <div className="space-y-2">
                {past.map(i => <InterviewCard key={i.id} interview={i} />)}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
