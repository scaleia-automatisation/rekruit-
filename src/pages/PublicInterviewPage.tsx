import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Loader2 } from 'lucide-react'
import { Button } from '../components/ui/Button'

interface SlotData {
  id: string
  slot_datetime: string | null
  label: string | null
  status: string | null
}

interface TokenData {
  status: string
  interview: {
    interview_number: number
    candidate: { first_name: string; last_name: string }
    job_offer: { title: string; company: string }
  }
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL

export function PublicInterviewPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [slots, setSlots] = useState<SlotData[]>([])
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    const load = async () => {
      if (!token) return
      try {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/public-interview?token=${token}`)
        const data = await res.json()
        if (!res.ok) { setError(data.error || 'Lien invalide'); setLoading(false); return }
        setTokenData(data.token)
        setSlots(data.slots || [])
      } catch {
        setError('Impossible de charger les informations')
      }
      setLoading(false)
    }
    load()
  }, [token])

  const submit = async () => {
    if (!selected || !token) return
    setSubmitting(true)
    try {
      const res = await fetch(`${SUPABASE_URL}/functions/v1/public-interview?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: selected }),
      })
      if (res.ok) setDone(true)
      else setError('Une erreur est survenue. Veuillez réessayer.')
    } catch {
      setError('Une erreur est survenue.')
    }
    setSubmitting(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">❌</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Lien invalide</h1>
          <p className="text-slate-500">{error}</p>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Créneau confirmé !</h1>
          <p className="text-slate-500">Votre choix a bien été enregistré. Vous recevrez une confirmation par email.</p>
        </div>
      </div>
    )
  }

  if (tokenData?.status !== 'pending') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
          <div className="text-4xl mb-4">✓</div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">Déjà répondu</h1>
          <p className="text-slate-500">Vous avez déjà sélectionné un créneau pour cet entretien.</p>
        </div>
      </div>
    )
  }

  const iv = tokenData?.interview

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-lg w-full">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="font-bold text-slate-900">rekruit</span>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          Entretien {iv?.interview_number} — {iv?.job_offer?.title}
        </h1>
        <p className="text-slate-500 mb-2">{iv?.job_offer?.company}</p>
        <p className="text-sm text-slate-400 mb-6">
          Bonjour {iv?.candidate?.first_name}, veuillez choisir un créneau qui vous convient :
        </p>

        <div className="space-y-3 mb-6">
          {slots.map(s => (
            <button
              key={s.id}
              onClick={() => setSelected(s.id)}
              className={`w-full text-left rounded-2xl border p-4 transition-all font-medium capitalize ${
                selected === s.id
                  ? 'border-blue-600 bg-blue-50 text-blue-900'
                  : 'border-slate-200 hover:border-blue-300 text-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected === s.id ? 'border-blue-600' : 'border-slate-300'}`}>
                  {selected === s.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                </div>
                {s.label || s.slot_datetime}
              </div>
            </button>
          ))}
        </div>

        <Button onClick={submit} loading={submitting} disabled={!selected} className="w-full justify-center">
          Confirmer ce créneau
        </Button>
      </div>
    </div>
  )
}
