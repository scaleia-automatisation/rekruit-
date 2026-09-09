import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Wand2, Globe, FileText, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { analyzeOffer } from '../lib/ai'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const contractTypes = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance']

export function NewOfferPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'text' | 'url'>('text')
  const [inputText, setInputText] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [form, setForm] = useState({
    title: '', company: '', location: '', contract_type: 'CDI', salary_range: '',
    description: '', missions: '', skills: '', experience: '', education: '',
    languages: '', mandatory_criteria: '', preferred_criteria: '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const runAnalysis = async () => {
    const params = tab === 'text' ? { text: inputText } : { url: inputUrl }
    if (!params.text && !params.url) return
    setAnalyzing(true)
    setError('')
    try {
      const data = await analyzeOffer(params)
      setForm(f => ({ ...f, ...Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null && v !== undefined && v !== '')) }))
      setAnalyzed(true)
    } catch {
      setError("Analyse impossible. Vérifiez votre connexion ou collez le texte directement.")
    } finally {
      setAnalyzing(false)
    }
  }

  const handleSave = async () => {
    if (!form.title || !form.company) { setError('Titre et entreprise requis.'); return }
    if (!profile?.organization_id) return
    setSaving(true)
    const { data, error: err } = await supabase.from('job_offers').insert({
      ...form,
      organization_id: profile.organization_id,
      status: 'active',
    }).select().single()
    if (err) { setError('Erreur lors de la sauvegarde.'); setSaving(false); return }
    navigate(`/offres/${data.id}`)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/offres" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Retour
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Nouvelle offre</h1>
      </div>

      {/* Input section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setTab('text')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'text' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <FileText size={15} /> Coller le texte
          </button>
          <button
            onClick={() => setTab('url')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'url' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            <Globe size={15} /> Importer depuis URL
          </button>
        </div>

        {tab === 'text' ? (
          <textarea
            placeholder="Collez ici le texte de l'offre d'emploi..."
            value={inputText}
            onChange={e => setInputText(e.target.value)}
            rows={6}
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
          />
        ) : (
          <Input
            label="URL de l'offre"
            type="url"
            placeholder="https://..."
            value={inputUrl}
            onChange={e => setInputUrl(e.target.value)}
          />
        )}

        <div className="mt-4">
          <Button onClick={runAnalysis} disabled={analyzing || (!inputText && !inputUrl)}>
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {analyzing ? 'Analyse en cours...' : analyzed ? 'Ré-analyser avec l\'IA' : 'Analyser avec l\'IA'}
          </Button>
          {analyzed && <span className="ml-3 text-sm text-green-600 font-medium">✓ Champs extraits automatiquement</span>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-5">
        <h2 className="font-bold text-slate-900">Détails de l'offre</h2>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Titre du poste *" value={form.title} onChange={e => set('title', e.target.value)} required />
          <Input label="Entreprise *" value={form.company} onChange={e => set('company', e.target.value)} required />
        </div>
        <div className="grid sm:grid-cols-3 gap-4">
          <Input label="Lieu" value={form.location} onChange={e => set('location', e.target.value)} />
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Type de contrat</label>
            <select
              value={form.contract_type}
              onChange={e => set('contract_type', e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              {contractTypes.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <Input label="Salaire" value={form.salary_range} onChange={e => set('salary_range', e.target.value)} placeholder="Ex: 40-50k€" />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
          <textarea value={form.description} onChange={e => set('description', e.target.value)} rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Missions</label>
          <textarea value={form.missions} onChange={e => set('missions', e.target.value)} rows={3}
            className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Compétences requises</label>
            <textarea value={form.skills} onChange={e => set('skills', e.target.value)} rows={3}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none" />
          </div>
          <div className="space-y-4">
            <Input label="Expérience requise" value={form.experience} onChange={e => set('experience', e.target.value)} />
            <Input label="Formation" value={form.education} onChange={e => set('education', e.target.value)} />
            <Input label="Langues" value={form.languages} onChange={e => set('languages', e.target.value)} />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <Button onClick={handleSave} loading={saving} disabled={!form.title || !form.company}>
            Créer l'offre
          </Button>
          <Link to="/offres">
            <Button variant="secondary">Annuler</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
