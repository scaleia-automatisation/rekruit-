import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Check, Zap, Building2, Users, BarChart3, MessageSquare, Calendar, Download, Headphones, Star } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { PLANS } from '../lib/plans'

const features = [
  { label: 'Offres actives', free: '1', tpe: 'Illimité', agence: 'Illimité', icon: Building2 },
  { label: 'Candidats / mois', free: '10', tpe: '200', agence: '1 000', icon: Users },
  { label: 'Utilisateurs', free: '1', tpe: '5', agence: 'Illimité', icon: Users },
  { label: 'Scoring IA /100', free: true, tpe: true, agence: true, icon: Zap },
  { label: 'Entretiens vidéo IA', free: false, tpe: true, agence: true, icon: Calendar },
  { label: 'Analyse audio', free: false, tpe: true, agence: true, icon: Headphones },
  { label: 'SMS automatiques', free: false, tpe: true, agence: true, icon: MessageSquare },
  { label: 'Analytics avancés', free: false, tpe: true, agence: true, icon: BarChart3 },
  { label: 'Export CSV/PDF', free: false, tpe: true, agence: true, icon: Download },
  { label: 'Gestion équipe', free: false, tpe: false, agence: true, icon: Users },
  { label: 'Support prioritaire', free: false, tpe: false, agence: true, icon: Star },
]

function FeatureValue({ val }: { val: boolean | string }) {
  if (typeof val === 'boolean') {
    return val
      ? <Check size={18} className="text-emerald-500 mx-auto" />
      : <span className="text-slate-300 text-xl leading-none mx-auto block text-center">—</span>
  }
  return <span className="text-sm font-semibold text-slate-700">{val}</span>
}

export function PricingPage() {
  const [loading, setLoading] = useState<string | null>(null)
  const [promoCode, setPromoCode] = useState('')
  const { user, session, planId } = useAuth()
  const navigate = useNavigate()

  const handleSubscribe = async (plan: 'tpe_pme' | 'agence') => {
    if (!user || !session) {
      navigate('/inscription')
      return
    }
    setLoading(plan)
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ plan, interval: 'monthly', promo_code: promoCode || undefined }),
      })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } catch {
      // fail silently
    } finally {
      setLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-white font-['Plus_Jakarta_Sans',system-ui,sans-serif]">
      {/* Nav */}
      <nav className="border-b border-white/10 backdrop-blur-md sticky top-0 z-50 bg-[#0A0A0F]/80">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-white text-lg">rekruit</span>
          </Link>
          <div className="flex items-center gap-3">
            {user ? (
              <Link to="/dashboard" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
                Dashboard →
              </Link>
            ) : (
              <>
                <Link to="/connexion" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">Se connecter</Link>
                <Link to="/inscription" className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
                  Commencer gratuitement
                </Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-20 pb-12 text-center px-6">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-semibold px-4 py-1.5 rounded-full mb-6">
          <Zap size={12} />
          Tarifs simples et transparents
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight mb-4">
          Le bon plan pour{' '}
          <span className="bg-gradient-to-r from-blue-400 to-violet-400 bg-clip-text text-transparent">
            chaque équipe
          </span>
        </h1>
        <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10">
          Commencez gratuitement. Évoluez sans friction. Annulez à tout moment.
        </p>

        <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-slate-300 text-sm font-medium px-5 py-2.5 rounded-2xl">
          Facturation mensuelle · Sans engagement
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Free */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">Free</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-extrabold">0€</span>
              </div>
              <p className="text-slate-400 text-sm">Pour tester rekruit</p>
            </div>
            <ul className="flex flex-col gap-3 flex-1 mb-8">
              {['1 offre active', '10 candidats / mois', '1 utilisateur', 'Scoring IA /100', 'Pipeline de recrutement'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {planId === 'free' ? (
              <div className="text-center text-sm text-slate-400 py-3 rounded-xl border border-white/10">Plan actuel</div>
            ) : (
              <Link to={user ? '/dashboard' : '/inscription'}
                className="text-center bg-white/10 hover:bg-white/20 text-white text-sm font-semibold py-3 rounded-xl transition-colors block">
                Commencer gratuitement
              </Link>
            )}
          </div>

          {/* TPE/PME — Recommended */}
          <div className="relative bg-gradient-to-b from-blue-600 to-blue-700 border border-blue-500 rounded-2xl p-8 flex flex-col shadow-2xl shadow-blue-900/40">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-white text-blue-700 text-xs font-bold px-4 py-1.5 rounded-full shadow">⭐ Recommandé</span>
            </div>
            <div className="mb-6">
              <p className="text-blue-200 text-sm font-semibold uppercase tracking-widest mb-2">Pro</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-extrabold">{PLANS.tpe_pme.price}€</span>
                <span className="text-blue-200 mb-2">/mois</span>
              </div>
              <p className="text-blue-200 text-sm">Recrutement simplifié · sans engagement</p>
            </div>
            <ul className="flex flex-col gap-3 flex-1 mb-8">
              {['Offres illimitées', '200 candidats / mois', '5 utilisateurs', 'Scoring IA + Analyse audio', 'Entretiens vidéo IA', 'SMS automatiques', 'Analytics avancés', 'Export CSV/PDF'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-white/90">
                  <Check size={16} className="text-white shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {planId === 'tpe_pme' ? (
              <div className="text-center text-sm text-white/70 py-3 rounded-xl border border-white/20">Plan actuel</div>
            ) : (
              <button
                onClick={() => handleSubscribe('tpe_pme')}
                disabled={loading === 'tpe_pme'}
                className="bg-white text-blue-700 hover:bg-blue-50 text-sm font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading === 'tpe_pme' ? 'Chargement...' : 'Choisir ce plan'}
              </button>
            )}
          </div>

          {/* Agence */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-8 flex flex-col">
            <div className="mb-6">
              <p className="text-slate-400 text-sm font-semibold uppercase tracking-widest mb-2">Business</p>
              <div className="flex items-end gap-1 mb-1">
                <span className="text-5xl font-extrabold">{PLANS.agence.price}€</span>
                <span className="text-slate-400 mb-2">/mois</span>
              </div>
              <p className="text-slate-400 text-sm">Recrutement à grande échelle · sans engagement</p>
            </div>
            <ul className="flex flex-col gap-3 flex-1 mb-8">
              {['Tout TPE/PME inclus', '1 000 candidats / mois', 'Utilisateurs illimités', 'Gestion d\'équipe avancée', 'Dashboard analytics complet', 'Support prioritaire dédié', 'SLA garanti', 'Onboarding personnalisé'].map(f => (
                <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                  <Check size={16} className="text-emerald-500 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {planId === 'agence' ? (
              <div className="text-center text-sm text-slate-400 py-3 rounded-xl border border-white/10">Plan actuel</div>
            ) : (
              <button
                onClick={() => handleSubscribe('agence')}
                disabled={loading === 'agence'}
                className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold py-3 rounded-xl transition-colors disabled:opacity-60"
              >
                {loading === 'agence' ? 'Chargement...' : 'Choisir ce plan'}
              </button>
            )}
          </div>
        </div>

        {/* Promo */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <input
            value={promoCode}
            onChange={e => setPromoCode(e.target.value.toUpperCase())}
            placeholder="Code promo (optionnel)"
            className="bg-white/5 border border-white/10 text-white placeholder-slate-500 rounded-xl px-4 py-2.5 text-sm w-full sm:w-56 focus:outline-none focus:border-blue-500"
          />
          {promoCode && (
            <span className="text-emerald-400 text-sm font-medium">Code appliqué au paiement</span>
          )}
        </div>
      </section>

      {/* Comparison table */}
      <section className="max-w-4xl mx-auto px-6 pb-24">
        <h2 className="text-2xl font-bold text-center mb-8">Comparaison détaillée</h2>
        <div className="rounded-2xl border border-white/10 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="text-left px-6 py-4 text-sm font-semibold text-slate-400">Fonctionnalité</th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-slate-400">Free</th>
                <th className="text-center px-4 py-4 text-sm font-bold text-blue-400 bg-blue-500/10">Pro</th>
                <th className="text-center px-4 py-4 text-sm font-semibold text-slate-400">Agence</th>
              </tr>
            </thead>
            <tbody>
              {features.map((f, i) => (
                <tr key={f.label} className={`border-b border-white/5 ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                  <td className="px-6 py-3.5 text-sm text-slate-300 flex items-center gap-2">
                    <f.icon size={15} className="text-slate-500 shrink-0" />
                    {f.label}
                  </td>
                  <td className="text-center px-4 py-3.5"><FeatureValue val={f.free} /></td>
                  <td className="text-center px-4 py-3.5 bg-blue-500/5"><FeatureValue val={f.tpe} /></td>
                  <td className="text-center px-4 py-3.5"><FeatureValue val={f.agence} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
