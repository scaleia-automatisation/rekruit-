import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { supabase } from '../../lib/supabase'
import { SettingsLayout } from './SettingsLayout'
import { Users, Trash2, Plus, Pencil, X, Check } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

interface OrgMember {
  id: string
  first_name: string
  last_name: string
  job_title: string | null
  email: string | null
}

const COLORS = ['bg-blue-100 text-blue-700', 'bg-purple-100 text-purple-700', 'bg-green-100 text-green-700', 'bg-orange-100 text-orange-700', 'bg-pink-100 text-pink-700', 'bg-teal-100 text-teal-700']

function avatarColor(id: string) {
  let h = 0
  for (let i = 0; i < id.length; i++) h = (h + id.charCodeAt(i)) % COLORS.length
  return COLORS[h]
}

const emptyForm = { first_name: '', last_name: '', job_title: '', email: '' }

export function TeamSettingsPage() {
  const { profile } = useAuth()
  const [members, setMembers] = useState<OrgMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState(emptyForm)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const load = async () => {
    if (!profile?.organization_id) return
    setLoading(true)
    const { data } = await supabase
      .from('organization_members')
      .select('*')
      .eq('organization_id', profile.organization_id)
      .order('created_at')
    setMembers((data || []) as OrgMember[])
    setLoading(false)
  }

  useEffect(() => { load() }, [profile?.organization_id])

  const addMember = async () => {
    if (!form.first_name.trim() || !form.last_name.trim() || !profile?.organization_id) return
    setSaving(true)
    await supabase.from('organization_members').insert({
      organization_id: profile.organization_id,
      first_name: form.first_name.trim(),
      last_name: form.last_name.trim(),
      job_title: form.job_title.trim() || null,
      email: form.email.trim() || null,
    })
    setForm(emptyForm)
    setShowAdd(false)
    setSaving(false)
    load()
  }

  const startEdit = (m: OrgMember) => {
    setEditId(m.id)
    setEditForm({ first_name: m.first_name, last_name: m.last_name, job_title: m.job_title || '', email: m.email || '' })
  }

  const saveEdit = async () => {
    if (!editId) return
    setSaving(true)
    await supabase.from('organization_members').update({
      first_name: editForm.first_name.trim(),
      last_name: editForm.last_name.trim(),
      job_title: editForm.job_title.trim() || null,
      email: editForm.email.trim() || null,
    }).eq('id', editId)
    setEditId(null)
    setSaving(false)
    load()
  }

  const deleteMember = async (id: string) => {
    setDeletingId(id)
    await supabase.from('organization_members').delete().eq('id', id)
    setDeletingId(null)
    load()
  }

  return (
    <SettingsLayout>
      <div className="space-y-6">
        {/* Intervieweurs de l'organisation */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">Membres de l'équipe</h2>
              <p className="text-sm text-slate-500 mt-1">Ces personnes peuvent être assignées comme intervieweurs lors des entretiens avec les candidats.</p>
            </div>
            <Button size="sm" onClick={() => { setShowAdd(true); setForm(emptyForm) }}>
              <Plus size={15} /> Ajouter
            </Button>
          </div>

          {/* Add form */}
          {showAdd && (
            <div className="mb-5 p-4 bg-slate-50 rounded-2xl border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3 text-sm">Nouveau membre</h3>
              <div className="grid sm:grid-cols-2 gap-3 mb-3">
                <Input
                  label="Prénom *"
                  value={form.first_name}
                  onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))}
                  placeholder="Marie"
                />
                <Input
                  label="Nom *"
                  value={form.last_name}
                  onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))}
                  placeholder="Dupont"
                />
                <Input
                  label="Poste / Titre"
                  value={form.job_title}
                  onChange={e => setForm(f => ({ ...f, job_title: e.target.value }))}
                  placeholder="Directrice des Ressources Humaines"
                />
                <Input
                  label="Email (optionnel)"
                  type="email"
                  value={form.email}
                  onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                  placeholder="m.dupont@societe.fr"
                />
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" loading={saving} onClick={addMember} disabled={!form.first_name.trim() || !form.last_name.trim()}>
                  <Check size={14} /> Ajouter
                </Button>
                <Button size="sm" variant="secondary" onClick={() => setShowAdd(false)}>
                  <X size={14} /> Annuler
                </Button>
              </div>
            </div>
          )}

          {/* Members list */}
          {loading ? (
            <div className="space-y-2">
              {[1, 2].map(i => <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />)}
            </div>
          ) : members.length === 0 ? (
            <div className="text-center py-10 text-slate-400">
              <Users size={36} className="mx-auto mb-3 text-slate-200" />
              <p className="font-medium text-slate-500">Aucun membre ajouté</p>
              <p className="text-sm mt-1">Ajoutez les membres de votre équipe qui participent aux entretiens.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {members.map(m => (
                <div key={m.id} className="bg-slate-50 rounded-xl p-4">
                  {editId === m.id ? (
                    <div>
                      <div className="grid sm:grid-cols-2 gap-3 mb-3">
                        <Input label="Prénom" value={editForm.first_name} onChange={e => setEditForm(f => ({ ...f, first_name: e.target.value }))} />
                        <Input label="Nom" value={editForm.last_name} onChange={e => setEditForm(f => ({ ...f, last_name: e.target.value }))} />
                        <Input label="Poste / Titre" value={editForm.job_title} onChange={e => setEditForm(f => ({ ...f, job_title: e.target.value }))} />
                        <Input label="Email" type="email" value={editForm.email} onChange={e => setEditForm(f => ({ ...f, email: e.target.value }))} />
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" loading={saving} onClick={saveEdit}><Check size={13} /> Enregistrer</Button>
                        <Button size="sm" variant="secondary" onClick={() => setEditId(null)}><X size={13} /> Annuler</Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 ${avatarColor(m.id)}`}>
                          {m.first_name[0]}{m.last_name[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-sm">{m.first_name} {m.last_name}</p>
                          {m.job_title && <p className="text-xs text-slate-500">{m.job_title}</p>}
                          {m.email && <p className="text-xs text-slate-400">{m.email}</p>}
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        <button onClick={() => startEdit(m)} className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-200 transition-all">
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => deleteMember(m.id)}
                          disabled={deletingId === m.id}
                          className="p-2 text-slate-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Compte utilisateur connecté */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Compte utilisateur</h2>
          <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                <span className="text-blue-700 font-bold text-sm">{profile?.first_name?.[0]}{profile?.last_name?.[0]}</span>
              </div>
              <div>
                <p className="font-semibold text-slate-900 text-sm">{profile?.first_name} {profile?.last_name} <span className="text-slate-400 font-normal">(vous)</span></p>
                <p className="text-xs text-slate-500">{profile?.email}</p>
              </div>
            </div>
            <span className="text-xs text-green-700 bg-green-50 px-2 py-1 rounded-full border border-green-100">Actif</span>
          </div>
        </div>
      </div>
    </SettingsLayout>
  )
}
