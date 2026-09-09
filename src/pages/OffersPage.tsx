import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, MapPin, Clock, Users, ChevronRight, Briefcase } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Input } from '../components/ui/Input'

interface Offer {
  id: string
  title: string
  company: string
  location: string | null
  contract_type: string | null
  status: string
  created_at: string
  candidate_count?: number
}

const statusMap: Record<string, { label: string; variant: 'blue' | 'green' | 'orange' | 'red' | 'gray' }> = {
  draft: { label: 'Brouillon', variant: 'gray' },
  active: { label: 'Active', variant: 'green' },
  paused: { label: 'En pause', variant: 'orange' },
  closed: { label: 'Fermée', variant: 'red' },
}

export function OffersPage() {
  const { profile } = useAuth()
  const [offers, setOffers] = useState<Offer[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    const fetchOffers = async () => {
      if (!profile?.organization_id) return
      const { data } = await supabase
        .from('job_offers')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('created_at', { ascending: false })

      if (data) {
        const offerIds = data.map(o => o.id)
        const { data: counts } = await supabase
          .from('candidates')
          .select('job_offer_id')
          .in('job_offer_id', offerIds)

        const countMap: Record<string, number> = {}
        counts?.forEach(c => {
          if (c.job_offer_id) countMap[c.job_offer_id] = (countMap[c.job_offer_id] || 0) + 1
        })

        setOffers(data.map(o => ({ ...o, candidate_count: countMap[o.id] || 0 })))
      }
      setLoading(false)
    }
    fetchOffers()
  }, [profile?.organization_id])

  const filtered = offers.filter(o =>
    o.title.toLowerCase().includes(search.toLowerCase()) ||
    o.company.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Offres d'emploi</h1>
          <p className="text-slate-500 mt-1">{offers.length} offre{offers.length !== 1 ? 's' : ''}</p>
        </div>
        <Link to="/offres/nouvelle">
          <Button>
            <Plus size={18} />
            Nouvelle offre
          </Button>
        </Link>
      </div>

      {offers.length > 0 && (
        <div className="mb-6">
          <Input
            placeholder="Rechercher une offre..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <div key={i} className="h-24 bg-white rounded-2xl border border-slate-200 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
          <Briefcase size={48} className="mx-auto text-slate-200 mb-4" />
          <h2 className="text-lg font-bold text-slate-900 mb-2">
            {search ? 'Aucune offre trouvée' : 'Créez votre première offre'}
          </h2>
          <p className="text-slate-500 mb-6">
            {search ? 'Modifiez votre recherche.' : 'L\'IA analysera automatiquement vos candidats par rapport à l\'offre.'}
          </p>
          {!search && (
            <Link to="/offres/nouvelle">
              <Button><Plus size={18} /> Nouvelle offre</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(offer => {
            const st = statusMap[offer.status] || { label: offer.status, variant: 'gray' as const }
            return (
              <Link key={offer.id} to={`/offres/${offer.id}`}>
                <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                    <Briefcase size={22} className="text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{offer.title}</h3>
                      <Badge variant={st.variant}>{st.label}</Badge>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{offer.company}</span>
                      {offer.location && <span className="flex items-center gap-1"><MapPin size={11} />{offer.location}</span>}
                      {offer.contract_type && <span className="flex items-center gap-1"><Clock size={11} />{offer.contract_type}</span>}
                      <span className="flex items-center gap-1"><Users size={11} />{offer.candidate_count} candidat{(offer.candidate_count || 0) !== 1 ? 's' : ''}</span>
                    </div>
                  </div>
                  <ChevronRight size={18} className="text-slate-300 shrink-0" />
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
