import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { CheckCircle, Loader2, CalendarX, Briefcase } from 'lucide-react'
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

type Selection =
  | { kind: 'slot'; id: string }
  | { kind: 'not_available' }
  | { kind: 'not_looking' }

export function PublicInterviewPage() {
  const { token } = useParams<{ token: string }>()
  const [loading, setLoading] = useState(true)
  const [tokenData, setTokenData] = useState<TokenData | null>(null)
  const [slots, setSlots] = useState<SlotData[]>([])
  const [error, setError] = useState('')
  const [selection, setSelection] = useState<Selection | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [doneResult, setDoneResult] = useState<'slot_confirmed' | 'not_available' | 'not_looking' | null>(null)

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
    if (!selection || !token) return
    setSubmitting(true)
    try {
      const payload =
        selection.kind === 'slot'
          ? { slot_id: selection.id }
          : { action: selection.kind }

      const res = await fetch(`${SUPABASE_URL}/functions/v1/public-interview?token=${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (res.ok) setDoneResult(data.result)
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

  if (doneResult) {
    const screens = {
      slot_confirmed: {
        icon: <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5"><CheckCircle size={32} className="text-green-600" /></div>,
        title: 'Créneau confirmé !',
        msg: 'Votre choix a bien été enregistré. Vous recevrez une confirmation par email.',
      },
      not_available: {
        icon: <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-5"><CalendarX size={32} className="text-amber-600" /></div>,
        title: 'Réponse enregistrée',
        msg: 'Nous avons bien pris note de votre indisponibilité. Le recruteur sera informé.',
      },
      not_looking: {
        icon: <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-5"><Briefcase size={32} className="text-slate-400" /></div>,
        title: 'Réponse enregistrée',
        msg: 'Nous avons bien pris note que vous n\'êtes plus en recherche d\'emploi. Bonne continuation !',
      },
    }
    const s = screens[doneResult]
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 max-w-md w-full text-center">
          {s.icon}
          <h1 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h1>
          <p className="text-slate-500">{s.msg}</p>
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
          <p className="text-slate-500">Vous avez déjà répondu à cette invitation.</p>
        </div>
      </div>
    )
  }

  const iv = tokenData?.interview

  const isSlotSelected = selection?.kind === 'slot'
  const isNotAvailable = selection?.kind === 'not_available'
  const isNotLooking = selection?.kind === 'not_looking'

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
          Bonjour {iv?.candidate?.first_name}, veuillez choisir une option ci-dessous :
        </p>

        {/* Slots */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Créneaux proposés</p>
        <div className="space-y-3 mb-5">
          {slots.map(s => {
            const active = isSlotSelected && (selection as { kind: 'slot'; id: string }).id === s.id
            return (
              <button
                key={s.id}
                onClick={() => setSelection({ kind: 'slot', id: s.id })}
                className={`w-full text-left rounded-2xl border p-4 transition-all font-medium capitalize ${
                  active
                    ? 'border-blue-600 bg-blue-50 text-blue-900'
                    : 'border-slate-200 hover:border-blue-300 text-slate-700'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${active ? 'border-blue-600' : 'border-slate-300'}`}>
                    {active && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                  </div>
                  {s.label || s.slot_datetime}
                </div>
              </button>
            )
          })}
        </div>

        {/* Separator */}
        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100" /></div>
          <div className="relative flex justify-center"><span className="bg-white px-3 text-xs text-slate-400">ou</span></div>
        </div>

        {/* Unavailability buttons */}
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Autre réponse</p>
        <div className="space-y-3 mb-6">
          <button
            onClick={() => setSelection({ kind: 'not_available' })}
            className={`w-full text-left rounded-2xl border p-4 transition-all font-medium ${
              isNotAvailable
                ? 'border-amber-500 bg-amber-50 text-amber-900'
                : 'border-slate-200 hover:border-amber-300 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isNotAvailable ? 'border-amber-500' : 'border-slate-300'}`}>
                {isNotAvailable && <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />}
              </div>
              <div>
                <div className="font-semibold">Je ne suis pas disponible à ces dates</div>
                <div className="text-xs text-slate-400 font-normal mt-0.5">Le recruteur sera informé et pourra vous proposer d'autres créneaux</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => setSelection({ kind: 'not_looking' })}
            className={`w-full text-left rounded-2xl border p-4 transition-all font-medium ${
              isNotLooking
                ? 'border-slate-500 bg-slate-50 text-slate-900'
                : 'border-slate-200 hover:border-slate-400 text-slate-700'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${isNotLooking ? 'border-slate-500' : 'border-slate-300'}`}>
                {isNotLooking && <div className="w-2.5 h-2.5 rounded-full bg-slate-500" />}
              </div>
              <div>
                <div className="font-semibold">Je ne recherche plus d'emploi</div>
                <div className="text-xs text-slate-400 font-normal mt-0.5">Votre candidature sera archivée</div>
              </div>
            </div>
          </button>
        </div>

        <Button
          onClick={submit}
          loading={submitting}
          disabled={!selection}
          className="w-full justify-center"
          variant={isNotLooking ? 'secondary' : isNotAvailable ? 'secondary' : 'primary'}
        >
          {isNotAvailable
            ? 'Signaler mon indisponibilité'
            : isNotLooking
            ? 'Confirmer que je ne recherche plus'
            : 'Confirmer ce créneau'}
        </Button>
      </div>
    </div>
  )
}
