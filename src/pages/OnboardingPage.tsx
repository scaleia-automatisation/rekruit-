import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { CheckCircle, ArrowRight } from 'lucide-react'

const steps = [
  {
    title: 'Bienvenue sur rekruit.',
    subtitle: 'Créons votre première offre d\'emploi.',
    desc: 'Décrivez le poste que vous cherchez à pourvoir. L\'IA utilisera ces informations pour analyser et scorer vos candidats.',
    icon: '🎯',
  },
  {
    title: 'Ajoutez vos candidats.',
    subtitle: 'Importez les CV et lettres de motivation.',
    desc: 'Déposez les fichiers de vos candidats. L\'IA les analysera automatiquement et les comparera aux critères du poste.',
    icon: '👥',
  },
  {
    title: 'L\'IA analyse tout.',
    subtitle: 'Score automatique et recommandations.',
    desc: 'Chaque candidat reçoit un score sur 100 avec un résumé détaillé de ses points forts et axes d\'amélioration.',
    icon: '🤖',
  },
  {
    title: 'Retenez les meilleurs.',
    subtitle: 'Proposez un entretien en un clic.',
    desc: 'Sélectionnez les candidats retenus et envoyez automatiquement les invitations aux entretiens.',
    icon: '🚀',
  },
]

export function OnboardingPage() {
  const [currentStep, setCurrentStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const { user, refreshProfile } = useAuth()
  const navigate = useNavigate()

  const isLast = currentStep === steps.length - 1

  const handleComplete = async () => {
    if (!user) return
    setLoading(true)
    await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id)
    await refreshProfile()
    navigate('/dashboard')
  }

  const handleSkip = async () => {
    if (!user) return
    await supabase.from('users').update({ onboarding_completed: true }).eq('id', user.id)
    await refreshProfile()
    navigate('/dashboard')
  }

  const step = steps[currentStep]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="font-bold text-slate-900 text-xl">rekruit</span>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {steps.map((_, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold transition-all ${
                i < currentStep
                  ? 'bg-green-600 text-white'
                  : i === currentStep
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-500'
              }`}>
                {i < currentStep ? <CheckCircle size={16} /> : i + 1}
              </div>
              {i < steps.length - 1 && (
                <div className={`w-10 h-0.5 ${i < currentStep ? 'bg-green-400' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8 text-center">
          <div className="text-6xl mb-6">{step.icon}</div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">{step.title}</h1>
          <h2 className="text-lg font-semibold text-blue-600 mb-4">{step.subtitle}</h2>
          <p className="text-slate-500 leading-relaxed mb-8">{step.desc}</p>

          <Button
            size="lg"
            className="w-full"
            loading={loading}
            onClick={isLast ? handleComplete : () => setCurrentStep(s => s + 1)}
          >
            {isLast ? 'Commencer →' : (
              <>
                Suivant
                <ArrowRight size={18} />
              </>
            )}
          </Button>
        </div>

        <div className="text-center mt-5">
          <button
            onClick={handleSkip}
            className="text-sm text-slate-400 hover:text-slate-600 transition-colors"
          >
            Passer l'introduction →
          </button>
        </div>
      </div>
    </div>
  )
}
