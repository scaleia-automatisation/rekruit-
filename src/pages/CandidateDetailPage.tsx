import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, Mail, Phone, MapPin, Star, CheckCircle, XCircle, CalendarPlus, Trash2 } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

type CandidateStatus = 'new' | 'analyzing' | 'analyzed' | 'shortlisted' | 'interview_1' | 'interview_2' | 'interview_3' | 'offer' | 'hired' | 'rejected' | 'pool'

interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  location: string | null
  status: CandidateStatus
  score_global: number | null
  score_skills: number | null
  score_experience: number | null
  score_education: number | null
  progression: number | null
  recommendation: string | null
  ai_summary: string | null
  ai_strengths: string | null
  ai_weaknesses: string | null
  cv_text: string | null
  job_offer_id: string | null
  job_offer?: { title: string; company: string } | null
}

const statusConfig: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple' }> = {
  new: { label: 'Nouveau', variant: 'gray' },
  analyzing: { label: 'Analyse en cours', variant: 'blue' },
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

const pipeline: CandidateStatus[] = ['new', 'analyzed', 'shortlisted', 'interview_1', 'interview_2', 'interview_3', 'hired']

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      if (!id) return
      const { data } = await supabase
        .from('candidates')
        .select('*, job_offer:job_offers(title, company)')
        .eq('id', id)
        .single()
      setCandidate(data as any)
      setLoading(false)
    }
    fetch()
  }, [id])

  const updateStatus = async (status: CandidateStatus) => {
    if (!candidate) return
    setStatusLoading(true)
    const { data } = await supabase.from('candidates').update({ status }).eq('id', candidate.id).select().single()
    if (data) setCandidate(c => c ? { ...c, status: data.status } : c)
    setStatusLoading(false)
  }

  const handleDelete = async () => {
    if (!candidate || !window.confirm('Supprimer ce candidat ?')) return
    await supabase.from('candidates').delete().eq('id', candidate.id)
    navigate('/candidats')
  }

  const scoreColor = (s: number) => s >= 75 ? 'text-green-600' : s >= 50 ? 'text-orange-500' : 'text-red-500'
  const scoreBg = (s: number) => s >= 75 ? 'bg-green-500' : s >= 50 ? 'bg-orange-500' : 'bg-red-500'

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse" />
        <div className="h-64 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    )
  }

  if (!candidate) return (
    <div className="p-8 text-center">
      <p className="text-slate-500">Candidat introuvable.</p>
      <Link to="/candidats" className="text-blue-600 hover:underline text-sm mt-2 block">← Retour</Link>
    </div>
  )

  const st = statusConfig[candidate.status] || { label: candidate.status, variant: 'gray' as const }
  const currentPipelineStep = pipeline.indexOf(candidate.status as CandidateStatus)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/candidats" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Retour
        </Link>
        <button onClick={handleDelete} className="inline-flex items-center gap-2 text-xs text-red-500 hover:text-red-700">
          <Trash2 size={14} /> Supprimer
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-start gap-4">
          <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
            <span className="text-blue-700 text-2xl font-bold">
              {candidate.first_name[0]}{candidate.last_name[0]}
            </span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">
                {candidate.first_name} {candidate.last_name}
              </h1>
              <Badge variant={st.variant} size="md">{st.label}</Badge>
            </div>
            {candidate.job_offer && (
              <p className="text-slate-500 mb-3">{candidate.job_offer.title} — {candidate.job_offer.company}</p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              {candidate.email && <a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 hover:text-blue-600"><Mail size={14} />{candidate.email}</a>}
              {candidate.phone && <a href={`tel:${candidate.phone}`} className="flex items-center gap-1.5 hover:text-blue-600"><Phone size={14} />{candidate.phone}</a>}
              {candidate.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{candidate.location}</span>}
            </div>
          </div>
          {candidate.score_global !== null && (
            <div className="text-center bg-slate-50 rounded-2xl p-4 min-w-[80px]">
              <p className={`text-4xl font-extrabold ${scoreColor(candidate.score_global)}`}>
                {candidate.score_global}
              </p>
              <p className="text-xs text-slate-400 mt-1">Score IA</p>
            </div>
          )}
        </div>
      </div>

      {/* Pipeline progress */}
      <Card className="mb-6">
        <h2 className="font-bold text-slate-900 mb-4">Progression</h2>
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {pipeline.map((s, i) => {
            const sc = statusConfig[s]
            const done = i < currentPipelineStep
            const active = i === currentPipelineStep
            return (
              <div key={s} className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => updateStatus(s)}
                  disabled={statusLoading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    active ? 'bg-blue-600 text-white' :
                    done ? 'bg-green-100 text-green-700' :
                    'bg-slate-100 text-slate-500 hover:bg-slate-200'
                  }`}
                >
                  {sc.label}
                </button>
                {i < pipeline.length - 1 && (
                  <div className={`w-4 h-0.5 ${done ? 'bg-green-400' : 'bg-slate-200'}`} />
                )}
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex gap-3">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateStatus('rejected')}
            disabled={statusLoading || candidate.status === 'rejected'}
          >
            <XCircle size={15} className="text-red-500" />
            Refuser
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => updateStatus('shortlisted')}
            disabled={statusLoading || candidate.status === 'shortlisted'}
          >
            <CheckCircle size={15} className="text-green-500" />
            Retenir
          </Button>
          <Button
            size="sm"
            onClick={() => updateStatus('interview_1')}
            disabled={statusLoading}
          >
            <CalendarPlus size={15} />
            Proposer entretien
          </Button>
        </div>
      </Card>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* AI Analysis */}
        {candidate.ai_summary && (
          <Card>
            <h2 className="font-bold text-slate-900 mb-4">Analyse IA</h2>
            <p className="text-sm text-slate-600 leading-relaxed mb-5">{candidate.ai_summary}</p>
            {candidate.score_skills !== null && (
              <div className="space-y-3">
                {[
                  { label: 'Compétences', score: candidate.score_skills },
                  { label: 'Expérience', score: candidate.score_experience },
                  { label: 'Formation', score: candidate.score_education },
                ].map(({ label, score }) => score !== null && (
                  <div key={label}>
                    <div className="flex justify-between text-xs text-slate-600 mb-1">
                      <span>{label}</span>
                      <span className={`font-bold ${scoreColor(score)}`}>{score}/100</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2">
                      <div className={`h-2 rounded-full ${scoreBg(score)}`} style={{ width: `${score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        {/* Strengths & Weaknesses */}
        {(candidate.ai_strengths || candidate.ai_weaknesses) && (
          <div className="flex flex-col gap-4">
            {candidate.ai_strengths && (
              <Card>
                <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle size={16} /> Points forts
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{candidate.ai_strengths}</p>
              </Card>
            )}
            {candidate.ai_weaknesses && (
              <Card>
                <h3 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                  <Star size={16} /> Points à améliorer
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">{candidate.ai_weaknesses}</p>
              </Card>
            )}
          </div>
        )}

        {/* CV text */}
        {candidate.cv_text && (
          <div className="lg:col-span-2">
            <Card>
              <h2 className="font-bold text-slate-900 mb-4">CV</h2>
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed max-h-64 overflow-y-auto">
                {candidate.cv_text}
              </pre>
            </Card>
          </div>
        )}

        {/* Empty state for AI */}
        {!candidate.ai_summary && candidate.status === 'new' && (
          <div className="lg:col-span-2">
            <Card>
              <div className="text-center py-6">
                <div className="text-4xl mb-3">🤖</div>
                <h3 className="font-bold text-slate-900 mb-2">Analyse IA non lancée</h3>
                <p className="text-sm text-slate-500">
                  L'analyse IA sera disponible dès que vous configurez votre intégration LLM.
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
