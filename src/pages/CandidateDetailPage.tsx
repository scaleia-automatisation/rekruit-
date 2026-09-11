import { useEffect, useState, useRef } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  ArrowLeft, Mail, Phone, MapPin, Star, CheckCircle, XCircle, CalendarPlus, Trash2,
  Wand2, Loader2, Send, Upload, Save
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateMessage } from '../lib/ai'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { AIAnalysisPanel } from '../components/ai/AIAnalysisPanel'
import { ScoreDisplay } from '../components/ai/ScoreDisplay'
import { SlotPicker, type Slot } from '../components/interviews/SlotPicker'
import { MessageEditor } from '../components/interviews/MessageEditor'

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
  score_job_match: number | null
  score_letter: number | null
  progression: number | null
  recommendation: string | null
  ai_summary: string | null
  ai_strengths: string | null
  ai_weaknesses: string | null
  missing_skills: string | null
  cv_text: string | null
  cv_file_url: string | null
  cover_letter: string | null
  job_offer_id: string | null
  job_offer?: { id: string; title: string; company: string; description?: string; skills?: string; experience?: string } | null
}

interface Interview {
  id: string
  interview_number: number
  status: string
  scheduled_at: string | null
  score: number | null
  ai_summary: string | null
  recommendation: string | null
  slots?: { id: string; slot_datetime: string | null; label: string | null; status: string | null }[]
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

type Tab = 'info' | 'ai' | 'cv' | 'entretiens' | 'decision'

export function CandidateDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [candidate, setCandidate] = useState<Candidate | null>(null)
  const [interviews, setInterviews] = useState<Interview[]>([])
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(false)
  const [tab, setTab] = useState<Tab>('info')

  // CV / cover letter state
  const [coverLetter, setCoverLetter] = useState('')
  const [savingCover, setSavingCover] = useState(false)
  const [cvUploading, setCvUploading] = useState(false)
  const { profile } = useAuth()

  // Interview scheduling state
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleFor, setScheduleFor] = useState<1 | 2 | 3>(1)
  const [slots, setSlots] = useState<Slot[]>([])
  const [msgSubject, setMsgSubject] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [genMsg, setGenMsg] = useState(false)
  const [scheduleSaving, setScheduleSaving] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!id) return
      const [{ data: c }, { data: iv }] = await Promise.all([
        supabase.from('candidates').select('*, job_offer:job_offers(id, title, company, description, skills, experience)').eq('id', id).single(),
        supabase.from('interviews').select('*, slots:interview_slots(*)').eq('candidate_id', id).order('interview_number'),
      ])
      setCandidate(c as Candidate)
      setCoverLetter((c as Candidate)?.cover_letter || '')
      setInterviews((iv || []) as Interview[])
      setLoading(false)
    }
    load()
  }, [id])

  const updateStatus = async (status: CandidateStatus) => {
    if (!candidate) return
    setStatusLoading(true)
    const progression = { new: 0, analyzing: 10, analyzed: 20, shortlisted: 30, interview_1: 40, interview_2: 60, interview_3: 80, offer: 90, hired: 100, rejected: 0, pool: 20 }[status] || 0
    const { data } = await supabase.from('candidates').update({ status, progression }).eq('id', candidate.id).select().single()
    if (data) setCandidate(c => c ? { ...c, status: data.status, progression: data.progression } : c)
    setStatusLoading(false)
  }

  const handleDelete = async () => {
    if (!candidate || !window.confirm('Supprimer ce candidat ?')) return
    await supabase.from('candidates').delete().eq('id', candidate.id)
    navigate('/candidats')
  }

  const saveCoverLetter = async () => {
    if (!candidate) return
    setSavingCover(true)
    await supabase.from('candidates').update({ cover_letter: coverLetter || null }).eq('id', candidate.id)
    setCandidate(c => c ? { ...c, cover_letter: coverLetter || null } : c)
    setSavingCover(false)
  }

  const uploadCv = async (file: File) => {
    if (!candidate || !profile?.organization_id) return
    setCvUploading(true)
    const ext = file.name.split('.').pop()
    const path = `${profile.organization_id}/${Date.now()}.${ext}`
    const { error: upErr } = await supabase.storage.from('cvs').upload(path, file)
    if (!upErr) {
      const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(path)
      const cvUrl = urlData.publicUrl
      let cvText: string | null = null
      if (file.type !== 'application/pdf') cvText = await file.text()
      await supabase.from('candidates').update({ cv_file_url: cvUrl, ...(cvText ? { cv_text: cvText } : {}) }).eq('id', candidate.id)
      setCandidate(c => c ? { ...c, cv_file_url: cvUrl, ...(cvText ? { cv_text: cvText } : {}) } : c)
    }
    setCvUploading(false)
  }

  const openSchedule = async (num: 1 | 2 | 3) => {
    setScheduleFor(num)
    setSlots([])
    setMsgSubject('')
    setMsgBody('')
    setShowSchedule(true)
  }

  const generateMsg = async () => {
    if (!candidate?.job_offer || slots.length === 0) return
    setGenMsg(true)
    try {
      const origin = window.location.origin
      const link = `${origin}/c/[TOKEN]`
      const result = await generateMessage({
        type: 'interview_invitation',
        candidate: { first_name: candidate.first_name, last_name: candidate.last_name },
        job_offer: { title: candidate.job_offer.title, company: candidate.job_offer.company },
        slots,
        interview_link: link,
      })
      setMsgSubject(result.subject)
      setMsgBody(result.message)
    } finally {
      setGenMsg(false)
    }
  }

  const saveSchedule = async () => {
    if (!candidate || slots.length === 0) return
    setScheduleSaving(true)
    const { data: interview } = await supabase.from('interviews').insert({
      candidate_id: candidate.id,
      job_offer_id: candidate.job_offer_id,
      organization_id: (candidate as unknown as { organization_id: string }).organization_id,
      interview_number: scheduleFor,
      status: 'pending',
    }).select().single()

    if (interview) {
      await supabase.from('interview_slots').insert(
        slots.map(s => ({ interview_id: interview.id, slot_datetime: s.datetime, label: s.label, status: 'pending' }))
      )
      const { data: token } = await supabase.from('interview_tokens').insert({
        interview_id: interview.id,
        status: 'pending',
      }).select().single()

      await updateStatus(`interview_${scheduleFor}` as CandidateStatus)
      if (token) {
        await supabase.from('messages').insert({
          candidate_id: candidate.id,
          organization_id: (candidate as unknown as { organization_id: string }).organization_id,
          type: 'email',
          subject: msgSubject,
          body: msgBody,
          status: 'sent',
        }).then(() => {})
      }

      const { data: ivList } = await supabase.from('interviews').select('*, slots:interview_slots(*)').eq('candidate_id', candidate.id).order('interview_number')
      setInterviews((ivList || []) as Interview[])
    }
    setScheduleSaving(false)
    setShowSchedule(false)
  }

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
  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Infos' },
    { id: 'ai', label: 'Analyse IA' },
    { id: 'cv', label: 'CV' },
    { id: 'entretiens', label: `Entretiens (${interviews.length})` },
    { id: 'decision', label: 'Décision' },
  ]

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
            <span className="text-blue-700 text-2xl font-bold">{candidate.first_name[0]}{candidate.last_name[0]}</span>
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{candidate.first_name} {candidate.last_name}</h1>
              <Badge variant={st.variant} size="md">{st.label}</Badge>
            </div>
            {candidate.job_offer && (
              <Link to={`/offres/${candidate.job_offer.id}`} className="text-slate-500 hover:text-blue-600 mb-3 block text-sm">
                {candidate.job_offer.title} — {candidate.job_offer.company}
              </Link>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              {candidate.email && <a href={`mailto:${candidate.email}`} className="flex items-center gap-1.5 hover:text-blue-600"><Mail size={14} />{candidate.email}</a>}
              {candidate.phone && <a href={`tel:${candidate.phone}`} className="flex items-center gap-1.5 hover:text-blue-600"><Phone size={14} />{candidate.phone}</a>}
              {candidate.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{candidate.location}</span>}
            </div>
            {candidate.progression !== null && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                  <span>Progression</span>
                  <span className="font-medium">{candidate.progression}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-1.5">
                  <div className="h-1.5 rounded-full bg-blue-500 transition-all" style={{ width: `${candidate.progression}%` }} />
                </div>
              </div>
            )}
          </div>
          {candidate.score_global !== null && (
            <ScoreDisplay score={candidate.score_global} />
          )}
        </div>
      </div>

      {/* Pipeline progress */}
      <Card className="mb-6">
        <h2 className="font-bold text-slate-900 mb-4">Pipeline</h2>
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
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${active ? 'bg-blue-600 text-white' : done ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                >
                  {sc.label}
                </button>
                {i < pipeline.length - 1 && <div className={`w-4 h-0.5 ${done ? 'bg-green-400' : 'bg-slate-200'}`} />}
              </div>
            )
          })}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          <Button size="sm" variant="secondary" onClick={() => updateStatus('rejected')} disabled={statusLoading || candidate.status === 'rejected'}>
            <XCircle size={15} className="text-red-500" /> Refuser
          </Button>
          <Button size="sm" variant="secondary" onClick={() => updateStatus('shortlisted')} disabled={statusLoading || candidate.status === 'shortlisted'}>
            <CheckCircle size={15} className="text-green-500" /> Retenir
          </Button>
          <Button size="sm" onClick={() => openSchedule(interviews.length < 1 ? 1 : interviews.length < 2 ? 2 : 3)} disabled={statusLoading}>
            <CalendarPlus size={15} /> Planifier entretien
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <div className="border-b border-slate-200 mb-6 overflow-x-auto">
        <div className="flex gap-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
                tab === t.id ? 'border-blue-600 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      {tab === 'info' && (
        <div className="grid sm:grid-cols-2 gap-4">
          {candidate.job_offer && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-3">Poste ciblé</h3>
              <p className="font-medium text-slate-700">{candidate.job_offer.title}</p>
              <p className="text-sm text-slate-500">{candidate.job_offer.company}</p>
            </Card>
          )}
          <Card>
            <h3 className="font-bold text-slate-900 mb-3">Statut du recrutement</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Statut actuel</span>
                <Badge variant={st.variant}>{st.label}</Badge>
              </div>
              {candidate.progression !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Progression</span>
                  <span className="font-medium text-slate-900">{candidate.progression}%</span>
                </div>
              )}
              {candidate.recommendation && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Recommandation IA</span>
                  <span className={`font-bold text-sm ${candidate.recommendation === 'GO' ? 'text-green-600' : candidate.recommendation === 'MAYBE' ? 'text-orange-500' : 'text-red-500'}`}>
                    {candidate.recommendation === 'GO' ? '🟢 GO' : candidate.recommendation === 'MAYBE' ? '🟡 MAYBE' : '🔴 NO'}
                  </span>
                </div>
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === 'ai' && (
        candidate.ai_summary ? (
          <AIAnalysisPanel
            ai_summary={candidate.ai_summary}
            ai_strengths={candidate.ai_strengths}
            ai_weaknesses={candidate.ai_weaknesses}
            missing_skills={candidate.missing_skills}
            recommendation={candidate.recommendation}
            score_skills={candidate.score_skills}
            score_experience={candidate.score_experience}
            score_education={candidate.score_education}
            score_job_match={candidate.score_job_match}
            score_letter={candidate.score_letter}
          />
        ) : (
          <Card>
            <div className="text-center py-8">
              <div className="text-4xl mb-3">🤖</div>
              <h3 className="font-bold text-slate-900 mb-2">Analyse IA non disponible</h3>
              <p className="text-sm text-slate-500">Importez un CV et lancez l'analyse IA lors de l'ajout du candidat.</p>
            </div>
          </Card>
        )
      )}

      {tab === 'cv' && (
        <div className="space-y-4">
          {/* CV section */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">CV</h2>
              <div className="flex items-center gap-3">
                {candidate.cv_file_url && (
                  <a href={candidate.cv_file_url} target="_blank" rel="noreferrer" className="text-sm text-blue-600 hover:underline">
                    Télécharger
                  </a>
                )}
                <label className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 transition-all ${cvUploading ? 'opacity-50 pointer-events-none' : ''}`}>
                  {cvUploading ? <Loader2 size={13} className="animate-spin" /> : <Upload size={13} />}
                  {cvUploading ? 'Upload...' : 'Remplacer'}
                  <input type="file" accept=".pdf,.txt,.doc,.docx" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) uploadCv(f) }} />
                </label>
              </div>
            </div>
            {candidate.cv_text ? (
              <pre className="text-xs text-slate-600 whitespace-pre-wrap font-mono leading-relaxed max-h-96 overflow-y-auto">
                {candidate.cv_text}
              </pre>
            ) : candidate.cv_file_url ? (
              <p className="text-sm text-slate-500 py-4 text-center">CV en PDF — <a href={candidate.cv_file_url} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">ouvrir</a></p>
            ) : (
              <p className="text-sm text-slate-400 py-4 text-center">Aucun CV enregistré.</p>
            )}
          </Card>

          {/* Cover letter section */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-slate-900">Lettre de motivation</h2>
              <div className="flex items-center gap-2">
                <label className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 transition-all">
                  <Upload size={13} /> Importer fichier
                  <input type="file" accept=".txt,.pdf" className="hidden" onChange={async e => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    const text = await f.text()
                    setCoverLetter(text)
                  }} />
                </label>
                <Button size="sm" onClick={saveCoverLetter} loading={savingCover}>
                  <Save size={13} /> Enregistrer
                </Button>
              </div>
            </div>
            <textarea
              value={coverLetter}
              onChange={e => setCoverLetter(e.target.value)}
              placeholder={'# Lettre de motivation\n\nMadame, Monsieur,\n\n...'}
              rows={12}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
            />
            <p className="text-xs text-slate-400 mt-2">Markdown supporté — titres (#), gras (**), listes (-)</p>
          </Card>
        </div>
      )}

      {tab === 'entretiens' && (
        <div className="space-y-4">
          {interviews.length === 0 ? (
            <Card>
              <div className="text-center py-8">
                <CalendarPlus size={36} className="mx-auto text-slate-200 mb-3" />
                <h3 className="font-bold text-slate-900 mb-2">Aucun entretien planifié</h3>
                <Button size="sm" onClick={() => openSchedule(1)}>
                  <CalendarPlus size={15} /> Planifier le 1er entretien
                </Button>
              </div>
            </Card>
          ) : (
            interviews.map(iv => (
              <Card key={iv.id}>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-bold text-slate-900">Entretien {iv.interview_number}</h3>
                  <Badge variant={iv.status === 'scheduled' ? 'green' : iv.status === 'completed' ? 'blue' : 'gray'}>
                    {iv.status === 'scheduled' ? 'Planifié' : iv.status === 'completed' ? 'Terminé' : 'En attente'}
                  </Badge>
                </div>
                {iv.slots && iv.slots.length > 0 && (
                  <div className="space-y-2 mb-3">
                    {iv.slots.map(s => (
                      <div key={s.id} className={`text-sm px-3 py-2 rounded-lg ${s.status === 'confirmed' ? 'bg-green-50 text-green-700 font-medium' : 'bg-slate-50 text-slate-600'}`}>
                        {s.label || s.slot_datetime}
                        {s.status === 'confirmed' && ' ✓'}
                      </div>
                    ))}
                  </div>
                )}
                {iv.score !== null && (
                  <div className="flex items-center gap-4">
                    <ScoreDisplay score={iv.score} label="Score entretien" size="sm" />
                    {iv.recommendation && (
                      <span className={`font-bold text-sm ${iv.recommendation === 'GO' ? 'text-green-600' : iv.recommendation === 'MAYBE' ? 'text-orange-500' : 'text-red-500'}`}>
                        {iv.recommendation}
                      </span>
                    )}
                  </div>
                )}
                {iv.ai_summary && <p className="text-sm text-slate-600 mt-3">{iv.ai_summary}</p>}
              </Card>
            ))
          )}
          {interviews.length > 0 && interviews.length < 3 && (
            <Button size="sm" variant="secondary" onClick={() => openSchedule((interviews.length + 1) as 1 | 2 | 3)}>
              <CalendarPlus size={15} /> Planifier entretien {interviews.length + 1}
            </Button>
          )}
        </div>
      )}

      {tab === 'decision' && (
        <div className="space-y-4">
          <Card>
            <h2 className="font-bold text-slate-900 mb-4">Décision finale</h2>
            {interviews.length > 0 && (
              <div className="mb-6">
                <p className="text-sm text-slate-500 mb-3">Scores des entretiens</p>
                <div className="flex gap-3">
                  {interviews.map(iv => iv.score !== null && (
                    <div key={iv.id} className="text-center bg-slate-50 rounded-xl p-3">
                      <p className={`text-xl font-bold ${iv.score >= 75 ? 'text-green-600' : iv.score >= 50 ? 'text-orange-500' : 'text-red-500'}`}>{iv.score}</p>
                      <p className="text-xs text-slate-400">E{iv.interview_number}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="grid sm:grid-cols-3 gap-3">
              <Button onClick={() => updateStatus('hired')} disabled={statusLoading || candidate.status === 'hired'}
                className="bg-green-600 hover:bg-green-700 text-white py-3 flex flex-col items-center gap-1 h-auto">
                <CheckCircle size={20} />
                <span className="font-bold">Recruter</span>
              </Button>
              <Button variant="secondary" onClick={() => updateStatus('pool')} disabled={statusLoading || candidate.status === 'pool'}
                className="py-3 flex flex-col items-center gap-1 h-auto">
                <Star size={20} className="text-orange-500" />
                <span className="font-bold">Vivier</span>
              </Button>
              <Button variant="danger" onClick={() => updateStatus('rejected')} disabled={statusLoading || candidate.status === 'rejected'}
                className="py-3 flex flex-col items-center gap-1 h-auto">
                <XCircle size={20} />
                <span className="font-bold">Refuser</span>
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Schedule interview modal */}
      {showSchedule && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-slate-900">Planifier entretien {scheduleFor}</h2>
                <button onClick={() => setShowSchedule(false)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">Créneaux proposés</h3>
                <SlotPicker slots={slots} onChange={setSlots} />
              </div>

              {slots.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-slate-900">Message au candidat</h3>
                    <Button size="sm" variant="secondary" onClick={generateMsg} disabled={genMsg || !candidate.job_offer}>
                      {genMsg ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
                      Générer
                    </Button>
                  </div>
                  {msgBody ? (
                    <MessageEditor
                      subject={msgSubject}
                      message={msgBody}
                      onSubjectChange={setMsgSubject}
                      onMessageChange={setMsgBody}
                      onGenerate={generateMsg}
                      generating={genMsg}
                    />
                  ) : (
                    <p className="text-sm text-slate-400">Cliquez sur "Générer" pour créer un message personnalisé</p>
                  )}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <Button onClick={saveSchedule} loading={scheduleSaving} disabled={slots.length === 0}>
                  <Send size={15} /> Envoyer l'invitation
                </Button>
                <Button variant="secondary" onClick={() => setShowSchedule(false)}>Annuler</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
