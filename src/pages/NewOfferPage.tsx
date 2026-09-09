import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function NewOfferPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    company: profile?.organization_id ? '' : '',
    location: '',
    contract_type: '',
    description: '',
    missions: '',
    skills: '',
    experience: '',
    education: '',
    mandatory_criteria: '',
    preferred_criteria: '',
  })

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent, status: 'draft' | 'active' = 'active') => {
    e.preventDefault()
    if (!profile?.organization_id) return
    if (!form.title.trim() || !form.company.trim()) {
      setError('Le titre et l\'entreprise sont obligatoires.')
      return
    }
    setLoading(true)
    const { data, error } = await supabase.from('job_offers').insert({
      organization_id: profile.organization_id,
      created_by: profile.id,
      ...form,
      status,
    }).select('id').single()

    setLoading(false)
    if (error) { setError('Erreur lors de la création. Veuillez réessayer.'); return }
    navigate(`/offres/${data.id}`)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <Link to="/offres" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-6">
        <ArrowLeft size={16} /> Retour aux offres
      </Link>

      <h1 className="text-2xl font-bold text-slate-900 mb-8">Nouvelle offre d'emploi</h1>

      <form onSubmit={e => handleSubmit(e, 'active')} className="flex flex-col gap-6">
        <Card>
          <h2 className="font-bold text-slate-900 mb-5">Informations générales</h2>
          <div className="flex flex-col gap-4">
            <Input label="Titre du poste *" placeholder="ex: Développeur Full-Stack React" value={form.title} onChange={set('title')} required />
            <Input label="Entreprise *" placeholder="ex: Ma Société SAS" value={form.company} onChange={set('company')} required />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Localisation" placeholder="ex: Paris, Télétravail" value={form.location} onChange={set('location')} />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-slate-700">Type de contrat</label>
                <select
                  value={form.contract_type}
                  onChange={set('contract_type')}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">Sélectionner...</option>
                  <option>CDI</option><option>CDD</option><option>Stage</option>
                  <option>Alternance</option><option>Freelance</option><option>Interim</option>
                </select>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-slate-900 mb-5">Description du poste</h2>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Description générale</label>
              <textarea
                rows={5}
                placeholder="Décrivez le poste, le contexte, la mission principale..."
                value={form.description}
                onChange={set('description')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Missions principales</label>
              <textarea
                rows={4}
                placeholder="Liste des missions et responsabilités..."
                value={form.missions}
                onChange={set('missions')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="font-bold text-slate-900 mb-5">Profil recherché</h2>
          <div className="flex flex-col gap-4">
            <Input label="Compétences requises" placeholder="ex: React, TypeScript, Node.js..." value={form.skills} onChange={set('skills')} />
            <div className="grid sm:grid-cols-2 gap-4">
              <Input label="Expérience" placeholder="ex: 3-5 ans d'expérience" value={form.experience} onChange={set('experience')} />
              <Input label="Formation" placeholder="ex: Bac+5 Informatique" value={form.education} onChange={set('education')} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Critères obligatoires</label>
              <textarea
                rows={3}
                placeholder="Critères non négociables pour ce poste..."
                value={form.mandatory_criteria}
                onChange={set('mandatory_criteria')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-slate-700">Critères souhaités</label>
              <textarea
                rows={3}
                placeholder="Un plus mais non obligatoire..."
                value={form.preferred_criteria}
                onChange={set('preferred_criteria')}
                className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 resize-none focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </Card>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
        )}

        <div className="flex flex-col sm:flex-row gap-3">
          <Button type="submit" size="lg" loading={loading} className="flex-1">
            Publier l'offre
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={e => handleSubmit(e as any, 'draft')}
            disabled={loading}
          >
            Enregistrer en brouillon
          </Button>
        </div>
      </form>
    </div>
  )
}
