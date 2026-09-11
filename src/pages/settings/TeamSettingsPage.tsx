import { useAuth } from '../../contexts/AuthContext'
import { SettingsLayout } from './SettingsLayout'
import { Users, Crown, User } from 'lucide-react'

export function TeamSettingsPage() {
  const { profile } = useAuth()

  return (
    <SettingsLayout>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900">Équipe</h2>
          {profile?.role === 'admin' && (
            <button className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2">
              <Users size={15} />
              Inviter un membre
            </button>
          )}
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-100 rounded-xl flex items-center justify-center">
                <User size={16} className="text-blue-600" />
              </div>
              <div>
                <div className="font-medium text-slate-900 text-sm">
                  {profile?.first_name} {profile?.last_name} <span className="text-slate-400">(vous)</span>
                </div>
                <div className="text-xs text-slate-500">{profile?.email}</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {profile?.role === 'admin' && (
                <span className="flex items-center gap-1 text-xs text-amber-700 bg-amber-50 px-2 py-1 rounded-full border border-amber-100">
                  <Crown size={11} /> Admin
                </span>
              )}
              <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100">
                Actif
              </span>
            </div>
          </div>
        </div>

        {profile?.role !== 'admin' && (
          <p className="mt-6 text-sm text-slate-500">Seul l'administrateur peut gérer les membres de l'équipe.</p>
        )}
      </div>
    </SettingsLayout>
  )
}
