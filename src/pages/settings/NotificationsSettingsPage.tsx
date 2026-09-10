import { useState } from 'react'
import { SettingsLayout } from './SettingsLayout'
import { CheckCircle } from 'lucide-react'

const notifGroups = [
  {
    title: 'Candidatures',
    items: [
      { key: 'new_candidate', label: 'Nouvelle candidature reçue' },
      { key: 'candidate_analyzed', label: 'Analyse IA terminée' },
      { key: 'candidate_status', label: 'Changement de statut d\'un candidat' },
    ],
  },
  {
    title: 'Entretiens',
    items: [
      { key: 'interview_scheduled', label: 'Entretien planifié' },
      { key: 'interview_reminder', label: 'Rappel d\'entretien (24h avant)' },
      { key: 'interview_completed', label: 'Entretien terminé' },
    ],
  },
  {
    title: 'Équipe',
    items: [
      { key: 'team_invite', label: 'Invitation d\'un membre de l\'équipe' },
      { key: 'team_comment', label: 'Commentaire d\'un collègue' },
    ],
  },
]

export function NotificationsSettingsPage() {
  const [prefs, setPrefs] = useState<Record<string, boolean>>({
    new_candidate: true,
    candidate_analyzed: true,
    candidate_status: false,
    interview_scheduled: true,
    interview_reminder: true,
    interview_completed: false,
    team_invite: true,
    team_comment: false,
  })
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <SettingsLayout>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Notifications</h2>
        <div className="space-y-6">
          {notifGroups.map(group => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{group.title}</h3>
              <div className="space-y-3">
                {group.items.map(item => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                    <span className="text-sm text-slate-700">{item.label}</span>
                    <button onClick={() => setPrefs(p => ({ ...p, [item.key]: !p[item.key] }))}
                      className={`relative w-10 h-6 rounded-full transition-colors ${prefs[item.key] ? 'bg-blue-600' : 'bg-slate-200'}`}>
                      <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${prefs[item.key] ? 'translate-x-4' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-4 mt-6">
          <button onClick={save} className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Sauvegarder
          </button>
          {saved && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm">
              <CheckCircle size={16} /> Préférences sauvegardées
            </div>
          )}
        </div>
      </div>
    </SettingsLayout>
  )
}
