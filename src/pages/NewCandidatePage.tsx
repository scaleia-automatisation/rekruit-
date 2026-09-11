import { useState, useRef, useEffect } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { ArrowLeft, Upload, FileText, Wand2, Loader2, X } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { analyzeCandidate } from '../lib/ai'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'

export function NewCandidatePage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const preselectedJobId = searchParams.get('offre')

  const [cvFile, setCvFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverText, setCoverText] = useState('')
  const [coverTab, setCoverTab] = useState<'file' | 'text'>('file')
  const [analyzing, setAnalyzing] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)
  const [jobOffer, setJobOffer] = useState<{ id: string; title: string; company: string; description?: string; skills?: string; experience?: string } | null>(null)
  const [jobOffers, setJobOffers] = useState<{ id: string; title: string; company: string }[]>([])
  const [selectedJobId, setSelectedJobId] = useState(preselectedJobId || '')

  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', phone: '', location: '',
  })
  const [aiData, setAiData] = useState<Record<string, unknown> | null>(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      if (!profile?.organization_id) return
      const { data } = await supabase.from('job_offers').select('id, title, company, description, skills, experience')
        .eq('organization_id', profile.organization_id).eq('status', 'active')
      if (data) setJobOffers(data)
      if (preselectedJobId && data) {
        const found = data.find(j => j.id === preselectedJobId)
        if (found) setJobOffer(found)
      }
    }
    load()
  }, [profile?.organization_id, preselectedJobId])

  useEffect(() => {
    if (selectedJobId) {
      const found = jobOffers.find(j => j.id === selectedJobId) || null
      setJobOffer(found)
    } else {
      setJobOffer(null)
    }
  }, [selectedJobId, jobOffers])

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const runAnalysis = async (file: File, cover?: File | null) => {
    setAnalyzing(true)
    setAnalyzed(false)
    setError('')
    try {
      const params: Record<string, unknown> = { job_offer: jobOffer || undefined }
      if (file.type === 'application/pdf') {
        params.cv_base64 = await fileToBase64(file)
        params.cv_media_type = 'application/pdf'
      } else {
        params.cv_text = await file.text()
      }
      if (cover) {
        params.cover_letter_text = await cover.text()
      } else if (coverText.trim()) {
        params.cover_letter_text = coverText.trim()
      }

      const data = await analyzeCandidate(params as Parameters<typeof analyzeCandidate>[0])
      setAiData(data)
      setForm({
        first_name: data.first_name || '',
        last_name: data.last_name || '',
        email: data.email || '',
        phone: data.phone || '',
        location: data.location || '',
      })
      setAnalyzed(true)
    } catch {
      setError("Analyse impossible. Vérifiez le format du fichier ou renseignez les informations manuellement.")
    } finally {
      setAnalyzing(false)
    }
  }

  const selectCv = (file: File) => {
    setCvFile(file)
    runAnalysis(file, coverFile)
  }

  const handleSave = async () => {
    if (!form.first_name || !form.last_name) { setError('Prénom et nom requis.'); return }
    if (!profile?.organization_id) return
    setSaving(true)

    let cvUrl: string | null = null
    if (cvFile) {
      const ext = cvFile.name.split('.').pop()
      const path = `${profile.organization_id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage.from('cvs').upload(path, cvFile)
      if (!upErr) {
        const { data: urlData } = supabase.storage.from('cvs').getPublicUrl(path)
        cvUrl = urlData.publicUrl
      }
    }

    let coverLetterText = coverText.trim() || null
    if (!coverLetterText && coverFile) {
      coverLetterText = await coverFile.text()
    }

    const payload: Record<string, unknown> = {
      ...form,
      organization_id: profile.organization_id,
      job_offer_id: selectedJobId || null,
      status: 'new',
      cv_file_url: cvUrl,
      cover_letter: coverLetterText,
    }

    if (aiData) {
      Object.assign(payload, {
        score_global: aiData.score_global,
        score_skills: aiData.score_skills,
        score_experience: aiData.score_experience,
        score_education: aiData.score_education,
        score_job_match: aiData.score_job_match,
        score_letter: aiData.score_letter,
        recommendation: aiData.recommendation,
        ai_summary: aiData.ai_summary,
        ai_strengths: aiData.ai_strengths,
        ai_weaknesses: aiData.ai_weaknesses,
        missing_skills: aiData.missing_skills,
        progression: aiData.progression || 20,
        cv_text: typeof aiData.cv_text === 'string' ? aiData.cv_text : undefined,
        status: 'analyzed',
      })
    }

    const { data, error: err } = await supabase.from('candidates').insert(payload).select().single()
    if (err) { setError('Erreur lors de la sauvegarde.'); setSaving(false); return }
    navigate(`/candidats/${data.id}`)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) selectCv(file)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-3xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link to="/candidats" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Retour
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">Ajouter un candidat</h1>
      </div>

      {/* Job offer selector */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-3">Offre associée</h2>
        <select
          value={selectedJobId}
          onChange={e => setSelectedJobId(e.target.value)}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
          <option value="">Sans offre associée</option>
          {jobOffers.map(j => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
        </select>
      </div>

      {/* CV Upload */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-4">CV du candidat</h2>
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
            dragOver ? 'border-blue-400 bg-blue-50' : cvFile ? 'border-green-300 bg-green-50' : 'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
          }`}
        >
          <input ref={fileRef} type="file" accept=".pdf,.txt,.doc,.docx" onChange={e => { const f = e.target.files?.[0]; if (f) selectCv(f) }} className="hidden" />
          {cvFile ? (
            <div className="flex items-center justify-center gap-3">
              <FileText size={24} className="text-green-600" />
              <span className="font-medium text-green-700">{cvFile.name}</span>
              <button onClick={e => { e.stopPropagation(); setCvFile(null); setAnalyzed(false) }} className="text-slate-400 hover:text-red-500">
                <X size={16} />
              </button>
            </div>
          ) : (
            <>
              <Upload size={32} className="mx-auto text-slate-300 mb-3" />
              <p className="font-medium text-slate-700">Glissez le CV ou cliquez pour sélectionner</p>
              <p className="text-xs text-slate-400 mt-1">PDF, TXT, DOC — max 10 Mo</p>
            </>
          )}
        </div>

        {/* Optional cover letter */}
        {cvFile && (
          <div className="mt-4">
            <p className="block text-sm font-medium text-slate-700 mb-2">Lettre de motivation (optionnel)</p>
            <div className="flex gap-2 mb-3">
              {(['file', 'text'] as const).map(t => (
                <button key={t} onClick={() => setCoverTab(t)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${coverTab === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                  {t === 'file' ? 'Importer un fichier' : 'Saisir / coller en Markdown'}
                </button>
              ))}
            </div>
            {coverTab === 'file' ? (
              <input type="file" accept=".pdf,.txt" onChange={e => setCoverFile(e.target.files?.[0] || null)}
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
            ) : (
              <textarea
                value={coverText}
                onChange={e => setCoverText(e.target.value)}
                placeholder={'# Lettre de motivation\n\nMadame, Monsieur,\n\n...'}
                rows={10}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-600 resize-y"
              />
            )}
          </div>
        )}

        {cvFile && !analyzing && (
          <div className="mt-4 flex items-center gap-3">
            <Button onClick={() => runAnalysis(cvFile, coverFile)} disabled={analyzing}>
              <Wand2 size={16} />
              Ré-analyser avec l'IA
            </Button>
            {analyzed && <span className="text-sm text-green-600 font-medium">✓ Informations extraites</span>}
          </div>
        )}

        {analyzing && (
          <div className="mt-4 bg-blue-50 rounded-xl p-4">
            <div className="flex items-center gap-3">
              <Loader2 size={18} className="animate-spin text-blue-600" />
              <div>
                <p className="text-sm font-medium text-blue-900">Analyse en cours...</p>
                <p className="text-xs text-blue-600 mt-0.5">Extraction des informations et calcul des scores</p>
              </div>
            </div>
          </div>
        )}

        {analyzed && aiData && (
          <div className="mt-4 grid grid-cols-3 gap-3">
            {[
              { label: 'Score global', value: aiData.score_global as number },
              { label: 'Compétences', value: aiData.score_skills as number },
              { label: 'Expérience', value: aiData.score_experience as number },
            ].map(s => s.value !== null && s.value !== undefined && (
              <div key={s.label} className="bg-slate-50 rounded-xl p-3 text-center">
                <p className={`text-2xl font-bold ${(s.value as number) >= 75 ? 'text-green-600' : (s.value as number) >= 50 ? 'text-orange-500' : 'text-red-500'}`}>
                  {s.value as number}
                </p>
                <p className="text-xs text-slate-500">{s.label}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
      )}

      {/* Candidate info form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
        <h2 className="font-bold text-slate-900">Informations du candidat</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Prénom *" value={form.first_name} onChange={e => set('first_name', e.target.value)} required autoComplete="off" />
          <Input label="Nom *" value={form.last_name} onChange={e => set('last_name', e.target.value)} required autoComplete="off" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Email" type="email" value={form.email} onChange={e => set('email', e.target.value)} autoComplete="off" />
          <Input label="Téléphone" value={form.phone} onChange={e => set('phone', e.target.value)} autoComplete="off" />
        </div>
        <Input label="Localisation" value={form.location} onChange={e => set('location', e.target.value)} placeholder="Ville, Pays" autoComplete="off" />

        <div className="pt-4 border-t border-slate-100 flex gap-3">
          <Button onClick={handleSave} loading={saving} disabled={!form.first_name || !form.last_name}>
            Ajouter le candidat
          </Button>
          <Link to="/candidats">
            <Button variant="secondary">Annuler</Button>
          </Link>
        </div>
      </div>
    </div>
  )
}
