import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ChevronRight, Users, Mail, MapPin } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'

interface Candidate {
  id: string
  first_name: string
  last_name: string
  email: string | null
  location: string | null
  status: string
  score_global: number | null
  job_offer_id: string | null
  created_at: string
  job_title?: string
}

const statusConfig: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' | 'gray' | 'purple' }> = {
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

export function CandidatesPage() {
  const { profile } = useAuth()
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    const fetchCandidates = async () => {
      if (!profile?.organization_id) return
      const { data } = await supabase
        .from('candidates')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

      if (data) {
        const jobIds = [...new Set(data.map(c => c.job_offer_id).filter(Boolean))]
        const { data: jobs } = await supabase.from('job_offers').select('id, title').in('id', jobIds as string[])
        const jobMap = Object.fromEntries((jobs || []).map(j => [j.id, j.title]))
        setCandidates(data.map(c => ({ ...c, job_title: c.job_offer_id ? jobMap[c.job_offer_id] : undefined })))
      }
      setLoading(false)
    }
    fetchCandidates()
  }, [profile?.organization_id])

  const filtered = candidates.filter(c => {
    const matchSearch =
      `${c.first_name} ${c.last_name}`.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.job_title?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = filterStatus === 'all' || c.status === filterStatus
    return matchSearch && matchStatus
  })

  const uniqueStatuses = [...new Set(candidates.map(c => c.status))]

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Candidats</h1>
          <p className="text-slate-500 mt-1">{candidates.length} candidat{candidates.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/candidats/nouveau">
          <Button>
            <Plus size={18} />
            Ajouter un candidat
          </Button>
        </Link>
      </div>

      {candidates.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Rechercher..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
          <select
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600 min-w-[160px]"
          >
            <option value="all">Tous les statuts</option>
            {uniqueStatuses.map(s => (
              <option key={s} value={s}>{statusConfig[s]?.label || s}</option>
            ))}
          </select>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Users size={48} className="mx-auto text-slate-200 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            {search || filterStatus !== 'all' ? 'Aucun résultat' : 'Ajoutez votre premier candidat'}
          </h2>
          <p className="text-slate-500 mb-6">
            {search || filterStatus !== 'all'
              ? 'Modifiez votre recherche ou vos filtres.'
              : 'L\'IA analysera et scorera chaque candidat automatiquement.'}
          </p>
          {!search && filterStatus === 'all' && (
            <Link to="/candidats/nouveau">
              <Button><Plus size={18} /> Ajouter un candidat</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(c => {
            const st = statusConfig[c.status] || { label: c.status, variant: 'gray' as const }
            return (
              <Link key={c.id} to={`/candidats/${c.id}`}>
                <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                    <span className="text-blue-700 font-bold text-sm">
                      {c.first_name[0]}{c.last_name[0]}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-900">{c.first_name} {c.last_name}</p>
                      <Badge variant={st.variant} size="sm">{st.label}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      {c.job_title && <span>{c.job_title}</span>}
                      {c.email && <span className="flex items-center gap-1"><Mail size={11} />{c.email}</span>}
                      {c.location && <span className="flex items-center gap-1"><MapPin size={11} />{c.location}</span>}
                    </div>
                  </div>
                  {c.score_global !== null && (
                    <div className="text-center shrink-0">
                      <p className={`text-xl font-bold ${
                        c.score_global >= 75 ? 'text-green-600' :
                        c.score_global >= 50 ? 'text-orange-500' : 'text-red-500'
                      }`}>{c.score_global}</p>
                      <p className="text-xs text-slate-400">/100</p>
                    </div>
                  )}
                  <ChevronRight size={16} className="text-slate-300 shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
