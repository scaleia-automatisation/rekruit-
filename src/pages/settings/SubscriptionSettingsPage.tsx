import { useAuth } from '../../contexts/AuthContext'
import { SettingsLayout } from './SettingsLayout'
import { Link } from 'react-router-dom'
import { CreditCard, ArrowRight, CheckCircle } from 'lucide-react'

const planNames: Record<string, string> = {
  free: 'Gratuit',
  tpe_pme: 'Pro',
  agence: 'Business',
}

const planFeatures: Record<string, string[]> = {
  free: ['3 offres actives', '20 candidats / mois', 'Analyse IA de base'],
  tpe_pme: ['Offres illimitées', '200 candidats / mois', 'Analyse IA avancée', 'Equipe jusqu\'à 5 membres'],
  agence: ['Tout le plan Pro', 'Candidats illimités', 'IA prioritaire', 'Equipe illimitée', 'Support prioritaire'],
}

export function SubscriptionSettingsPage() {
  const { organization } = useAuth()
  const plan = organization?.plan || 'free'

  return (
    <SettingsLayout>
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <h2 className="text-xl font-bold text-slate-900 mb-6">Abonnement</h2>

        <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <CreditCard size={20} className="text-blue-600" />
            <span className="font-semibold text-blue-900">Plan actuel : {planNames[plan] || plan}</span>
          </div>
          {plan !== 'free' && organization?.plan_current_period_end && (
            <p className="text-sm text-blue-700">
              Renouvellement : {new Date(organization.plan_current_period_end).toLocaleDateString('fr-FR')}
            </p>
          )}
          {plan === 'free' && (
            <p className="text-sm text-blue-700">Passez à un plan payant pour débloquer toutes les fonctionnalités.</p>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-semibold text-slate-900 mb-3">Fonctionnalités incluses</h3>
          <ul className="space-y-2">
            {(planFeatures[plan] || []).map(f => (
              <li key={f} className="flex items-center gap-2 text-sm text-slate-700">
                <CheckCircle size={15} className="text-green-500 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="flex gap-3 flex-wrap">
          {plan === 'free' ? (
            <Link to="/pricing"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Passer au plan Pro <ArrowRight size={16} />
            </Link>
          ) : (
            <Link to="/billing"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Gérer la facturation <ArrowRight size={16} />
            </Link>
          )}
          <Link to="/pricing" className="px-6 py-2.5 border border-slate-200 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors">
            Voir tous les plans
          </Link>
        </div>
      </div>
    </SettingsLayout>
  )
}
