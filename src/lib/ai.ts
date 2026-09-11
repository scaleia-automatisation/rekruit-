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
  transcript: string
  candidate?: { first_name: string; last_name: string }
  job_offer?: { title: string; company: string }
  interview_number?: number
}) {
  const { data, error } = await supabase.functions.invoke('analyze-interview', { body: params })
  if (error) throw error
  return data
}

export async function generateMessage(params: {
  type: 'interview_invitation' | 'shortlist' | 'rejection' | 'offer'
  candidate?: { first_name: string; last_name: string }
  job_offer?: { title: string; company: string }
  slots?: { label: string }[]
  interview_link?: string
}) {
  const { data, error } = await supabase.functions.invoke('generate-message', { body: params })
  if (error) throw error
  return data as { subject: string; message: string }
}
