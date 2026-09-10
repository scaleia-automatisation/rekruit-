import { type ReactNode } from 'react'
import { useNavigate } from 'react-router-dom'
import { Lock, Zap } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { type PlanLimits } from '../../lib/plans'

interface PlanGateProps {
  feature: keyof PlanLimits
  children: ReactNode
  fallback?: ReactNode
}

export function PlanGate({ feature, children, fallback }: PlanGateProps) {
  const { plan } = useAuth()
  const navigate = useNavigate()
  const val = plan.limits[feature]
  const allowed = typeof val === 'boolean' ? val : (val as number) > 0

  if (allowed) return <>{children}</>

  if (fallback) return <>{fallback}</>

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
      <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
        <Lock size={22} className="text-blue-500" />
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-base">Fonctionnalité Premium</p>
        <p className="text-sm text-slate-500 mt-1">Passez à un plan supérieur pour accéder à cette fonctionnalité.</p>
      </div>
      <button
        onClick={() => navigate('/pricing')}
        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        <Zap size={15} />
        Voir les plans
      </button>
    </div>
  )
}

interface LimitGateProps {
  used: number
  max: number
  label: string
  children: ReactNode
}

export function LimitGate({ used, max, label, children }: LimitGateProps) {
  const navigate = useNavigate()
  const reached = used >= max

  if (!reached) return <>{children}</>

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-10 text-center rounded-2xl border-2 border-dashed border-amber-200 bg-amber-50">
      <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
        <Zap size={22} className="text-amber-500" />
      </div>
      <div>
        <p className="font-semibold text-slate-800 text-base">Limite atteinte</p>
        <p className="text-sm text-slate-500 mt-1">
          Vous avez utilisé {used}/{max} {label}. Passez à un plan supérieur pour continuer.
        </p>
      </div>
      <button
        onClick={() => navigate('/pricing')}
        className="flex items-center gap-2 bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
      >
        <Zap size={15} />
        Upgrader
      </button>
    </div>
  )
}
