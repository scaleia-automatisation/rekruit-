import { useEffect, useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, MapPin, Clock, Users, Plus, ChevronRight, Trash2, Briefcase } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Card } from '../components/ui/Card'

interface Offer {
  id: string
  title: string
  company: string
  location: string | null
  contract_type: string | null
  salary_range: string | null
  status: string
  description: string | null
  missions: string | null
  skills: string | null
  experience: string | null
  education: string | null
  languages: string | null
  mandatory_criteria: string | null
  preferred_criteria: string | null
  created_at: string
}

interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string | null
  status: string
  score_global: number | null
  created_at: string
}

const statusMap: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' | 'gray' }> = {
  draft: { label: 'Brouillon', variant: 'gray' },
  active: { label: 'Active', variant: 'green' },
  paused: { label: 'En pause', variant: 'orange' },
  closed: { label: 'Fermée', variant: 'red' },
}

const candidateStatusConfig: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple' }> = {
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

export function OfferDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [offer, setOffer] = useState<Offer | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [offerStatus, setOfferStatus] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!id) return
      const [{ data: o }, { data: c }] = await Promise.all([
        supabase.from('job_offers').select('*').eq('id', id).single(),
        supabase.from('candidates').select('id, first_name, last_name, email, status, score_global, created_at')
          .eq('job_offer_id', id).order('created_at', { ascending: false }),
      ])
      if (o) { setOffer(o as Offer); setOfferStatus(o.status) }
      if (c) setCandidates(c as Candidate[])
      setLoading(false)
    }
    load()
  }, [id])

  const updateStatus = async (status: string) => {
    if (!id) return
    await supabase.from('job_offers').update({ status }).eq('id', id)
    setOfferStatus(status)
    if (offer) setOffer({ ...offer, status })
  }

  const handleDelete = async () => {
    if (!id || !window.confirm('Supprimer cette offre et tous ses candidats ?')) return
    await supabase.from('candidates').delete().eq('job_offer_id', id)
    await supabase.from('job_offers').delete().eq('id', id)
    navigate('/offres')
  }

  if (loading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
        <div className="h-8 bg-slate-200 rounded w-48 mb-8 animate-pulse" />
        <div className="h-48 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      </div>
    )
  }

  if (!offer) return (
    <div className="p-8 text-center">
      <p className="text-slate-500">Offre introuvable.</p>
      <Link to="/offres" className="text-blue-600 hover:underline text-sm mt-2 block">← Retour</Link>
    </div>
  )

  const st = statusMap[offerStatus] || { label: offerStatus, variant: 'gray' as const }
  const statuses = ['draft', 'active', 'paused', 'closed']
  const scoreColor = (s: number) => s >= 75 ? 'text-green-600' : s >= 50 ? 'text-orange-500' : 'text-red-500'

  const stats = {
    total: candidates.length,
    shortlisted: candidates.filter(c => ['shortlisted', 'interview_1', 'interview_2', 'interview_3', 'offer', 'hired'].includes(c.status)).length,
    hired: candidates.filter(c => c.status === 'hired').length,
    avgScore: candidates.filter(c => c.score_global !== null).length > 0
      ? Math.round(candidates.filter(c => c.score_global !== null).reduce((s, c) => s + (c.score_global || 0), 0) / candidates.filter(c => c.score_global !== null).length)
      : null,
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <Link to="/offres" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Retour
        </Link>
        <button onClick={handleDelete} className="inline-flex items-center gap-2 text-xs text-red-500 hover:text-red-700">
          <Trash2 size={14} /> Supprimer
        </button>
      </div>

      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
            <Briefcase size={24} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{offer.title}</h1>
              <Badge variant={st.variant}>{st.label}</Badge>
            </div>
            <p className="text-slate-600 font-medium mb-3">{offer.company}</p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-500">
              {offer.location && <span className="flex items-center gap-1.5"><MapPin size={14} />{offer.location}</span>}
              {offer.contract_type && <span className="flex items-center gap-1.5"><Clock size={14} />{offer.contract_type}</span>}
              {offer.salary_range && <span>{offer.salary_range}</span>}
              <span className="flex items-center gap-1.5"><Users size={14} />{candidates.length} candidat{candidates.length !== 1 ? 's' : ''}</span>
            </div>
          </div>
        </div>

        {/* Status switcher */}
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 mb-2">Statut de l'offre</p>
          <div className="flex gap-2 flex-wrap">
            {statuses.map(s => {
              const sc = statusMap[s] || { label: s, variant: 'gray' as const }
              return (
                <button
                  key={s}
                  onClick={() => updateStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    offerStatus === s
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-200 text-slate-600 hover:border-blue-300'
                  }`}
                >
                  {sc.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { label: 'Candidats', value: stats.total },
          { label: 'Présélectionnés', value: stats.shortlisted },
          { label: 'Recrutés', value: stats.hired },
          { label: 'Score moyen', value: stats.avgScore !== null ? `${stats.avgScore}/100` : '—' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-200 p-4 text-center">
            <p className="text-2xl font-bold text-slate-900">{s.value}</p>
            <p className="text-xs text-slate-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Offer info */}
        <div className="lg:col-span-1 space-y-4">
          {offer.description && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-3">Description</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{offer.description}</p>
            </Card>
          )}
          {offer.skills && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-3">Compétences</h3>
              <p className="text-sm text-slate-600">{offer.skills}</p>
            </Card>
          )}
          {offer.mandatory_criteria && (
            <Card>
              <h3 className="font-bold text-slate-900 mb-2">Critères obligatoires</h3>
              <p className="text-sm text-slate-600">{offer.mandatory_criteria}</p>
            </Card>
          )}
        </div>

        {/* Candidates */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">Candidats</h2>
            <Link to={`/candidats/nouveau?offre=${offer.id}`}>
              <Button size="sm"><Plus size={15} /> Ajouter</Button>
            </Link>
          </div>

          {candidates.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
              <Users size={36} className="mx-auto text-slate-200 mb-3" />
              <p className="font-semibold text-slate-900 mb-1">Aucun candidat</p>
              <p className="text-sm text-slate-500 mb-4">Ajoutez des candidats pour cette offre.</p>
              <Link to={`/candidats/nouveau?offre=${offer.id}`}>
                <Button size="sm"><Plus size={15} /> Ajouter un candidat</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {candidates.map(c => {
                const cst = candidateStatusConfig[c.status] || { label: c.status, variant: 'gray' as const }
                return (
                  <Link key={c.id} to={`/candidats/${c.id}`}>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-3">
                      <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        <span className="text-blue-700 font-bold text-xs">{c.first_name[0]}{c.last_name[0]}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-slate-900 text-sm">{c.first_name} {c.last_name}</p>
                          <Badge variant={cst.variant} size="sm">{cst.label}</Badge>
                        </div>
                        {c.email && <p className="text-xs text-slate-500">{c.email}</p>}
                      </div>
                      {c.score_global !== null && (
                        <p className={`text-lg font-bold ${scoreColor(c.score_global)}`}>{c.score_global}</p>
                      )}
                      <ChevronRight size={15} className="text-slate-300 shrink-0" />
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
