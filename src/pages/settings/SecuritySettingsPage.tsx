import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { SettingsLayout } from './SettingsLayout'
import { CheckCircle, Eye, EyeOff } from 'lucide-react'

export function SecuritySettingsPage() {
  const [form, setForm] = useState({ current: '', password: '', confirm: '' })
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirm) {
      setError('Les mots de passe ne correspondent pas.')
      return
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.updateUser({ password: form.password })
    setLoading(false)
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      setForm({ current: '', password: '', confirm: '' })
      setTimeout(() => setSuccess(false), 3000)
    }
  }

  return (
    <SettingsLayout>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Sécurité</h2>
        <div className="max-w-md">
          <h3 className="font-semibold text-slate-900 mb-4">Changer le mot de passe</h3>
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">{error}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nouveau mot de passe</label>
              <div className="relative">
                <input
                  type={show ? 'text' : 'password'}
                  required
                  value={form.password}
                  onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                  placeholder="Minimum 8 caractères"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <button type="button" onClick={() => setShow(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {show ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirmer le mot de passe</label>
              <input
                type="password"
                required
                value={form.confirm}
                onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button type="submit" disabled={loading}
                className="px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50">
                {loading ? 'Mise à jour...' : 'Mettre à jour'}
              </button>
              {success && (
                <div className="flex items-center gap-1.5 text-green-600 text-sm">
                  <CheckCircle size={16} /> Mot de passe mis à jour
                </div>
              )}
            </div>
          </form>
        </div>
      </div>
    </SettingsLayout>
  )
}
