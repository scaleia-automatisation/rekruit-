import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card } from '../components/ui/Card'

export function SettingsPage() {
  const { profile, organization, refreshProfile } = useAuth()
  const [profileForm, setProfileForm] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
  })
  const [orgForm, setOrgForm] = useState({
    name: organization?.name || '',
    email: organization?.email || '',
    phone: organization?.phone || '',
    website: organization?.website || '',
  })
  const [profileLoading, setProfileLoading] = useState(false)
  const [orgLoading, setOrgLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState(false)
  const [orgSuccess, setOrgSuccess] = useState(false)

  const setProfile = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfileForm(f => ({ ...f, [field]: e.target.value }))

  const setOrg = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setOrgForm(f => ({ ...f, [field]: e.target.value }))

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return
    setProfileLoading(true)
    await supabase.from('users').update(profileForm).eq('id', profile.id)
    await refreshProfile()
    setProfileLoading(false)
    setProfileSuccess(true)
    setTimeout(() => setProfileSuccess(false), 3000)
  }

  const saveOrg = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!organization) return
    setOrgLoading(true)
    await supabase.from('organizations').update(orgForm).eq('id', organization.id)
    await refreshProfile()
    setOrgLoading(false)
    setOrgSuccess(true)
    setTimeout(() => setOrgSuccess(false), 3000)
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-8">Paramètres</h1>

      <div className="flex flex-col gap-6">
        {/* Profile */}
        <Card>
          <h2 className="font-bold text-slate-900 mb-5">Mon profil</h2>
          <form onSubmit={saveProfile} className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="Prénom"
                value={profileForm.first_name}
                onChange={setProfile('first_name')}
              />
              <Input
                label="Nom"
                value={profileForm.last_name}
                onChange={setProfile('last_name')}
              />
            </div>
            <Input
              label="Email"
              type="email"
              value={profile?.email || ''}
              disabled
              hint="L'email ne peut pas être modifié ici."
            />
            <Input
              label="Téléphone"
              placeholder="+33 6 00 00 00 00"
              value={profileForm.phone}
              onChange={setProfile('phone')}
            />
            <div className="flex items-center gap-3">
              <Button type="submit" loading={profileLoading}>
                Enregistrer
              </Button>
              {profileSuccess && (
                <span className="text-sm text-green-600 font-medium">✓ Enregistré</span>
              )}
            </div>
          </form>
        </Card>

        {/* Organization */}
        {organization && (
          <Card>
            <h2 className="font-bold text-slate-900 mb-5">Mon organisation</h2>
            <form onSubmit={saveOrg} className="flex flex-col gap-4">
              <Input
                label="Nom de l'organisation"
                value={orgForm.name}
                onChange={setOrg('name')}
              />
              <Input
                label="Email de contact"
                type="email"
                placeholder="contact@masociete.fr"
                value={orgForm.email}
                onChange={setOrg('email')}
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input
                  label="Téléphone"
                  placeholder="+33 1 00 00 00 00"
                  value={orgForm.phone}
                  onChange={setOrg('phone')}
                />
                <Input
                  label="Site web"
                  placeholder="https://masociete.fr"
                  value={orgForm.website}
                  onChange={setOrg('website')}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button type="submit" loading={orgLoading}>
                  Enregistrer
                </Button>
                {orgSuccess && (
                  <span className="text-sm text-green-600 font-medium">✓ Enregistré</span>
                )}
              </div>
            </form>
          </Card>
        )}

        {/* Plan */}
        <Card>
          <h2 className="font-bold text-slate-900 mb-4">Plan actuel</h2>
          <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
            <div>
              <p className="font-bold text-blue-800 capitalize">{organization?.plan || 'Gratuit'}</p>
              <p className="text-sm text-blue-600">Plan actuel</p>
            </div>
            <Button variant="secondary" size="sm">
              Passer au Pro
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-3">
            Le plan gratuit inclut jusqu'à 10 candidats et 2 offres actives.
          </p>
        </Card>

        {/* Role info */}
        <Card>
          <h2 className="font-bold text-slate-900 mb-4">Accès & rôle</h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600">Votre rôle</p>
              <p className="font-semibold text-slate-900 capitalize mt-0.5">
                {profile?.role === 'admin' ? 'Administrateur' :
                 profile?.role === 'super_admin' ? 'Super Admin' : 'Recruteur'}
              </p>
            </div>
            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-700 font-bold text-sm">
                {profile?.first_name?.[0]}{profile?.last_name?.[0]}
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
