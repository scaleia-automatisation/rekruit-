import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  ArrowLeft, Mail, Phone, MapPin, Star, CheckCircle, XCircle, CalendarPlus, Trash2,
  Wand2, Loader2, Send, Upload, Save, MailCheck, History, MessageSquare, UserCheck, CheckSquare,
  Users, ChevronDown, ChevronUp, ClipboardList, Mic
} from 'lucide-react'
import { supabase } from '../lib/supabase'
import { generateMessage, generateInterviewQuestions, analyzeInterview, transcribeAudio } from '../lib/ai'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'
import { AIAnalysisPanel } from '../components/ai/AIAnalysisPanel'
import { ScoreDisplay } from '../components/ai/ScoreDisplay'
import { SlotPicker, type Slot } from '../components/interviews/SlotPicker'
import { MessageEditor } from '../components/interviews/MessageEditor'

type CandidateStatus = 'new' | 'analyzing' | 'analyzed' | 'shortlisted' | 'interview_1' | 'interview_2' | 'interview_3' | 'offer' | 'hired' | 'rejected' | 'pool' | 'unavailable' | 'not_looking'

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
  job_offer?: { id: string; title: string; company: string; description?: string; skills?: string; experience?: string; interview_rounds?: number } | null
}

interface OrgMember {
  id: string
  first_name: string
  last_name: string
  job_title: string | null
}

interface InterviewQuestion {
  question: string
  category: string
  tip: string
}

interface Interview {
  id: string
  interview_number: number
  status: string
  scheduled_at: string | null
  score: number | null
  ai_summary: string | null
  recommendation: string | null
  interview_type: 'visio' | 'presentiel' | 'phone' | null
  interview_duration: number | null
  interviewers: OrgMember[] | null
  questions: InterviewQuestion[] | null
  recruiter_notes: string | null
  audio_transcript: string | null
  transcript_labelled: string | null
  score_communication: number | null
  score_motivation: number | null
  score_competences: number | null
  score_pertinence: number | null
  score_coherence: number | null
  score_questions_candidat: number | null
  ai_strengths: string | null
  ai_concerns: string | null
  slots?: { id: string; slot_datetime: string | null; label: string | null; status: string | null }[]
}

const interviewTypeConfig: Record<string, { label: string; icon: string }> = {
  visio:       { label: 'Visioconférence', icon: '🎥' },
  presentiel:  { label: 'En présentiel',   icon: '🏢' },
  phone:       { label: 'Téléphone',       icon: '📞' },
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
  unavailable: { label: 'Indisponible', variant: 'orange' },
  not_looking: { label: 'Ne recherche plus', variant: 'red' },
}

function buildPipeline(rounds: number): CandidateStatus[] {
  return ['new', 'analyzed', 'shortlisted',
    ...Array.from({ length: rounds }, (_, i) => `interview_${i + 1}` as CandidateStatus),
    'hired',
  ]
}

type Tab = 'info' | 'ai' | 'cv' | 'entretiens' | 'decision' | 'historique'

interface HistoryItem {
  id: string
  kind: 'email_out' | 'email_in' | 'decision'
  date: string
  title: string
  content?: string
}

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
  const { profile, user } = useAuth()

  // Interview scheduling state
  const [showSchedule, setShowSchedule] = useState(false)
  const [scheduleFor, setScheduleFor] = useState<1 | 2 | 3>(1)
  const [interviewType, setInterviewType] = useState<'visio' | 'presentiel' | 'phone'>('visio')
  const [interviewDuration, setInterviewDuration] = useState<number>(45)
  const [slots, setSlots] = useState<Slot[]>([])
  const [msgSubject, setMsgSubject] = useState('')
  const [msgBody, setMsgBody] = useState('')
  const [genMsg, setGenMsg] = useState(false)
  const [scheduleSaving, setScheduleSaving] = useState(false)
  const [scheduleSuccess, setScheduleSuccess] = useState(false)
  const [emailToast, setEmailToast] = useState<string | null>(null)
  const [history, setHistory] = useState<HistoryItem[]>([])
  const [historyLoading, setHistoryLoading] = useState(false)

  // Org members & interviewers
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([])
  const [selectedInterviewers, setSelectedInterviewers] = useState<OrgMember[]>([])

  // Questionnaire state
  const [generatingQuestions, setGeneratingQuestions] = useState<string | null>(null)
  const [expandedQuestions, setExpandedQuestions] = useState<Set<string>>(new Set())

  // Post-interview state
  const [recruiterNotes, setRecruiterNotes] = useState<Record<string, string>>({})
  const [savingNotes, setSavingNotes] = useState<string | null>(null)
  const [notesSavedId, setNotesSavedId] = useState<string | null>(null)
  const [audioTranscripts, setAudioTranscripts] = useState<Record<string, string>>({})
  const [savingTranscript, setSavingTranscript] = useState<string | null>(null)
  const [transcriptSavedId, setTranscriptSavedId] = useState<string | null>(null)
  const [transcribingAudio, setTranscribingAudio] = useState<string | null>(null)
  const [analyzingInterview, setAnalyzingInterview] = useState<string | null>(null)

  // Post-decision email modal (hired / rejection from interview)
  const [postDecisionModal, setPostDecisionModal] = useState<{
    type: 'hired' | 'rejection'
    interviewId: string
    interviewNumber: number
  } | null>(null)
  const [postMsgSubject, setPostMsgSubject] = useState('')
  const [postMsgBody, setPostMsgBody] = useState('')
  const [genPostMsg, setGenPostMsg] = useState(false)
  const [sendingPostMsg, setSendingPostMsg] = useState(false)
  const [postMsgSent, setPostMsgSent] = useState(false)

  // Status email modal (shortlist / offer from pipeline actions)
  const [statusEmailModal, setStatusEmailModal] = useState<{
    type: 'shortlist' | 'offer'
    targetStatus: 'shortlisted' | 'offer'
  } | null>(null)
  const [statusMsgSubject, setStatusMsgSubject] = useState('')
  const [statusMsgBody, setStatusMsgBody] = useState('')
  const [genStatusMsg, setGenStatusMsg] = useState(false)
  const [sendingStatusMsg, setSendingStatusMsg] = useState(false)
  const [statusMsgSent, setStatusMsgSent] = useState(false)

  const loadHistory = async () => {
    if (!candidate) return
    setHistoryLoading(true)
    const [{ data: msgs }, { data: logs }] = await Promise.all([
      supabase.from('messages').select('id, subject, content, channel, status, sent_at, created_at').eq('candidate_id', candidate.id).order('created_at', { ascending: false }),
      supabase.from('audit_logs').select('id, action, metadata, created_at').eq('entity', 'candidate').eq('entity_id', candidate.id).order('created_at', { ascending: false }),
    ])
    const items: HistoryItem[] = [
      ...(msgs || []).map(m => ({
        id: m.id,
        kind: (m.channel === 'inbound' ? 'email_in' : 'email_out') as HistoryItem['kind'],
        date: m.sent_at || m.created_at,
        title: m.subject || (m.channel === 'inbound' ? 'Réponse du candidat' : 'Email envoyé'),
        content: m.content,
      })),
      ...(logs || []).map(l => ({
        id: l.id,
        kind: 'decision' as HistoryItem['kind'],
        date: l.created_at,
        title: `Statut → ${statusConfig[l.metadata?.to]?.label || l.metadata?.to || ''}`,
        content: l.metadata?.from ? `Précédent : ${statusConfig[l.metadata?.from]?.label || l.metadata?.from}` : undefined,
      })),
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    setHistory(items)
    setHistoryLoading(false)
  }

  useEffect(() => {
    const load = async () => {
      if (!id) return
      const [{ data: c }, { data: iv }] = await Promise.all([
        supabase.from('candidates').select('*, job_offer:job_offers(id, title, company, description, skills, experience, interview_rounds)').eq('id', id).single(),
        supabase.from('interviews').select('*, slots:interview_slots(*)').eq('candidate_id', id).order('interview_number'),
      ])
      setCandidate(c as Candidate)
      setCoverLetter((c as Candidate)?.cover_letter || '')
      setInterviews((iv || []) as Interview[])
      setLoading(false)
    }
    load()
  }, [id])

  useEffect(() => {
    const loadMembers = async () => {
      if (!profile?.organization_id) return
      const { data } = await supabase
        .from('organization_members')
        .select('id, first_name, last_name, job_title')
        .eq('organization_id', profile.organization_id)
        .order('first_name')
      setOrgMembers((data || []) as OrgMember[])
    }
    loadMembers()
  }, [profile?.organization_id])

  const updateStatus = async (status: CandidateStatus) => {
    if (!candidate) return
    setStatusLoading(true)
    const prevStatus = candidate.status
    const progression = { new: 0, analyzing: 10, analyzed: 20, shortlisted: 30, interview_1: 40, interview_2: 60, interview_3: 80, offer: 90, hired: 100, rejected: 0, pool: 20, unavailable: 0, not_looking: 0 }[status] || 0
    const { data } = await supabase.from('candidates').update({ status, progression }).eq('id', candidate.id).select().single()
    if (data) {
      setCandidate(c => c ? { ...c, status: data.status, progression: data.progression } : c)
      await supabase.from('audit_logs').insert({
        organization_id: profile?.organization_id,
        user_id: user?.id,
        action: 'status_changed',
        entity: 'candidate',
        entity_id: candidate.id,
        metadata: { from: prevStatus, to: status },
      })
    }
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

  useEffect(() => {
    if (tab === 'historique' && candidate && history.length === 0) loadHistory()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, candidate])

  const markInterviewDone = async (interviewId: string) => {
    await supabase.from('interviews').update({ status: 'completed' }).eq('id', interviewId)
    setInterviews(ivs => ivs.map(iv => iv.id === interviewId ? { ...iv, status: 'completed' } : iv))
  }

  const openSchedule = async (num: 1 | 2 | 3) => {
    setScheduleFor(num)
    setInterviewType('visio')
    setInterviewDuration(45)
    setSlots([])
    setMsgSubject('')
    setMsgBody('')
    setScheduleSuccess(false)
    setSelectedInterviewers([])
    setShowSchedule(true)
  }

  const toggleInterviewer = (m: OrgMember) => {
    setSelectedInterviewers(prev => {
      const has = prev.some(x => x.id === m.id)
      if (has) return prev.filter(x => x.id !== m.id)
      if (prev.length >= 2) return prev
      return [...prev, m]
    })
  }

  const generateQuestionnaire = async (iv: Interview) => {
    if (!candidate) return
    setGeneratingQuestions(iv.id)
    try {
      const result = await generateInterviewQuestions({
        candidate: { first_name: candidate.first_name, last_name: candidate.last_name },
        job_offer: candidate.job_offer
          ? { title: candidate.job_offer.title, company: candidate.job_offer.company, description: candidate.job_offer.description, skills: candidate.job_offer.skills, experience: candidate.job_offer.experience }
          : undefined,
        interview_number: iv.interview_number,
        interview_duration: iv.interview_duration ?? 45,
        cv_text: candidate.cv_text ?? undefined,
        ai_summary: candidate.ai_summary ?? undefined,
        ai_strengths: candidate.ai_strengths ?? undefined,
        ai_weaknesses: candidate.ai_weaknesses ?? undefined,
        missing_skills: candidate.missing_skills ?? undefined,
      })
      if (result.questions) {
        await supabase.from('interviews').update({ questions: result.questions }).eq('id', iv.id)
        setInterviews(ivs => ivs.map(x => x.id === iv.id ? { ...x, questions: result.questions } : x))
        setExpandedQuestions(prev => new Set([...prev, iv.id]))
      }
    } finally {
      setGeneratingQuestions(null)
    }
  }

  const saveNotes = async (ivId: string) => {
    setSavingNotes(ivId)
    const notes = recruiterNotes[ivId] ?? ''
    await supabase.from('interviews').update({ recruiter_notes: notes || null }).eq('id', ivId)
    setInterviews(ivs => ivs.map(x => x.id === ivId ? { ...x, recruiter_notes: notes || null } : x))
    setSavingNotes(null)
    setNotesSavedId(ivId)
    setTimeout(() => setNotesSavedId(null), 2500)
  }

  const saveTranscript = async (ivId: string) => {
    setSavingTranscript(ivId)
    const transcript = audioTranscripts[ivId] ?? ''
    await supabase.from('interviews').update({ audio_transcript: transcript || null }).eq('id', ivId)
    setInterviews(ivs => ivs.map(x => x.id === ivId ? { ...x, audio_transcript: transcript || null } : x))
    setSavingTranscript(null)
    setTranscriptSavedId(ivId)
    setTimeout(() => setTranscriptSavedId(null), 2500)
  }

  const handleAudioUpload = async (iv: Interview, file: File) => {
    setTranscribingAudio(iv.id)
    try {
      const { transcript, transcript_labelled } = await transcribeAudio(file)
      setAudioTranscripts(prev => ({ ...prev, [iv.id]: transcript }))
      await supabase.from('interviews').update({ audio_transcript: transcript, transcript_labelled: transcript_labelled || null }).eq('id', iv.id)
      setInterviews(ivs => ivs.map(x => x.id === iv.id ? { ...x, audio_transcript: transcript, transcript_labelled: transcript_labelled || null } : x))
    } catch (err) {
      alert(`Erreur de transcription : ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setTranscribingAudio(null)
    }
  }

  const analyzeInterviewWithAI = async (iv: Interview) => {
    if (!candidate) return
    setAnalyzingInterview(iv.id)
    try {
      const transcript = audioTranscripts[iv.id] ?? iv.audio_transcript ?? undefined
      const notes = recruiterNotes[iv.id] ?? iv.recruiter_notes ?? undefined
      const result = await analyzeInterview({
        transcript: transcript || undefined,
        transcript_labelled: iv.transcript_labelled || undefined,
        recruiter_notes: notes || undefined,
        candidate: { first_name: candidate.first_name, last_name: candidate.last_name },
        job_offer: candidate.job_offer ? { title: candidate.job_offer.title, company: candidate.job_offer.company } : undefined,
        interview_number: iv.interview_number,
      })
      const update = {
        score: result.score ?? null,
        ai_summary: result.summary ?? null,
        recommendation: result.recommendation ?? null,
        score_communication: result.score_communication ?? null,
        score_motivation: result.score_motivation ?? null,
        score_competences: result.score_competences ?? null,
        score_pertinence: result.score_pertinence ?? null,
        score_coherence: result.score_coherence ?? null,
        score_questions_candidat: result.score_questions_candidat ?? null,
        ai_strengths: result.strengths ?? null,
        ai_concerns: result.concerns ?? null,
      }
      await supabase.from('interviews').update(update).eq('id', iv.id)
      setInterviews(ivs => ivs.map(x => x.id === iv.id ? { ...x, ...update } : x))
    } catch (err) {
      alert(`Erreur d'analyse : ${err instanceof Error ? err.message : String(err)}`)
    } finally {
      setAnalyzingInterview(null)
    }
  }

  const saveDecision = async (iv: Interview, decision: 'GO' | 'MAYBE' | 'NO') => {
    await supabase.from('interviews').update({ recommendation: decision }).eq('id', iv.id)
    setInterviews(ivs => ivs.map(x => x.id === iv.id ? { ...x, recommendation: decision } : x))
  }

  const openPostDecisionModal = async (iv: Interview, type: 'hired' | 'rejection') => {
    if (!candidate) return
    setPostDecisionModal({ type, interviewId: iv.id, interviewNumber: iv.interview_number })
    setPostMsgSubject('')
    setPostMsgBody('')
    setPostMsgSent(false)
    setGenPostMsg(true)
    try {
      const result = await generateMessage({
        type,
        candidate: { first_name: candidate.first_name, last_name: candidate.last_name },
        job_offer: candidate.job_offer ? { title: candidate.job_offer.title, company: candidate.job_offer.company } : undefined,
      })
      setPostMsgSubject(result.subject)
      setPostMsgBody(result.message)
    } finally {
      setGenPostMsg(false)
    }
  }

  const sendPostMsg = async () => {
    if (!candidate?.email || !postMsgBody || !postDecisionModal) return
    const orgId = profile?.organization_id
    if (!orgId) return
    setSendingPostMsg(true)
    const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-interview-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({
        to: candidate.email,
        subject: postMsgSubject,
        body: postMsgBody,
        token_url: null,
        slots_data: [],
        from_name: candidate.job_offer?.company,
        reply_to: user?.email,
      }),
    })
    if (emailRes.ok) {
      await supabase.from('messages').insert({
        candidate_id: candidate.id,
        organization_id: orgId,
        type: 'email',
        subject: postMsgSubject,
        content: postMsgBody,
        channel: 'outbound',
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      if (postDecisionModal.type === 'hired') await updateStatus('hired')
      else await updateStatus('rejected')
      setEmailToast(candidate.email)
      setTimeout(() => setEmailToast(null), 4000)
      setPostMsgSent(true)
      setTimeout(() => { setPostMsgSent(false); setPostDecisionModal(null) }, 3000)
    } else {
      const err = await emailRes.json().catch(() => ({}))
      alert(`Erreur d'envoi : ${err.error || emailRes.statusText}`)
    }
    setSendingPostMsg(false)
  }

  const openStatusEmailModal = async (type: 'shortlist' | 'offer', targetStatus: 'shortlisted' | 'offer') => {
    if (!candidate) return
    setStatusEmailModal({ type, targetStatus })
    setStatusMsgSubject('')
    setStatusMsgBody('')
    setStatusMsgSent(false)
    setGenStatusMsg(true)
    try {
      const msgType = type === 'shortlist' ? 'shortlist' : 'offer'
      const result = await generateMessage({
        type: msgType,
        candidate: { first_name: candidate.first_name, last_name: candidate.last_name },
        job_offer: candidate.job_offer ? { title: candidate.job_offer.title, company: candidate.job_offer.company } : undefined,
      })
      setStatusMsgSubject(result.subject)
      setStatusMsgBody(result.message)
    } finally {
      setGenStatusMsg(false)
    }
  }

  const sendStatusMsg = async () => {
    if (!candidate?.email || !statusMsgBody || !statusEmailModal) return
    const orgId = profile?.organization_id
    if (!orgId) return
    setSendingStatusMsg(true)
    const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-interview-invitation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${SUPABASE_ANON_KEY}` },
      body: JSON.stringify({
        to: candidate.email,
        subject: statusMsgSubject,
        body: statusMsgBody,
        token_url: null,
        slots_data: [],
        from_name: candidate.job_offer?.company,
        reply_to: user?.email,
      }),
    })
    if (emailRes.ok) {
      await supabase.from('messages').insert({
        candidate_id: candidate.id,
        organization_id: orgId,
        type: 'email',
        subject: statusMsgSubject,
        content: statusMsgBody,
        channel: 'outbound',
        status: 'sent',
        sent_at: new Date().toISOString(),
      })
      await updateStatus(statusEmailModal.targetStatus)
      setEmailToast(candidate.email)
      setTimeout(() => setEmailToast(null), 4000)
      setStatusMsgSent(true)
      setTimeout(() => { setStatusMsgSent(false); setStatusEmailModal(null) }, 3000)
    } else {
      const err = await emailRes.json().catch(() => ({}))
      alert(`Erreur d'envoi : ${err.error || emailRes.statusText}`)
    }
    setSendingStatusMsg(false)
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
        interview_type: interviewType,
        interview_duration: interviewDuration,
        interviewers: selectedInterviewers.length > 0 ? selectedInterviewers : undefined,
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
    // Use the logged-in user's org, not candidate.organization_id (may differ due to data issues)
    const orgId = profile?.organization_id
    if (!orgId) { setScheduleSaving(false); return }

    const { data: interview } = await supabase.from('interviews').insert({
      candidate_id: candidate.id,
      organization_id: orgId,
      interview_number: scheduleFor,
      status: 'pending',
      interview_type: interviewType,
      interview_duration: interviewDuration,
      interviewers: selectedInterviewers.length > 0 ? selectedInterviewers : [],
    }).select().single()

    if (interview) {
      // Pre-generate UUIDs so we know the IDs before the insert returns
      const slotsWithIds = slots.map(s => ({
        id: crypto.randomUUID(),
        interview_id: interview.id,
        datetime: s.datetime,
        label: s.label,
        status: 'available',
      }))

      const { error: slotsError } = await supabase
        .from('interview_slots')
        .insert(slotsWithIds)

      if (slotsError) {
        console.error('Slots insert failed:', slotsError)
        alert(`Erreur lors de l'enregistrement des créneaux : ${slotsError.message}`)
        setScheduleSaving(false)
        return
      }

            const slotsForEmail = slotsWithIds.map(s => ({ id: s.id, label: s.label, datetime: s.datetime }))

      const { data: token, error: tokenError } = await supabase.from('interview_tokens').insert({
        interview_id: interview.id,
        candidate_id: candidate.id,
        organization_id: orgId,
        status: 'pending',
        recruiter_email: user?.email || null,
      }).select().single()
      if (tokenError) {
        console.error('Token insert failed:', tokenError)
        alert(`Erreur lors de la création du lien candidat : ${tokenError.message}`)
        setScheduleSaving(false)
        return
      }

      await updateStatus(`interview_${scheduleFor}` as CandidateStatus)
      if (token && candidate.email && msgBody) {
        const finalBody = msgBody.replace(/\[TOKEN\]/g, token.token)
        const tokenUrl = `${window.location.origin}/c/${token.token}`
        const emailRes = await fetch(`${SUPABASE_URL}/functions/v1/send-interview-invitation`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            to: candidate.email,
            subject: msgSubject,
            body: finalBody,
            token_url: tokenUrl,
            slots_data: (slotsForEmail || []).map(s => ({ id: s.id, label: s.label || s.datetime || '' })),
            from_name: candidate.job_offer?.company,
            reply_to: user?.email,
          }),
        })
        if (!emailRes.ok) {
          const err = await emailRes.json().catch(() => ({}))
          console.error('Email send failed:', err)
          alert(`L'email n'a pas pu être envoyé : ${err.error || emailRes.statusText}`)
          setScheduleSaving(false)
          return
        }
        await supabase.from('messages').insert({
          candidate_id: candidate.id,
          organization_id: orgId,
          type: 'email',
          subject: msgSubject,
          content: finalBody,
          channel: 'outbound',
          status: 'sent',
          sent_at: new Date().toISOString(),
        }).then(() => {})
        setEmailToast(candidate.email)
        setTimeout(() => setEmailToast(null), 4000)
      }

      const { data: ivList } = await supabase.from('interviews').select('*, slots:interview_slots(*)').eq('candidate_id', candidate.id).order('interview_number')
      setInterviews((ivList || []) as Interview[])
    }
    setScheduleSaving(false)
    setScheduleSuccess(true)
    setTimeout(() => {
      setScheduleSuccess(false)
      setShowSchedule(false)
    }, 3500)
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
  const interviewRounds = candidate.job_offer?.interview_rounds ?? 2
  const pipeline = buildPipeline(interviewRounds)
  const currentPipelineStep = pipeline.indexOf(candidate.status as CandidateStatus)
  const tabs: { id: Tab; label: string }[] = [
    { id: 'info', label: 'Infos' },
    { id: 'ai', label: 'Analyse IA' },
    { id: 'cv', label: 'CV' },
    { id: 'entretiens', label: `Entretiens (${interviews.length})` },
    { id: 'decision', label: 'Décision' },
    { id: 'historique', label: 'Historique' },
  ]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      {/* Email sent toast */}
      {emailToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 bg-green-600 text-white px-5 py-3.5 rounded-2xl shadow-lg animate-in fade-in slide-in-from-top-2 duration-300">
          <MailCheck size={18} />
          <div>
            <p className="font-semibold text-sm">Email envoyé !</p>
            <p className="text-xs text-green-100">Invitation envoyée à {emailToast}</p>
          </div>
        </div>
      )}
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
          <Button
            size="sm"
            variant="secondary"
            onClick={() => candidate.email ? openStatusEmailModal('shortlist', 'shortlisted') : updateStatus('shortlisted')}
            disabled={statusLoading || candidate.status === 'shortlisted'}
          >
            <CheckCircle size={15} className="text-green-500" /> Retenir
          </Button>
          {(candidate.status === 'interview_1' || candidate.status === 'interview_2' || candidate.status === 'interview_3') && (
            <Button size="sm" variant="secondary" onClick={() => candidate.email ? openStatusEmailModal('offer', 'offer') : updateStatus('offer')} disabled={statusLoading}>
              <MailCheck size={15} className="text-blue-500" /> Proposer une offre
            </Button>
          )}
          {interviews.length < interviewRounds && (
            <Button size="sm" onClick={() => openSchedule((interviews.length + 1) as 1 | 2 | 3)} disabled={statusLoading}>
              <CalendarPlus size={15} /> Planifier entretien {interviews.length + 1}
            </Button>
          )}
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
                  <div>
                    <h3 className="font-bold text-slate-900">Entretien {iv.interview_number}</h3>
                    {(iv.interview_type || iv.interview_duration) && (
                      <p className="text-xs text-slate-500 mt-0.5">
                        {iv.interview_type && `${interviewTypeConfig[iv.interview_type]?.icon} ${interviewTypeConfig[iv.interview_type]?.label}`}
                        {iv.interview_type && iv.interview_duration && ' · '}
                        {iv.interview_duration && `${iv.interview_duration} min`}
                      </p>
                    )}
                  </div>
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
                {/* Interviewers badge */}
                {iv.interviewers && iv.interviewers.length > 0 && (
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Users size={13} className="text-slate-400 shrink-0" />
                    {iv.interviewers.map(m => (
                      <span key={m.id} className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                        {m.first_name} {m.last_name}{m.job_title ? ` · ${m.job_title}` : ''}
                      </span>
                    ))}
                  </div>
                )}

                {/* Questionnaire */}
                {(iv.status === 'scheduled' || iv.status === 'pending' || iv.questions) && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                        <ClipboardList size={13} /> Questionnaire
                        {iv.questions && <span className="normal-case font-normal text-slate-400">({iv.questions.length} questions)</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => generateQuestionnaire(iv)}
                          loading={generatingQuestions === iv.id}
                          disabled={generatingQuestions !== null}
                        >
                          {iv.questions ? <><Wand2 size={13} /> Regénérer</> : <><Wand2 size={13} /> Générer</>}
                        </Button>
                        {iv.questions && (
                          <button
                            onClick={() => setExpandedQuestions(prev => {
                              const next = new Set(prev)
                              next.has(iv.id) ? next.delete(iv.id) : next.add(iv.id)
                              return next
                            })}
                            className="text-slate-400 hover:text-slate-600 p-1"
                          >
                            {expandedQuestions.has(iv.id) ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                          </button>
                        )}
                      </div>
                    </div>
                    {iv.questions && expandedQuestions.has(iv.id) && (
                      <div className="space-y-2 mt-2">
                        {iv.questions.map((q, i) => {
                          const catColors: Record<string, string> = {
                            motivation: 'bg-blue-50 text-blue-700',
                            competences: 'bg-green-50 text-green-700',
                            experience: 'bg-purple-50 text-purple-700',
                            comportemental: 'bg-orange-50 text-orange-700',
                            situationnel: 'bg-yellow-50 text-yellow-700',
                            culture_fit: 'bg-pink-50 text-pink-700',
                          }
                          const catLabels: Record<string, string> = {
                            motivation: 'Motivation',
                            competences: 'Compétences',
                            experience: 'Expérience',
                            comportemental: 'Comportemental',
                            situationnel: 'Situationnel',
                            culture_fit: 'Culture fit',
                          }
                          return (
                            <div key={i} className="bg-slate-50 rounded-xl p-3">
                              <div className="flex items-start gap-2">
                                <span className="text-slate-400 font-bold text-xs mt-0.5 shrink-0 w-5">{i + 1}.</span>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm text-slate-800 font-medium leading-snug">{q.question}</p>
                                  {q.tip && <p className="text-xs text-slate-500 mt-1 italic">💡 {q.tip}</p>}
                                </div>
                                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ${catColors[q.category] || 'bg-slate-100 text-slate-500'}`}>
                                  {catLabels[q.category] || q.category}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Post-interview section */}
                <div className="mt-3 pt-3 border-t border-slate-100 space-y-5">

                  {/* Marquer terminé — en haut, bien visible */}
                  {iv.status === 'scheduled' && (
                    <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                      <CheckSquare size={16} className="text-amber-600 shrink-0" />
                      <p className="text-sm text-amber-800 flex-1">L'entretien a-t-il eu lieu ?</p>
                      <Button size="sm" variant="secondary" onClick={() => markInterviewDone(iv.id)}>
                        Marquer terminé
                      </Button>
                    </div>
                  )}

                  {/* Notes du recruteur */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                        <MessageSquare size={13} /> Notes du recruteur
                      </span>
                      <div className="flex items-center gap-2">
                        {notesSavedId === iv.id && (
                          <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                            <CheckCircle size={12} /> Enregistrées
                          </span>
                        )}
                        <Button size="sm" variant="secondary" loading={savingNotes === iv.id} onClick={() => saveNotes(iv.id)}>
                          <Save size={12} /> Enregistrer
                        </Button>
                      </div>
                    </div>
                    <textarea
                      value={recruiterNotes[iv.id] !== undefined ? recruiterNotes[iv.id] : (iv.recruiter_notes ?? '')}
                      onChange={e => setRecruiterNotes(prev => ({ ...prev, [iv.id]: e.target.value }))}
                      placeholder="Notez vos observations, points forts, doutes... Ces notes alimenteront l'analyse IA."
                      rows={3}
                      className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                    />
                  </div>

                  {/* Audio upload & transcript */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-1.5">
                        <Mic size={13} /> Transcription audio
                      </span>
                      <label className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border border-slate-200 cursor-pointer hover:border-blue-300 transition-all ${transcribingAudio === iv.id ? 'opacity-50 pointer-events-none' : ''}`}>
                        {transcribingAudio === iv.id ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                        {transcribingAudio === iv.id ? 'Transcription en cours...' : 'Importer audio'}
                        <input type="file" accept="audio/*,video/*" className="hidden" onChange={e => { const f = e.target.files?.[0]; if (f) handleAudioUpload(iv, f); e.target.value = '' }} />
                      </label>
                    </div>
                    {transcribingAudio === iv.id && (
                      <div className="flex items-center gap-2 text-sm text-slate-500 py-3">
                        <Loader2 size={15} className="animate-spin text-blue-500" />
                        Transcription et identification des interlocuteurs en cours...
                      </div>
                    )}
                    {(audioTranscripts[iv.id] !== undefined || iv.audio_transcript) && transcribingAudio !== iv.id && (
                      <div className="space-y-3">
                        {/* Transcript labellisé (RECRUTEUR / CANDIDAT) — lecture seule */}
                        {iv.transcript_labelled && (
                          <div>
                            <p className="text-xs font-semibold text-indigo-600 mb-1.5 flex items-center gap-1.5">
                              <Users size={12} /> Transcript avec identification des interlocuteurs
                            </p>
                            <div className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono leading-relaxed max-h-48 overflow-y-auto whitespace-pre-wrap text-slate-700">
                              {iv.transcript_labelled}
                            </div>
                          </div>
                        )}
                        {/* Transcript brut éditable */}
                        <div>
                          {iv.transcript_labelled && (
                            <p className="text-xs text-slate-400 mb-1">Transcript brut (modifiable)</p>
                          )}
                          <textarea
                            value={audioTranscripts[iv.id] !== undefined ? audioTranscripts[iv.id] : (iv.audio_transcript ?? '')}
                            onChange={e => setAudioTranscripts(prev => ({ ...prev, [iv.id]: e.target.value }))}
                            placeholder="Transcript de l'entretien..."
                            rows={iv.transcript_labelled ? 4 : 7}
                            className="w-full text-sm border border-slate-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y font-mono leading-relaxed"
                          />
                          <div className="flex items-center gap-2 mt-1.5">
                            {transcriptSavedId === iv.id && (
                              <span className="text-xs text-green-600 font-medium flex items-center gap-1">
                                <CheckCircle size={12} /> Enregistré
                              </span>
                            )}
                            <Button size="sm" variant="secondary" loading={savingTranscript === iv.id} onClick={() => saveTranscript(iv.id)}>
                              <Save size={12} /> Enregistrer le transcript
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Analyser avec l'IA */}
                  <div>
                    <Button
                      size="sm"
                      onClick={() => analyzeInterviewWithAI(iv)}
                      loading={analyzingInterview === iv.id}
                      disabled={analyzingInterview !== null || (
                        !(audioTranscripts[iv.id] || iv.audio_transcript) &&
                        !(recruiterNotes[iv.id] || iv.recruiter_notes)
                      )}
                    >
                      <Wand2 size={14} /> {iv.score !== null ? 'Ré-analyser avec l\'IA' : 'Analyser l\'entretien avec l\'IA'}
                    </Button>
                    {!(audioTranscripts[iv.id] || iv.audio_transcript) && !(recruiterNotes[iv.id] || iv.recruiter_notes) && (
                      <p className="text-xs text-slate-400 mt-1.5">Ajoutez des notes ou importez un audio pour activer l'analyse.</p>
                    )}
                  </div>

                  {/* Résultats IA — score global + sous-scores + résumé */}
                  {iv.score !== null && (
                    <div className="bg-slate-50 rounded-2xl p-4 space-y-4">
                      {/* Score global + avis IA */}
                      <div className="flex items-center gap-3 flex-wrap">
                        <ScoreDisplay score={iv.score} label="Score global" size="sm" />
                        {iv.recommendation && (
                          <span className={`text-xs font-bold px-3 py-1.5 rounded-lg ${
                            iv.recommendation === 'GO' ? 'bg-green-100 text-green-700' :
                            iv.recommendation === 'MAYBE' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {iv.recommendation === 'GO' ? '🟢' : iv.recommendation === 'MAYBE' ? '🟡' : '🔴'} Avis IA : {iv.recommendation}
                          </span>
                        )}
                      </div>

                      {/* Sous-scores */}
                      {(iv.score_communication || iv.score_motivation || iv.score_competences || iv.score_pertinence || iv.score_coherence) && (
                        <div className="space-y-2">
                          {([
                            { key: 'score_communication', label: 'Communication', color: 'bg-blue-500' },
                            { key: 'score_motivation', label: 'Motivation', color: 'bg-purple-500' },
                            { key: 'score_competences', label: 'Compétences', color: 'bg-green-500' },
                            { key: 'score_pertinence', label: 'Pertinence des réponses', color: 'bg-orange-500' },
                            { key: 'score_coherence', label: 'Cohérence du parcours', color: 'bg-teal-500' },
                            { key: 'score_questions_candidat', label: 'Questions posées par le candidat', color: 'bg-indigo-500' },
                          ] as const).map(({ key, label, color }) => {
                            const val = iv[key]
                            if (!val) return null
                            return (
                              <div key={key}>
                                <div className="flex items-center justify-between text-xs mb-1">
                                  <span className="text-slate-600">{label}</span>
                                  <span className={`font-bold ${val >= 75 ? 'text-green-600' : val >= 50 ? 'text-orange-500' : 'text-red-500'}`}>{val}/100</span>
                                </div>
                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                  <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${val}%` }} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      )}

                      {/* Résumé */}
                      {iv.ai_summary && <p className="text-sm text-slate-600 leading-relaxed">{iv.ai_summary}</p>}

                      {/* Points forts / vigilance */}
                      {(iv.ai_strengths || iv.ai_concerns) && (
                        <div className="grid sm:grid-cols-2 gap-3">
                          {iv.ai_strengths && (
                            <div className="bg-green-50 rounded-xl p-3">
                              <p className="text-xs font-semibold text-green-700 mb-1.5 flex items-center gap-1">
                                <CheckCircle size={11} /> Points forts
                              </p>
                              <p className="text-xs text-green-800 leading-relaxed">{iv.ai_strengths}</p>
                            </div>
                          )}
                          {iv.ai_concerns && (
                            <div className="bg-orange-50 rounded-xl p-3">
                              <p className="text-xs font-semibold text-orange-700 mb-1.5 flex items-center gap-1">
                                <XCircle size={11} /> Points de vigilance
                              </p>
                              <p className="text-xs text-orange-800 leading-relaxed">{iv.ai_concerns}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  {/* GO / MAYBE / NO — décision recruteur */}
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Décision du recruteur</p>
                    <div className="flex gap-2">
                      {(['GO', 'MAYBE', 'NO'] as const).map(d => (
                        <button
                          key={d}
                          onClick={() => saveDecision(iv, d)}
                          className={`flex-1 py-2.5 rounded-xl text-sm font-bold border-2 transition-all ${
                            iv.recommendation === d
                              ? d === 'GO' ? 'bg-green-600 text-white border-green-600 shadow-sm'
                                : d === 'MAYBE' ? 'bg-orange-500 text-white border-orange-500 shadow-sm'
                                : 'bg-red-600 text-white border-red-600 shadow-sm'
                              : d === 'GO' ? 'border-green-200 text-green-700 hover:bg-green-50'
                                : d === 'MAYBE' ? 'border-orange-200 text-orange-700 hover:bg-orange-50'
                                : 'border-red-200 text-red-700 hover:bg-red-50'
                          }`}
                        >
                          {d === 'GO' ? '🟢' : d === 'MAYBE' ? '🟡' : '🔴'} {d}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Actions post-décision */}
                  {iv.recommendation && (
                    <div className="space-y-2">
                      {/* GO ou MAYBE + pas dernier entretien */}
                      {(iv.recommendation === 'GO' || iv.recommendation === 'MAYBE') && iv.interview_number < interviewRounds && (
                        <Button
                          size="sm"
                          variant={iv.recommendation === 'GO' ? 'primary' : 'secondary'}
                          onClick={() => openSchedule((iv.interview_number + 1) as 1 | 2 | 3)}
                        >
                          <CalendarPlus size={14} /> Planifier entretien {iv.interview_number + 1}
                        </Button>
                      )}
                      {/* GO + dernier entretien */}
                      {iv.recommendation === 'GO' && iv.interview_number >= interviewRounds && (
                        <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openPostDecisionModal(iv, 'hired')}>
                          <MailCheck size={14} /> Envoyer email d'embauche 🎉
                        </Button>
                      )}
                      {/* MAYBE + dernier entretien → les deux options */}
                      {iv.recommendation === 'MAYBE' && iv.interview_number >= interviewRounds && (
                        <div className="flex gap-2 flex-wrap">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700 text-white" onClick={() => openPostDecisionModal(iv, 'hired')}>
                            <MailCheck size={14} /> Email d'embauche
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => openPostDecisionModal(iv, 'rejection')}>
                            <Mail size={14} /> Email de refus
                          </Button>
                        </div>
                      )}
                      {/* NO → refus */}
                      {iv.recommendation === 'NO' && (
                        <Button size="sm" variant="danger" onClick={() => openPostDecisionModal(iv, 'rejection')}>
                          <Mail size={14} /> Envoyer email de refus
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </Card>
            ))
          )}
          {interviews.length > 0 && interviews.length < interviewRounds && (
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

      {tab === 'historique' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-bold text-slate-900">Historique des interactions</h2>
            <button onClick={loadHistory} disabled={historyLoading} className="text-xs text-blue-600 hover:underline">
              {historyLoading ? <Loader2 size={14} className="animate-spin inline" /> : '↻ Actualiser'}
            </button>
          </div>
          {history.length === 0 && !historyLoading ? (
            <Card>
              <div className="text-center py-10">
                <History size={36} className="mx-auto text-slate-200 mb-3" />
                <p className="text-slate-500 font-medium mb-1">Aucun historique</p>
                <p className="text-sm text-slate-400">Les emails envoyés, réponses du candidat et décisions apparaîtront ici.</p>
                <button onClick={loadHistory} className="mt-4 text-sm text-blue-600 hover:underline">Charger l'historique</button>
              </div>
            </Card>
          ) : (
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-slate-100" />
              <div className="space-y-4">
                {history.map(item => {
                  const isOut = item.kind === 'email_out'
                  const isIn = item.kind === 'email_in'
                  const isDecision = item.kind === 'decision'
                  return (
                    <div key={item.id} className="relative flex gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 z-10 ${
                        isOut ? 'bg-blue-100' : isIn ? 'bg-green-100' : 'bg-slate-100'
                      }`}>
                        {isOut && <MessageSquare size={16} className="text-blue-600" />}
                        {isIn && <Mail size={16} className="text-green-600" />}
                        {isDecision && <UserCheck size={16} className="text-slate-500" />}
                      </div>
                      <div className="flex-1 bg-white rounded-2xl border border-slate-200 p-4 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                          <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
                            {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                        {item.content && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-3 whitespace-pre-wrap">{item.content}</p>
                        )}
                        <span className={`inline-block text-[10px] font-semibold uppercase tracking-wide mt-2 px-2 py-0.5 rounded-full ${
                          isOut ? 'bg-blue-50 text-blue-600' : isIn ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
                        }`}>
                          {isOut ? 'Email envoyé' : isIn ? 'Réponse candidat' : 'Décision recruteur'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Status email modal (shortlist / offer) */}
      {statusEmailModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    {statusEmailModal.type === 'shortlist' ? '✅ Email de présélection' : '📄 Email d\'offre d\'emploi'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {statusEmailModal.type === 'shortlist'
                      ? 'Informez le candidat que sa candidature est retenue'
                      : 'Proposez officiellement le poste au candidat'}
                  </p>
                </div>
                <button onClick={() => setStatusEmailModal(null)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {genStatusMsg ? (
                <div className="flex items-center justify-center py-8 gap-3 text-slate-500">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">Génération du message...</span>
                </div>
              ) : statusMsgSent ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MailCheck size={26} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-green-900 mb-1">Email envoyé !</p>
                  <p className="text-sm text-green-700">Message envoyé à <strong>{candidate?.email}</strong></p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Objet</label>
                    <input
                      value={statusMsgSubject}
                      onChange={e => setStatusMsgSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</label>
                      <button
                        onClick={() => { if (statusEmailModal) openStatusEmailModal(statusEmailModal.type, statusEmailModal.targetStatus) }}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Wand2 size={12} /> Regénérer
                      </button>
                    </div>
                    <textarea
                      value={statusMsgBody}
                      onChange={e => setStatusMsgBody(e.target.value)}
                      rows={10}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button
                      onClick={sendStatusMsg}
                      loading={sendingStatusMsg}
                      disabled={!statusMsgBody || !candidate?.email}
                      className={statusEmailModal.type === 'offer' ? 'bg-blue-600 hover:bg-blue-700 text-white' : ''}
                    >
                      <Send size={15} /> Envoyer
                    </Button>
                    <Button variant="secondary" onClick={() => {
                      updateStatus(statusEmailModal.targetStatus)
                      setStatusEmailModal(null)
                    }}>
                      Enregistrer sans email
                    </Button>
                  </div>
                  {!candidate?.email && (
                    <p className="text-xs text-amber-600">Ce candidat n'a pas d'adresse email renseignée.</p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Post-decision email modal */}
      {postDecisionModal && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-bold text-slate-900">
                    {postDecisionModal.type === 'hired' ? '🎉 Email d\'embauche' : '📩 Email de refus'}
                  </h2>
                  <p className="text-sm text-slate-500 mt-0.5">
                    {postDecisionModal.type === 'hired'
                      ? 'Félicitez le candidat pour son recrutement'
                      : 'Informez le candidat avec bienveillance'}
                  </p>
                </div>
                <button onClick={() => setPostDecisionModal(null)} className="text-slate-400 hover:text-slate-600">
                  <XCircle size={20} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              {genPostMsg ? (
                <div className="flex items-center justify-center py-8 gap-3 text-slate-500">
                  <Loader2 size={20} className="animate-spin" />
                  <span className="text-sm">Génération du message...</span>
                </div>
              ) : postMsgSent ? (
                <div className="text-center py-8">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MailCheck size={26} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-green-900 mb-1">Email envoyé !</p>
                  <p className="text-sm text-green-700">Message envoyé à <strong>{candidate?.email}</strong></p>
                </div>
              ) : (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">Objet</label>
                    <input
                      value={postMsgSubject}
                      onChange={e => setPostMsgSubject(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide">Message</label>
                      <button
                        onClick={() => { if (postDecisionModal) openPostDecisionModal(interviews.find(x => x.id === postDecisionModal.interviewId)!, postDecisionModal.type) }}
                        className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <Wand2 size={12} /> Regénérer
                      </button>
                    </div>
                    <textarea
                      value={postMsgBody}
                      onChange={e => setPostMsgBody(e.target.value)}
                      rows={10}
                      className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
                    />
                  </div>
                  <div className="flex gap-3 pt-1">
                    <Button onClick={sendPostMsg} loading={sendingPostMsg} disabled={!postMsgBody || !candidate?.email}
                      className={postDecisionModal.type === 'hired' ? 'bg-green-600 hover:bg-green-700 text-white' : ''}>
                      <Send size={15} /> Envoyer
                    </Button>
                    <Button variant="secondary" onClick={() => setPostDecisionModal(null)}>Annuler</Button>
                  </div>
                  {!candidate?.email && (
                    <p className="text-xs text-amber-600">Ce candidat n'a pas d'adresse email renseignée.</p>
                  )}
                </>
              )}
            </div>
          </div>
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
              {/* Type & durée */}
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">Format</h3>
                  <div className="flex flex-col gap-1.5">
                    {(['visio', 'presentiel', 'phone'] as const).map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setInterviewType(t)}
                        className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          interviewType === t
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {interviewTypeConfig[t].icon} {interviewTypeConfig[t].label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-900 mb-2 text-sm">Durée</h3>
                  <div className="flex flex-col gap-1.5">
                    {[15, 30, 45, 60, 90].map(d => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setInterviewDuration(d)}
                        className={`text-left px-3 py-2 rounded-xl text-sm font-medium border transition-all ${
                          interviewDuration === d
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-200 text-slate-600 hover:border-blue-300'
                        }`}
                      >
                        {d} min
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Intervieweurs */}
              {orgMembers.length > 0 && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-slate-900 text-sm">Intervieweurs</h3>
                    <span className="text-xs text-slate-400">(max 2)</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {orgMembers.map(m => {
                      const sel = selectedInterviewers.some(x => x.id === m.id)
                      const disabled = !sel && selectedInterviewers.length >= 2
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => toggleInterviewer(m)}
                          disabled={disabled}
                          className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                            sel
                              ? 'bg-blue-600 text-white border-blue-600'
                              : disabled
                              ? 'border-slate-100 text-slate-300 cursor-not-allowed'
                              : 'border-slate-200 text-slate-600 hover:border-blue-300'
                          }`}
                        >
                          <span className={`w-6 h-6 rounded-lg text-xs font-bold flex items-center justify-center ${sel ? 'bg-blue-500' : 'bg-slate-100 text-slate-500'}`}>
                            {m.first_name[0]}{m.last_name[0]}
                          </span>
                          <span>{m.first_name} {m.last_name}</span>
                          {m.job_title && <span className={`text-xs ${sel ? 'text-blue-200' : 'text-slate-400'}`}>· {m.job_title}</span>}
                        </button>
                      )
                    })}
                  </div>
                  {orgMembers.length === 0 && (
                    <p className="text-xs text-slate-400">
                      Aucun membre — <a href="/parametres/equipe" className="text-blue-600 hover:underline">ajoutez des membres</a> dans les paramètres.
                    </p>
                  )}
                </div>
              )}

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
                      slots={slots}
                    />
                  ) : (
                    <p className="text-sm text-slate-400">Cliquez sur "Générer" pour créer un message personnalisé</p>
                  )}
                </div>
              )}

              {scheduleSuccess ? (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 px-6 py-6 text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <MailCheck size={24} className="text-green-600" />
                  </div>
                  <p className="font-semibold text-green-900 mb-1">Invitation envoyée !</p>
                  <p className="text-sm text-green-700">
                    L'email a bien été envoyé à <strong>{candidate.email}</strong>.<br />
                    Le candidat peut maintenant choisir son créneau.
                  </p>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="mt-4"
                    onClick={() => { setScheduleSuccess(false); setShowSchedule(false) }}
                  >
                    Fermer
                  </Button>
                </div>
              ) : (
                <div className="flex gap-3 pt-2">
                  <Button onClick={saveSchedule} loading={scheduleSaving} disabled={slots.length === 0 || !msgBody}>
                    <Send size={15} /> Envoyer l'invitation
                  </Button>
                  {slots.length > 0 && !msgBody && (
                    <p className="text-xs text-amber-600 self-center">Générez d'abord le message</p>
                  )}
                  <Button variant="secondary" onClick={() => setShowSchedule(false)}>Annuler</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
