import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CreditCard, Zap, CheckCircle2, AlertTriangle, TrendingUp, Calendar, Users, FileText } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { PLANS } from '../lib/plans'

interface UsageData {
  candidates_count: number
  offers_count: number
  sms_count: number
  audio_analyses_count: number
}

export function BillingPage() {
  const { organization, plan, planId, session, refreshProfile } = useAuth()
  const [usage, setUsage] = useState<UsageData | null>(null)
  const [portalLoading, setPortalLoading] = useState(false)
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const success = params.get('success') === '1'

  useEffect(() => {
    if (success) refreshProfile()
    const yearMonth = new Date().toISOString().slice(0, 7)
    supabase.from('monthly_usage')
      .select('*')
      .eq('organization_id', organization?.id ?? '')
      .eq('year_month', yearMonth)
      .single()
      .then(({ data }) => {
        if (data) setUsage(data as UsageData)
      })
  }, [organization?.id])

  const openPortal = async () => {
    if (!session) return
    setPortalLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // fail silently
    } finally {
      setPortalLoading(false)
    }
  }

  const planColors: Record<string, string> = {
    free: 'bg-slate-100 text-slate-700',
    tpe_pme: 'bg-blue-50 text-blue-700',
    agence: 'bg-violet-50 text-violet-700',
  }

  const planStatus = organization?.plan_status
  const statusLabel: Record<string, { label: string; color: string }> = {
    active: { label: 'Actif', color: 'text-emerald-600' },
    canceled: { label: 'Annulé', color: 'text-slate-500' },
    past_due: { label: 'Paiement en retard', color: 'text-red-600' },
    trialing: { label: 'Essai', color: 'text-blue-600' },
  }

  const currentLimits = PLANS[planId].limits

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      {success && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl px-5 py-4 mb-6">
          <CheckCircle2 size={20} className="shrink-0" />
          <div>
            <p className="font-semibold">Abonnement activé !</p>
            <p className="text-sm text-emerald-700">Votre plan {plan.name} est maintenant actif. Merci !</p>
          </div>
        </div>
      )}

      {planStatus === 'past_due' && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-800 rounded-2xl px-5 py-4 mb-6">
          <AlertTriangle size={20} className="shrink-0" />
          <div>
            <p className="font-semibold">Paiement en attente</p>
            <p className="text-sm text-red-700">Mettez à jour votre moyen de paiement pour continuer à utiliser rekruit.</p>
          </div>
          <button onClick={openPortal} className="ml-auto bg-red-600 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-red-700 transition-colors shrink-0">
            Mettre à jour
          </button>
        </div>
      )}

      <h1 className="text-2xl font-bold text-slate-900 mb-6">Facturation & Abonnement</h1>

      {/* Current Plan */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs text-slate-500 font-semibold uppercase tracking-widest mb-1">Plan actuel</p>
            <div className="flex items-center gap-3">
              <span className={`text-2xl font-extrabold text-slate-900`}>{plan.name}</span>
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${planColors[planId]}`}>{planId === 'free' ? 'Gratuit' : planStatus ? statusLabel[planStatus]?.label ?? planStatus : 'Actif'}</span>
            </div>
            {organization?.plan_interval && (
              <p className="text-sm text-slate-500 mt-1">Facturation {organization.plan_interval === 'annual' ? 'annuelle' : 'mensuelle'}</p>
            )}
            {organization?.plan_current_period_end && (
              <p className="text-sm text-slate-500">
                Renouvellement le {new Date(organization.plan_current_period_end).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0">
            {planId === 'free' ? (
              <button onClick={() => navigate('/pricing')} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors">
                <Zap size={15} />
                Passer Premium
              </button>
            ) : (
              <button onClick={openPortal} disabled={portalLoading} className="flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors disabled:opacity-60">
                <CreditCard size={15} />
                {portalLoading ? 'Chargement...' : 'Gérer l\'abonnement'}
              </button>
            )}
            {planId !== 'agence' && (
              <button onClick={() => navigate('/pricing')} className="text-sm text-blue-600 hover:text-blue-800 font-medium text-center transition-colors">
                Changer de plan
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Usage */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 mb-5">
        <h2 className="text-base font-bold text-slate-900 mb-5 flex items-center gap-2">
          <TrendingUp size={16} className="text-slate-400" />
          Utilisation ce mois
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <UsageStat
            label="Candidats"
            used={usage?.candidates_count ?? 0}
            max={currentLimits.maxCandidatesPerMonth}
            icon={<Users size={16} className="text-blue-500" />}
          />
          <UsageStat
            label="Offres actives"
            used={usage?.offers_count ?? 0}
            max={currentLimits.maxActiveOffers}
            icon={<FileText size={16} className="text-violet-500" />}
          />
          <UsageStat
            label="SMS envoyés"
            used={usage?.sms_count ?? 0}
            max={Infinity}
            icon={<Zap size={16} className="text-amber-500" />}
          />
          <UsageStat
            label="Analyses audio"
            used={usage?.audio_analyses_count ?? 0}
            max={Infinity}
            icon={<Calendar size={16} className="text-emerald-500" />}
          />
        </div>
      </div>

      {/* Limits */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-base font-bold text-slate-900 mb-5">Limites du plan {plan.name}</h2>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Offres actives', val: currentLimits.maxActiveOffers },
            { label: 'Candidats / mois', val: currentLimits.maxCandidatesPerMonth },
            { label: 'Utilisateurs', val: currentLimits.maxUsers },
            { label: 'Entretiens IA', val: currentLimits.maxInterviews },
          ].map(({ label, val }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
              <span className="text-sm text-slate-600">{label}</span>
              <span className="text-sm font-semibold text-slate-900">
                {val === Infinity ? 'Illimité' : val}
              </span>
            </div>
          ))}
        </div>
        {planId !== 'agence' && (
          <button onClick={() => navigate('/pricing')} className="mt-4 w-full text-center text-sm text-blue-600 hover:text-blue-800 font-semibold transition-colors">
            Voir tous les plans et fonctionnalités →
          </button>
        )}
      </div>
    </div>
  )
}

function UsageStat({ label, used, max, icon }: { label: string; used: number; max: number; icon: React.ReactNode }) {
  const pct = max === Infinity ? 0 : Math.min((used / max) * 100, 100)
  const overThreshold = pct > 80
  return (
    <div className="bg-slate-50 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-semibold text-slate-600">{label}</span>
        </div>
        <span className="text-xs font-bold text-slate-700">{used}{max !== Infinity ? `/${max}` : ''}</span>
      </div>
      {max !== Infinity && (
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${overThreshold ? 'bg-red-500' : 'bg-blue-500'}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  )
}
