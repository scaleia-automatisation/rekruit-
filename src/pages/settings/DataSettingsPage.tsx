import { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SettingsLayout } from './SettingsLayout'
import { Download, Trash2, AlertTriangle, CheckCircle } from 'lucide-react'

export function DataSettingsPage() {
  const { profile } = useAuth()
  const [exporting, setExporting] = useState(false)
  const [exported, setExported] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState('')

  const exportData = async () => {
    if (!profile) return
    setExporting(true)
    const [{ data: users }, { data: candidates }] = await Promise.all([
      supabase.from('users').select('*').eq('id', profile.id),
      supabase.from('candidates').select('*').eq('organization_id', profile.organization_id || ''),
    ])
    const blob = new Blob([JSON.stringify({ profile: users?.[0], candidates }, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `rekruit-export-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
    setExporting(false)
    setExported(true)
    setTimeout(() => setExported(false), 3000)
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Export */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Exporter mes données</h2>
          <p className="text-sm text-slate-600 mb-4">
            Téléchargez une copie de toutes vos données au format JSON (profil, candidats, offres).
          </p>
          <div className="flex items-center gap-4">
            <button onClick={exportData} disabled={exporting}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
              <Download size={16} />
              {exporting ? 'Export en cours...' : 'Télécharger mes données'}
            </button>
            {exported && (
              <div className="flex items-center gap-1.5 text-green-600 text-sm">
                <CheckCircle size={16} /> Export téléchargé
              </div>
            )}
          </div>
        </div>

        {/* Delete */}
        <div className="bg-white rounded-2xl border border-red-200 p-6">
          <div className="flex items-start gap-3 mb-4">
            <AlertTriangle size={20} className="text-red-500 shrink-0 mt-0.5" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-1">Supprimer mon compte</h2>
              <p className="text-sm text-slate-600">Cette action est irréversible. Toutes vos données seront définitivement supprimées.</p>
            </div>
          </div>
          <div className="space-y-3 max-w-sm">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Tapez <strong>SUPPRIMER</strong> pour confirmer
              </label>
              <input
                value={deleteConfirm}
                onChange={e => setDeleteConfirm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                placeholder="SUPPRIMER"
              />
            </div>
            <button
              disabled={deleteConfirm !== 'SUPPRIMER'}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              onClick={() => window.location.href = '/data-deletion'}
            >
              <Trash2 size={16} />
              Supprimer mon compte
            </button>
          </div>
        </div>
      </div>
    </SettingsLayout>
  )
}
