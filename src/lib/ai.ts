import { supabase } from './supabase'

export async function analyzeOffer(params: { text?: string; url?: string }) {
  const { data, error } = await supabase.functions.invoke('analyze-offer', { body: params })
  if (error) {
    // Try to extract the detailed message from the function response body
    try {
      const body = await (error as { context?: Response }).context?.json?.()
      if (body?.error) throw new Error(body.error)
    } catch (e) {
      if (e instanceof Error && e.message !== '') throw e
    }
    throw error
  }
  if (data?.error) throw new Error(data.error)
  return data
}

export async function analyzeCandidate(params: {
  cv_text?: string
  cv_base64?: string
  cv_media_type?: string
  cover_letter_text?: string
  job_offer?: { title: string; company: string; description?: string; skills?: string; experience?: string }
}) {
  const { data, error } = await supabase.functions.invoke('analyze-candidate', { body: params })
  if (error) throw error
  return data
}

export async function analyzeInterview(params: {
  transcript?: string
  transcript_labelled?: string
  recruiter_notes?: string
  candidate?: { first_name: string; last_name: string }
  job_offer?: { title: string; company: string }
  interview_number?: number
}) {
  const { data, error } = await supabase.functions.invoke('analyze-interview', { body: params })
  if (error) throw error
  return data as {
    score: number
    score_communication: number
    score_motivation: number
    score_competences: number
    score_pertinence: number
    score_coherence: number
    score_questions_candidat: number | null
    strengths: string
    concerns: string
    summary: string
    recommendation: string
    next_step: string
  }
}

export async function transcribeAudio(file: File): Promise<{ transcript: string; transcript_labelled: string }> {
  const { data: { session } } = await supabase.auth.getSession()
  if (!session?.access_token) throw new Error('Non authentifié')
  const form = new FormData()
  form.append('file', file, file.name)
  const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/transcribe-audio`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.access_token}` },
    body: form,
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error(err.error || 'Erreur de transcription audio')
  }
  return res.json()
}

export async function generateInterviewQuestions(params: {
  candidate?: { first_name: string; last_name: string }
  job_offer?: { title: string; company: string; description?: string; skills?: string; experience?: string }
  interview_number?: number
  interview_duration?: number
  cv_text?: string
  ai_summary?: string
  ai_strengths?: string
  ai_weaknesses?: string
  missing_skills?: string
}) {
  const { data, error } = await supabase.functions.invoke('generate-interview-questions', { body: params })
  if (error) throw error
  return data as { questions: { question: string; category: string; tip: string }[] }
}

export async function generateMessage(params: {
  type: 'interview_invitation' | 'shortlist' | 'rejection' | 'offer' | 'hired'
  candidate?: { first_name: string; last_name: string }
  job_offer?: { title: string; company: string }
  slots?: { label: string }[]
  interview_link?: string
  interview_type?: 'visio' | 'presentiel' | 'phone'
  interview_duration?: number
  interviewers?: { first_name: string; last_name: string; job_title?: string | null }[]
}) {
  const { data, error } = await supabase.functions.invoke('generate-message', { body: params })
  if (error) throw error
  return data as { subject: string; message: string }
}
