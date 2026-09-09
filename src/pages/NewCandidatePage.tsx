import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function NewCandidatePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [offers, setOffers] = useState<{ id: string; title: string }[]>([])
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '',
    location: '', job_offer_id: '', cv_text: '', cover_letter_text: '',
  })

  useEffect(() => {
    if (!profile?.organization_id) return
    supabase.from('job_offers')
      .select('id, title')
      .eq('organization_id', profile.organization_id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .then(({ data }) => setOffers(data || []))
  }, [profile?.organization_id])

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile?.organization_id) return
    if (!form.first_name.trim() || !form.last_name.trim()) {
      setError('Le prénom et le nom sont obligatoires.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.from('candidates').insert({
      organization_id: profile.organization_id,
      first_name: form.first_name,
      last_name: form.last_name,
      email: form.email || null,
      phone: form.phone || null,
      location: form.location || null,
      job_offer_id: form.job_offer_id || null,
      cv_text: form.cv_text || null,
      cover_letter_text: form.cover_letter_text || null,
      status: 'new',
    }).select('id').single()
    setLoading(false)
    if (error) { setError('Erreur lors de l\'ajout. Veuillez réessayer.'); return }
    navigate(`/candidats/${data.id}`)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <Link to="/candidats" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft size={16} /> Retour aux candidats
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Ajouter un candidat</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card>
          <h2 className="font-bold text-slate-900 mb-5">Informations personnelles</h2>
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input label="Prénom *" placeholder="Jean" value={form.first_name} onChange={set('first_name')} required />
              <Input label="Nom *" placeholder="Dupont" value={form.last_name} onChange={set('last_name')} required />
            </div>
            <Input label="Email" type="email" placeholder="jean.dupont@email.com" value={form.email} onChange={set('email')} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Téléphone" placeholder="+33 6 00 00 00 00" value={form.phone} onChange={set('phone')} />
              <Input label="Localisation" placeholder="Paris, France" value={form.location} onChange={set('location')} />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-slate-900 mb-5">Poste concerné</h2>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Offre d'emploi</label>
            <select
              value={form.job_offer_id}
              onChange={set('job_offer_id')}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Sélectionner une offre...</option>
              {offers.map(o => <option key={o.id} value={o.id}>{o.title}</option>)}
            </select>
            {offers.length === 0 && (
              <p className="text-xs text-slate-500">
                Aucune offre active.{' '}
                <Link to="/offres/nouvelle" className="text-blue-600 hover:underline">Créer une offre</Link>
              </p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-slate-900 mb-5">Documents</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">CV (texte)</label>
              <textarea
                rows={8}
                placeholder="Collez le texte du CV ici pour que l'IA puisse l'analyser..."
                value={form.cv_text}
                onChange={set('cv_text')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600 font-mono"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Lettre de motivation (texte)</label>
              <textarea
                rows={5}
                placeholder="Collez la lettre de motivation ici..."
                value={form.cover_letter_text}
                onChange={set('cover_letter_text')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <Button type="submit" size="lg" loading={loading} className="w-full">
          Ajouter le candidat
        </Button>
      </form>
    </div>
  )
}
