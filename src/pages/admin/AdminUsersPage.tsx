import { useState, useEffect } from 'react'
import { UserPlus, Mail, Shield, Trash2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'

interface OrgUser {
  id: string
  first_name: string
  last_name: string
  email: string
  role: string
  created_at: string
  is_super_admin: boolean
}

export function AdminUsersPage() {
  const { organization, profile, plan } = useAuth()
  const [users, setUsers] = useState<OrgUser[]>([])
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'recruiter'>('recruiter')
  const [inviting, setInviting] = useState(false)
  const [inviteMsg, setInviteMsg] = useState('')

  const maxUsers = plan.limits.maxUsers
  const atLimit = maxUsers !== Infinity && users.length >= maxUsers

  const fetchUsers = async () => {
    if (!organization?.id) return
    const { data } = await supabase.from('users').select('id, first_name, last_name, email, role, created_at, is_super_admin').eq('organization_id', organization.id).order('created_at')
    if (data) setUsers(data as OrgUser[])
    setLoading(false)
  }

  useEffect(() => { fetchUsers() }, [organization?.id])

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!inviteEmail || !organization?.id || atLimit) return
    setInviting(true)
    setInviteMsg('')
    const { error } = await supabase.auth.admin.inviteUserByEmail(inviteEmail)
    if (error) {
      setInviteMsg(`Erreur : ${error.message}`)
    } else {
      setInviteMsg(`Invitation envoyée à ${inviteEmail}`)
      setInviteEmail('')
    }
    setInviting(false)
  }

  const handleChangeRole = async (userId: string, newRole: 'admin' | 'recruiter') => {
    await supabase.from('users').update({ role: newRole }).eq('id', userId)
    setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u))
  }

  const roleLabel: Record<string, string> = { admin: 'Admin', recruiter: 'Recruteur' }
  const roleColors: Record<string, string> = { admin: 'bg-violet-50 text-violet-700', recruiter: 'bg-slate-100 text-slate-600' }

  if (profile?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center h-full p-10 text-center">
        <p className="text-slate-500">Accès réservé aux administrateurs.</p>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Utilisateurs</h1>
          <p className="text-slate-500 text-sm mt-0.5">
            {users.length}{maxUsers !== Infinity ? `/${maxUsers}` : ''} utilisateurs
          </p>
        </div>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-6">
        <h2 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
          <UserPlus size={16} className="text-blue-600" />
          Inviter un membre
        </h2>
        {atLimit ? (
          <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800">
            Limite d'utilisateurs atteinte ({users.length}/{maxUsers}). <a href="/pricing" className="font-semibold underline">Upgradez votre plan</a> pour ajouter plus de membres.
          </div>
        ) : (
          <form onSubmit={handleInvite} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="email"
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="email@entreprise.com"
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <select
              value={inviteRole}
              onChange={e => setInviteRole(e.target.value as 'admin' | 'recruiter')}
              className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="recruiter">Recruteur</option>
              <option value="admin">Admin</option>
            </select>
            <button
              type="submit"
              disabled={inviting}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors disabled:opacity-60 shrink-0"
            >
              {inviting ? 'Envoi...' : 'Inviter'}
            </button>
          </form>
        )}
        {inviteMsg && (
          <p className="text-sm mt-2 text-emerald-700 font-medium">{inviteMsg}</p>
        )}
      </div>

      {/* Users list */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {loading ? (
          <div className="p-10 text-center text-slate-400 text-sm">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="p-10 text-center text-slate-400 text-sm">Aucun utilisateur trouvé.</div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Utilisateur</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500">Rôle</th>
                <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                        {u.is_super_admin
                          ? <Shield size={14} className="text-blue-700" />
                          : <span className="text-blue-700 text-xs font-bold">{(u.first_name?.[0] ?? '') + (u.last_name?.[0] ?? '')}</span>
                        }
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-800">{u.first_name} {u.last_name}</p>
                        <p className="text-xs text-slate-500">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    {u.id === profile?.id ? (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${roleColors[u.role] ?? 'bg-slate-100 text-slate-600'}`}>
                        {roleLabel[u.role] ?? u.role} (vous)
                      </span>
                    ) : (
                      <select
                        value={u.role}
                        onChange={e => handleChangeRole(u.id, e.target.value as 'admin' | 'recruiter')}
                        className={`text-xs font-semibold px-2.5 py-1 rounded-full border-0 focus:outline-none cursor-pointer ${roleColors[u.role] ?? 'bg-slate-100 text-slate-600'}`}
                      >
                        <option value="recruiter">Recruteur</option>
                        <option value="admin">Admin</option>
                      </select>
                    )}
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    {u.id !== profile?.id && (
                      <button className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Supprimer">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
