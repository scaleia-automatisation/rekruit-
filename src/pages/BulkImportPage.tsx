import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowLeft, Upload, FileText, X, CheckCircle, XCircle, Loader2,
  ChevronUp, ChevronDown, Users, Check, AlertTriangle
} from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { analyzeCandidate } from '../lib/ai'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'

const MAX_FILES = 20
const BATCH_SIZE = 4

type SortKey = 'score_global' | 'first_name' | 'location' | 'years_experience' | 'score_job_match'
type SortDir = 'asc' | 'desc'

interface FileEntry {
  id: string
  file: File
  status: 'pending' | 'analyzing' | 'done' | 'error'
  error?: string
  data?: Record<string, unknown>
  selected: boolean
}

export function BulkImportPage() {
  const { profile } = useAuth()
  const dropRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const [jobOffers, setJobOffers] = useState<{ id: string; title: string; company: string; description?: string; skills?: string; experience?: string }[]>([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [jobOffer, setJobOffer] = useState<typeof jobOffers[0] | null>(null)

  const [files, setFiles] = useState<FileEntry[]>([])
  const [dragOver, setDragOver] = useState(false)
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisDone, setAnalysisDone] = useState(false)

  const [sortKey, setSortKey] = useState<SortKey>('score_global')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const [saving, setSaving] = useState(false)
  const [importDone, setImportDone] = useState(false)
  const [importCount, setImportCount] = useState(0)

  useEffect(() => {
    if (!profile?.organization_id) return
    supabase.from('job_offers').select('id, title, company, description, skills, experience')
      .eq('organization_id', profile.organization_id).eq('status', 'active')
      .then(({ data }) => { if (data) setJobOffers(data) })
  }, [profile?.organization_id])

  useEffect(() => {
    setJobOffer(jobOffers.find(j => j.id === selectedJobId) || null)
  }, [selectedJobId, jobOffers])

  const addFiles = (newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles)
    const accepted = arr.filter(f =>
      /\.(pdf|txt|doc|docx|jpg|jpeg|png|webp|avif|gif|heic|heif)$/i.test(f.name)
    )
    setFiles(prev => {
      const existing = prev.map(e => e.file.name)
      const deduped = accepted.filter(f => !existing.includes(f.name))
      const combined = [...prev, ...deduped.map(f => ({
        id: crypto.randomUUID(),
        file: f,
        status: 'pending' as const,
        selected: true,
      }))]
      return combined.slice(0, MAX_FILES)
    })
  }

  const removeFile = (id: string) => setFiles(f => f.filter(e => e.id !== id))
  const toggleSelect = (id: string) => setFiles(f => f.map(e => e.id === id ? { ...e, selected: !e.selected } : e))
  const selectAll = () => setFiles(f => f.map(e => e.status === 'done' ? { ...e, selected: true } : e))
  const deselectAll = () => setFiles(f => f.map(e => ({ ...e, selected: false })))

  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve((reader.result as string).split(',')[1])
      reader.onerror = reject
      reader.readAsDataURL(file)
    })

  const convertImageToJpeg = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const img = new Image()
      const url = URL.createObjectURL(file)
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = img.naturalWidth
        canvas.height = img.naturalHeight
        canvas.getContext('2d')!.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        resolve(canvas.toDataURL('image/jpeg', 0.92).split(',')[1])
      }
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Image load failed')) }
      img.src = url
    })

  const OPENAI_VISION_TYPES = new Set(['image/jpeg', 'image/png', 'image/gif', 'image/webp'])

  const analyzeOne = async (entry: FileEntry): Promise<Partial<FileEntry>> => {
    const file = entry.file
    const mimeType = file.type || 'application/octet-stream'
    try {
      const params: Record<string, unknown> = { job_offer: jobOffer || undefined }
      if (mimeType.startsWith('text/') || mimeType === 'application/json') {
        params.cv_text = await file.text()
      } else if (mimeType.startsWith('image/') && !OPENAI_VISION_TYPES.has(mimeType)) {
        params.cv_base64 = await convertImageToJpeg(file)
        params.cv_media_type = 'image/jpeg'
      } else {
        params.cv_base64 = await fileToBase64(file)
        params.cv_media_type = mimeType
      }
      const data = await analyzeCandidate(params as Parameters<typeof analyzeCandidate>[0])
      return { status: 'done', data }
    } catch (err) {
      return { status: 'error', error: err instanceof Error ? err.message : 'Erreur analyse' }
    }
  }

  const startAnalysis = async () => {
    if (files.length === 0) return
    setAnalyzing(true)
    setAnalysisDone(false)

    const pending = files.filter(e => e.status === 'pending')

    // Process in batches of BATCH_SIZE to avoid rate limits
    for (let i = 0; i < pending.length; i += BATCH_SIZE) {
      const batch = pending.slice(i, i + BATCH_SIZE)

      // Mark batch as analyzing
      setFiles(prev => prev.map(e =>
        batch.some(b => b.id === e.id) ? { ...e, status: 'analyzing' } : e
      ))

      const results = await Promise.all(batch.map(analyzeOne))

      setFiles(prev => prev.map(e => {
        const idx = batch.findIndex(b => b.id === e.id)
        if (idx === -1) return e
        const res = results[idx]
        return { ...e, ...res, selected: res.status === 'done' }
      }))
    }

    setAnalyzing(false)
    setAnalysisDone(true)
  }

  const sortedResults = [...files].sort((a, b) => {
    if (a.status !== 'done' && b.status !== 'done') return 0
    if (a.status !== 'done') return 1
    if (b.status !== 'done') return -1
    const av = a.data?.[sortKey] as number | string | null
    const bv = b.data?.[sortKey] as number | string | null
    if (av == null && bv == null) return 0
    if (av == null) return 1
    if (bv == null) return -1
    if (typeof av === 'string' && typeof bv === 'string') {
      return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
    }
    return sortDir === 'asc' ? (av as number) - (bv as number) : (bv as number) - (av as number)
  })

  const setSort = (key: SortKey) => {
    if (sortKey === key) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir(key === 'first_name' ? 'asc' : 'desc') }
  }

  const SortIcon = ({ col }: { col: SortKey }) => {
    if (sortKey !== col) return <ChevronUp size={12} className="text-slate-300" />
    return sortDir === 'asc' ? <ChevronUp size={12} className="text-blue-600" /> : <ChevronDown size={12} className="text-blue-600" />
  }

  const handleImport = async () => {
    if (!profile?.organization_id) return
    const toImport = files.filter(e => e.status === 'done' && e.selected && e.data)
    if (toImport.length === 0) return
    setSaving(true)

    const payloads = toImport.map(entry => {
      const d = entry.data!
      return {
        organization_id: profile.organization_id,
        job_offer_id: selectedJobId || null,
        first_name: (d.first_name as string) || 'Prénom',
        last_name: (d.last_name as string) || 'Nom',
        email: (d.email as string) || null,
        phone: (d.phone as string) || null,
        location: (d.location as string) || null,
        status: 'analyzed',
        current_title: d.current_title as string | null,
        years_experience: d.years_experience as number | null,
        education_level: d.education_level as string | null,
        score_global: d.score_global as number | null,
        score_skills: d.score_skills as number | null,
        score_experience: d.score_experience as number | null,
        score_education: d.score_education as number | null,
        score_job_match: d.score_job_match as number | null,
        score_letter: null,
        recommendation: d.recommendation as string | null,
        ai_summary: d.ai_summary as string | null,
        ai_strengths: d.ai_strengths as string | null,
        ai_weaknesses: d.ai_weaknesses as string | null,
        missing_skills: d.missing_skills as string | null,
        progression: (d.progression as number) || 20,
        experiences: d.experiences || null,
        educations: d.educations || null,
        skills: d.skills || null,
      }
    })

    const { error } = await supabase.from('candidates').insert(payloads)
    if (error) {
      alert(`Erreur lors de l'import : ${error.message}`)
      setSaving(false)
      return
    }

    setImportCount(toImport.length)
    setImportDone(true)
    setSaving(false)
  }

  const doneCount = files.filter(e => e.status === 'done').length
  const errorCount = files.filter(e => e.status === 'error').length
  const selectedCount = files.filter(e => e.status === 'done' && e.selected).length
  const analyzingCount = files.filter(e => e.status === 'analyzing').length

  const scoreColor = (s: number | null | undefined) => {
    if (s == null) return 'text-slate-400'
    if (s >= 75) return 'text-green-600 font-bold'
    if (s >= 50) return 'text-orange-500 font-bold'
    return 'text-red-500 font-bold'
  }

  const recoBadge = (r: string | null | undefined) => {
    if (r === 'GO') return <Badge variant="green">GO</Badge>
    if (r === 'MAYBE') return <Badge variant="orange">MAYBE</Badge>
    if (r === 'NO') return <Badge variant="red">NO</Badge>
    return null
  }

  if (importDone) {
    return (
      <div className="p-4 sm:p-8 max-w-2xl mx-auto text-center">
        <div className="bg-white rounded-3xl border border-slate-200 p-12">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{importCount} candidat{importCount > 1 ? 's' : ''} importé{importCount > 1 ? 's' : ''} !</h2>
          <p className="text-slate-500 mb-8">
            {jobOffer
              ? `Tous les profils ont été ajoutés à l'offre "${jobOffer.title}" et triés par score IA.`
              : 'Tous les profils ont été ajoutés à votre base candidats.'}
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link to={selectedJobId ? `/offres/${selectedJobId}` : '/candidats'}>
              <Button><Users size={16} /> Voir les candidats</Button>
            </Link>
            <Button variant="secondary" onClick={() => { setFiles([]); setAnalysisDone(false); setImportDone(false) }}>
              Nouvel import
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link to="/candidats" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft size={16} /> Retour
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Import en lot de CV</h1>
          <p className="text-sm text-slate-500 mt-0.5">Analysez jusqu'à {MAX_FILES} CV en une seule fois avec l'IA</p>
        </div>
      </div>

      {/* Job offer */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="font-bold text-slate-900 mb-3">Offre associée</h2>
        <p className="text-sm text-slate-500 mb-3">
          Sélectionner une offre permet à l'IA de calculer le score d'adéquation de chaque candidat au poste.
        </p>
        <select
          value={selectedJobId}
          onChange={e => setSelectedJobId(e.target.value)}
          disabled={analyzing}
          className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 disabled:opacity-50"
        >
          <option value="">Sans offre associée</option>
          {jobOffers.map(j => <option key={j.id} value={j.id}>{j.title} — {j.company}</option>)}
        </select>
      </div>

      {/* Drop zone — hidden once analysis started */}
      {!analysisDone && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-900">CV à analyser</h2>
            <span className="text-sm text-slate-400">{files.length} / {MAX_FILES} fichiers</span>
          </div>

          <div
            ref={dropRef}
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={e => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files) }}
            onClick={() => !analyzing && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all mb-4 ${
              dragOver ? 'border-blue-400 bg-blue-50' :
              files.length >= MAX_FILES ? 'border-slate-200 opacity-50 cursor-not-allowed' :
              'border-slate-200 hover:border-blue-300 hover:bg-slate-50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              multiple
              accept=".pdf,.txt,.doc,.docx,.jpg,.jpeg,.png,.webp,.avif,.gif,.heic,.heif"
              className="hidden"
              onChange={e => { if (e.target.files) addFiles(e.target.files) }}
              disabled={analyzing || files.length >= MAX_FILES}
            />
            <Upload size={36} className="text-slate-300 mx-auto mb-3" />
            <p className="font-semibold text-slate-700">Glissez-déposez vos CV ici</p>
            <p className="text-sm text-slate-400 mt-1">ou cliquez pour sélectionner — PDF, Word, Images, TXT</p>
            <p className="text-xs text-slate-300 mt-2">Maximum {MAX_FILES} fichiers par import</p>
          </div>

          {/* File list */}
          {files.length > 0 && (
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {files.map(entry => (
                <div key={entry.id} className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-2.5">
                  <FileText size={16} className="text-slate-400 shrink-0" />
                  <span className="text-sm text-slate-700 flex-1 truncate">{entry.file.name}</span>
                  <span className="text-xs text-slate-400 shrink-0">
                    {(entry.file.size / 1024).toFixed(0)} Ko
                  </span>
                  {!analyzing && (
                    <button onClick={() => removeFile(entry.id)} className="text-slate-300 hover:text-red-500 transition-colors shrink-0">
                      <X size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={startAnalysis}
              disabled={files.length === 0 || analyzing}
              loading={analyzing}
            >
              {analyzing
                ? `Analyse en cours… (${doneCount + errorCount}/${files.length})`
                : `Analyser ${files.length > 0 ? files.length + ' CV' : 'les CV'}`}
            </Button>
            {files.length > 0 && !analyzing && (
              <Button variant="secondary" onClick={() => setFiles([])}>
                <X size={15} /> Tout effacer
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Progress during analysis */}
      {analyzing && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Loader2 size={18} className="animate-spin text-blue-600" />
            <h2 className="font-bold text-slate-900">
              Analyse IA en cours — {doneCount + errorCount}/{files.length}
            </h2>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${files.length ? ((doneCount + errorCount) / files.length) * 100 : 0}%` }}
            />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {files.map(entry => (
              <div key={entry.id} className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium border ${
                entry.status === 'analyzing' ? 'bg-blue-50 border-blue-200 text-blue-700' :
                entry.status === 'done' ? 'bg-green-50 border-green-200 text-green-700' :
                entry.status === 'error' ? 'bg-red-50 border-red-200 text-red-700' :
                'bg-slate-50 border-slate-200 text-slate-500'
              }`}>
                {entry.status === 'analyzing' && <Loader2 size={12} className="animate-spin shrink-0" />}
                {entry.status === 'done' && <Check size={12} className="shrink-0" />}
                {entry.status === 'error' && <AlertTriangle size={12} className="shrink-0" />}
                {entry.status === 'pending' && <div className="w-3 h-3 rounded-full bg-slate-300 shrink-0" />}
                <span className="truncate">{entry.file.name.replace(/\.[^.]+$/, '')}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results table */}
      {analysisDone && doneCount > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden mb-6">
          {/* Table header */}
          <div className="p-5 border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
            <div>
              <h2 className="font-bold text-slate-900">
                {doneCount} profil{doneCount > 1 ? 's' : ''} analysé{doneCount > 1 ? 's' : ''}
                {errorCount > 0 && <span className="text-red-500 font-normal text-sm ml-2">· {errorCount} erreur{errorCount > 1 ? 's' : ''}</span>}
              </h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {selectedCount} sélectionné{selectedCount > 1 ? 's' : ''} pour l'import — décochez les profils à exclure
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={selectAll} className="text-xs text-blue-600 hover:underline">Tout sélectionner</button>
              <span className="text-slate-300">·</span>
              <button onClick={deselectAll} className="text-xs text-slate-500 hover:underline">Tout désélectionner</button>
            </div>
          </div>

          {/* Sort bar */}
          <div className="hidden sm:grid grid-cols-[32px_1fr_80px_80px_100px_120px_80px] gap-2 px-5 py-2.5 bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wide">
            <div />
            <button className="flex items-center gap-1 text-left hover:text-slate-700 transition-colors" onClick={() => setSort('first_name')}>
              Candidat <SortIcon col="first_name" />
            </button>
            <button className="flex items-center gap-1 hover:text-slate-700 transition-colors" onClick={() => setSort('score_global')}>
              Score <SortIcon col="score_global" />
            </button>
            <button className="flex items-center gap-1 hover:text-slate-700 transition-colors" onClick={() => setSort('score_job_match')}>
              Match <SortIcon col="score_job_match" />
            </button>
            <div>Reco</div>
            <button className="flex items-center gap-1 hover:text-slate-700 transition-colors" onClick={() => setSort('location')}>
              Ville <SortIcon col="location" />
            </button>
            <button className="flex items-center gap-1 hover:text-slate-700 transition-colors" onClick={() => setSort('years_experience')}>
              Exp. <SortIcon col="years_experience" />
            </button>
          </div>

          {/* Rows */}
          <div className="divide-y divide-slate-100">
            {sortedResults.filter(e => e.status === 'done' || e.status === 'error').map(entry => {
              const d = entry.data
              if (entry.status === 'error') {
                return (
                  <div key={entry.id} className="flex items-center gap-3 px-5 py-3 bg-red-50 opacity-70">
                    <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center shrink-0">
                      <XCircle size={16} className="text-red-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-red-700 truncate">{entry.file.name}</p>
                      <p className="text-xs text-red-400">{entry.error}</p>
                    </div>
                  </div>
                )
              }
              return (
                <div
                  key={entry.id}
                  onClick={() => toggleSelect(entry.id)}
                  className={`grid grid-cols-[32px_1fr] sm:grid-cols-[32px_1fr_80px_80px_100px_120px_80px] gap-2 px-5 py-3.5 cursor-pointer transition-colors items-center ${
                    entry.selected ? 'hover:bg-blue-50/30' : 'opacity-50 bg-slate-50 hover:opacity-70'
                  }`}
                >
                  {/* Checkbox */}
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-colors ${
                    entry.selected ? 'bg-blue-600 border-blue-600' : 'border-slate-300'
                  }`}>
                    {entry.selected && <Check size={12} className="text-white" />}
                  </div>

                  {/* Name + title */}
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {(d?.first_name as string) || '—'} {(d?.last_name as string) || ''}
                    </p>
                    <p className="text-xs text-slate-400 truncate">{(d?.current_title as string) || entry.file.name.replace(/\.[^.]+$/, '')}</p>
                  </div>

                  {/* Score global */}
                  <div className={`text-sm sm:block ${scoreColor(d?.score_global as number)}`}>
                    {d?.score_global != null ? `${d.score_global}/100` : '—'}
                  </div>

                  {/* Score match */}
                  <div className={`text-sm hidden sm:block ${scoreColor(d?.score_job_match as number)}`}>
                    {d?.score_job_match != null ? `${d.score_job_match}%` : '—'}
                  </div>

                  {/* Reco */}
                  <div className="hidden sm:block">
                    {recoBadge(d?.recommendation as string)}
                  </div>

                  {/* Ville */}
                  <div className="text-sm text-slate-500 hidden sm:block truncate">
                    {(d?.location as string) || '—'}
                  </div>

                  {/* Expérience */}
                  <div className="text-sm text-slate-500 hidden sm:block">
                    {d?.years_experience != null ? `${d.years_experience} ans` : '—'}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Analysis in progress rows */}
          {analyzingCount > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 flex items-center gap-2 text-sm text-slate-500">
              <Loader2 size={14} className="animate-spin text-blue-600" />
              {analyzingCount} CV en cours d'analyse...
            </div>
          )}
        </div>
      )}

      {/* Import action */}
      {analysisDone && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="font-semibold text-slate-900">
              {selectedCount} candidat{selectedCount > 1 ? 's' : ''} prêt{selectedCount > 1 ? 's' : ''} à importer
            </p>
            <p className="text-sm text-slate-500 mt-0.5">
              {jobOffer ? `Vers l'offre "${jobOffer.title}"` : 'Sans offre associée — vous pourrez l\'assigner plus tard'}
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={handleImport}
              loading={saving}
              disabled={selectedCount === 0}
              className="bg-green-600 hover:bg-green-700 text-white"
            >
              <CheckCircle size={16} /> Importer {selectedCount > 0 ? selectedCount : ''} candidat{selectedCount > 1 ? 's' : ''}
            </Button>
            <Button variant="secondary" onClick={() => { setFiles([]); setAnalysisDone(false) }}>
              Recommencer
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
