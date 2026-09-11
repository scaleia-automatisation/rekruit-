import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Wand2, Globe, FileText, Loader2 } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { analyzeOffer } from '../lib/ai'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

const contractTypes = ['CDI', 'CDD', 'Stage', 'Alternance', 'Freelance']
const remotePolicies = ['Présentiel', 'Hybride', 'Full Remote']
const workSchedules = ['Temps plein', 'Temps partiel', 'Autre']

type OfferForm = {
  title: string
  company: string
  sector: string
  location: string
  remote_policy: string
  contract_type: string
  work_schedule: string
  salary_range: string
  start_date: string
  description: string
  missions: string
  skills: string
  experience: string
  education: string
  languages: string
  benefits: string
  team_size: string
  mandatory_criteria: string
  preferred_criteria: string
  recruitment_process: string
  full_offer: string
}

function buildMarkdown(f: OfferForm): string {
  const lines: string[] = []
  if (f.title) lines.push(`# ${f.title}`)
  const meta = [f.company, f.sector, f.location, f.remote_policy, f.contract_type, f.work_schedule, f.salary_range].filter(Boolean).join(' · ')
  if (meta) lines.push(`**${meta}**`)
  if (f.start_date) lines.push(`\n*Prise de poste : ${f.start_date}*`)
  if (f.description) lines.push(`\n## Description\n${f.description}`)
  if (f.missions) lines.push(`\n## Missions\n${f.missions}`)
  if (f.skills) lines.push(`\n## Compétences requises\n${f.skills}`)
  if (f.experience) lines.push(`\n## Expérience\n${f.experience}`)
  if (f.education) lines.push(`\n## Formation\n${f.education}`)
  if (f.languages) lines.push(`\n## Langues\n${f.languages}`)
  if (f.benefits) lines.push(`\n## Avantages\n${f.benefits}`)
  if (f.team_size) lines.push(`\n## Équipe\n${f.team_size}`)
  if (f.mandatory_criteria) lines.push(`\n## Critères obligatoires\n${f.mandatory_criteria}`)
  if (f.preferred_criteria) lines.push(`\n## Critères appréciés\n${f.preferred_criteria}`)
  if (f.recruitment_process) lines.push(`\n## Processus de recrutement\n${f.recruitment_process}`)
  return lines.join('\n')
}

const emptyForm: OfferForm = {
  title: '', company: '', sector: '', location: '', remote_policy: 'Présentiel',
  contract_type: 'CDI', work_schedule: 'Temps plein', salary_range: '',
  start_date: '', description: '', missions: '', skills: '', experience: '',
  education: '', languages: '', benefits: '', team_size: '',
  mandatory_criteria: '', preferred_criteria: '', recruitment_process: '', full_offer: '',
}

export function NewOfferPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState<'text' | 'url'>('text')
  const [inputText, setInputText] = useState('')
  const [inputUrl, setInputUrl] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [form, setForm] = useState<OfferForm>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const set = (k: keyof OfferForm, v: string) => setForm(f => {
    const next = { ...f, [k]: v }
    if (k !== 'full_offer') next.full_offer = buildMarkdown(next)
    return next
  })

  const runAnalysis = async () => {
    const params = tab === 'text' ? { text: inputText } : { url: inputUrl }
    if (!params.text && !params.url) return
    setAnalyzing(true)
    setError('')
    try {
      const data = await analyzeOffer(params)
      setForm(f => {
        const next = { ...f } as OfferForm
        for (const [k, v] of Object.entries(data)) {
          if (v !== null && v !== undefined && v !== '' && k in next) {
            (next as Record<string, string>)[k] = String(v)
          }
        }
        if (!next.full_offer) next.full_offer = buildMarkdown(next)
        return next
      })
      setAnalyzed(true)
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg.includes('Error:') ? msg.replace('Error: ', '') : "Analyse impossible. Vérifiez votre connexion ou collez le texte directement.")
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

  const SelectField = ({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white"
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  )

  const TextareaField = ({ label, value, onChange, rows = 3, mono = false }: { label: string; value: string; onChange: (v: string) => void; rows?: number; mono?: boolean }) => (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        rows={rows}
        className={`w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none ${mono ? 'font-mono resize-y' : ''}`}
      />
    </div>
  )

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
          <div className="space-y-1.5">
            <textarea
              placeholder="Collez ici le texte complet de l'offre d'emploi (jusqu'à 2 500 mots)..."
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              rows={14}
              maxLength={20000}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y overflow-y-scroll"
            />
            <div className="flex justify-between text-xs text-slate-400">
              <span>Conseil : sélectionnez tout le texte de la page de l'offre (Ctrl+A) puis collez ici</span>
              <span className={inputText.trim().split(/\s+/).filter(Boolean).length > 2500 ? 'text-red-500 font-medium' : ''}>
                {inputText.trim() ? inputText.trim().split(/\s+/).filter(Boolean).length : 0} / 2 500 mots
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <Input
              label="URL de l'offre"
              type="url"
              placeholder="https://..."
              value={inputUrl}
              onChange={e => setInputUrl(e.target.value)}
            />
            <div className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-xs text-slate-500 space-y-1.5">
              <p className="font-semibold text-slate-600">✅ Sites compatibles (lien direct)</p>
              <p className="flex flex-wrap gap-x-3 gap-y-1">
                <span>• Welcome to the Jungle</span>
                <span>• HelloWork</span>
                <span>• Jobteaser</span>
                <span>• Cadremploi</span>
                <span>• RegionsJob</span>
                <span>• LesJeudis</span>
                <span>• Wizbii</span>
                <span>• Site carrière de l'entreprise</span>
              </p>
              <p className="font-semibold text-slate-600 pt-0.5">❌ Sites bloqués — utilisez l'onglet "Coller le texte"</p>
              <p className="flex flex-wrap gap-x-3 gap-y-1">
                <span>• Indeed</span>
                <span>• LinkedIn</span>
                <span>• Glassdoor</span>
                <span>• Monster</span>
                <span>• APEC</span>
                <span>• France Travail</span>
              </p>
              <p className="text-slate-400 italic pt-0.5">
                💡 Pour ces sites : ouvrez la fiche de l'offre dans votre navigateur, sélectionnez tout le texte de la page (Ctrl+A puis Ctrl+C), puis cliquez sur <strong className="text-slate-500 not-italic">"Coller le texte"</strong> et collez (Ctrl+V).
              </p>
            </div>
          </div>
        )}

        <div className="mt-4">
          <Button onClick={runAnalysis} disabled={analyzing || (!inputText && !inputUrl)}>
            {analyzing ? <Loader2 size={16} className="animate-spin" /> : <Wand2 size={16} />}
            {analyzing ? 'Analyse en cours...' : analyzed ? "Ré-analyser avec l'IA" : "Analyser avec l'IA"}
          </Button>
          {analyzed && <span className="ml-3 text-sm text-green-600 font-medium">✓ Champs extraits automatiquement</span>}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
      )}

      {/* Form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-6">
        <h2 className="font-bold text-slate-900">Détails de l'offre</h2>

        {/* Identité du poste */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Poste</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Titre du poste *" value={form.title} onChange={e => set('title', e.target.value)} />
            <Input label="Entreprise *" value={form.company} onChange={e => set('company', e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Secteur d'activité" value={form.sector} onChange={e => set('sector', e.target.value)} placeholder="Ex: Technologie, Santé, Finance…" />
            <Input label="Date de prise de poste" value={form.start_date} onChange={e => set('start_date', e.target.value)} placeholder="Ex: Immédiat, Janvier 2026…" />
          </div>
        </div>

        {/* Localisation & modalités */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Localisation & Modalités</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Lieu" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ville, Pays" />
            <SelectField label="Télétravail" value={form.remote_policy} onChange={v => set('remote_policy', v)} options={remotePolicies} />
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <SelectField label="Type de contrat" value={form.contract_type} onChange={v => set('contract_type', v)} options={contractTypes} />
            <SelectField label="Horaires" value={form.work_schedule} onChange={v => set('work_schedule', v)} options={workSchedules} />
            <Input label="Rémunération" value={form.salary_range} onChange={e => set('salary_range', e.target.value)} placeholder="Ex: 40-50k€" />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Description</p>
          <TextareaField label="Description du poste" value={form.description} onChange={v => set('description', v)} rows={4} />
          <TextareaField label="Missions & Responsabilités" value={form.missions} onChange={v => set('missions', v)} rows={5} />
        </div>

        {/* Profil recherché */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Profil recherché</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextareaField label="Compétences techniques & outils" value={form.skills} onChange={v => set('skills', v)} rows={4} />
            <div className="space-y-4">
              <Input label="Expérience requise" value={form.experience} onChange={e => set('experience', e.target.value)} placeholder="Ex: 3 ans minimum" />
              <Input label="Formation / Diplôme" value={form.education} onChange={e => set('education', e.target.value)} placeholder="Ex: Bac+5 Informatique" />
              <Input label="Langues" value={form.languages} onChange={e => set('languages', e.target.value)} placeholder="Ex: Français, Anglais C1" />
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextareaField label="Critères obligatoires (must-have)" value={form.mandatory_criteria} onChange={v => set('mandatory_criteria', v)} rows={3} />
            <TextareaField label="Critères appréciés (nice-to-have)" value={form.preferred_criteria} onChange={v => set('preferred_criteria', v)} rows={3} />
          </div>
        </div>

        {/* Contexte & avantages */}
        <div className="space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Contexte & Avantages</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <TextareaField label="Avantages & Bénéfices" value={form.benefits} onChange={v => set('benefits', v)} rows={3} />
            <TextareaField label="Taille & contexte de l'équipe" value={form.team_size} onChange={v => set('team_size', v)} rows={3} />
          </div>
          <TextareaField label="Processus de recrutement" value={form.recruitment_process} onChange={v => set('recruitment_process', v)} rows={3} />
        </div>

        {/* Toute l'offre */}
        <div className="space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Synthèse complète</p>
          <label className="block text-sm font-medium text-slate-700">
            Toute l'offre <span className="text-slate-400 font-normal">(Markdown — généré automatiquement, modifiable)</span>
          </label>
          <textarea
            value={form.full_offer}
            onChange={e => setForm(f => ({ ...f, full_offer: e.target.value }))}
            rows={16}
            placeholder="L'analyse IA remplira ce champ automatiquement avec l'intégralité de l'offre en Markdown structuré."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
          />
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
