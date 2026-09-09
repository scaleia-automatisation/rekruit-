import { CheckCircle, AlertTriangle, XCircle, Star } from 'lucide-react'
import { Card } from '../ui/Card'
import { ScoreBar } from './ScoreDisplay'

interface AIAnalysisPanelProps {
  ai_summary?: string | null
  ai_strengths?: string | null
  ai_weaknesses?: string | null
  missing_skills?: string | null
  recommendation?: string | null
  score_skills?: number | null
  score_experience?: number | null
  score_education?: number | null
  score_job_match?: number | null
  score_letter?: number | null
}

const recConfig: Record<string, { label: string; icon: typeof CheckCircle; color: string; bg: string }> = {
  GO: { label: 'Recommandé', icon: CheckCircle, color: 'text-green-700', bg: 'bg-green-50 border-green-200' },
  MAYBE: { label: 'À étudier', icon: AlertTriangle, color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200' },
  NO: { label: 'Non recommandé', icon: XCircle, color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
}

export function AIAnalysisPanel({
  ai_summary, ai_strengths, ai_weaknesses, missing_skills, recommendation,
  score_skills, score_experience, score_education, score_job_match, score_letter
}: AIAnalysisPanelProps) {
  const rec = recommendation ? recConfig[recommendation] : null

  const scores = [
    { label: 'Compétences', score: score_skills },
    { label: 'Expérience', score: score_experience },
    { label: 'Formation', score: score_education },
    { label: 'Adéquation poste', score: score_job_match },
    { label: 'Lettre de motivation', score: score_letter },
  ].filter(s => s.score !== null && s.score !== undefined) as { label: string; score: number }[]

  return (
    <div className="space-y-4">
      {rec && (
        <div className={`flex items-center gap-3 rounded-xl border p-4 ${rec.bg}`}>
          <rec.icon size={20} className={rec.color} />
          <span className={`font-bold ${rec.color}`}>{rec.label}</span>
        </div>
      )}

      {ai_summary && (
        <Card>
          <h3 className="font-bold text-slate-900 mb-3">Résumé</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{ai_summary}</p>
        </Card>
      )}

      {scores.length > 0 && (
        <Card>
          <h3 className="font-bold text-slate-900 mb-4">Scores détaillés</h3>
          <div className="space-y-3">
            {scores.map(s => <ScoreBar key={s.label} label={s.label} score={s.score} />)}
          </div>
        </Card>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {ai_strengths && (
          <Card>
            <h3 className="font-bold text-green-700 mb-3 flex items-center gap-2">
              <CheckCircle size={16} /> Points forts
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{ai_strengths}</p>
          </Card>
        )}
        {ai_weaknesses && (
          <Card>
            <h3 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
              <Star size={16} /> Points à améliorer
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed">{ai_weaknesses}</p>
          </Card>
        )}
      </div>

      {missing_skills && (
        <Card>
          <h3 className="font-bold text-red-700 mb-3 flex items-center gap-2">
            <XCircle size={16} /> Compétences manquantes
          </h3>
          <p className="text-sm text-slate-600 leading-relaxed">{missing_skills}</p>
        </Card>
      )}
    </div>
  )
}
