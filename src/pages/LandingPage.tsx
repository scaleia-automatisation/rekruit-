import { Link } from 'react-router-dom'
import { CheckCircle, ArrowRight, Zap, Star, Users, BarChart3, Calendar } from 'lucide-react'
import { Button } from '../components/ui/Button'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">R</span>
            </div>
            <span className="font-bold text-slate-900 text-lg">rekruit</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/connexion" className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors hidden sm:block">
              Connexion
            </Link>
            <Link to="/inscription">
              <Button size="sm">Commencer gratuitement</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full mb-8">
            <Zap size={14} />
            IA de recrutement — Essai gratuit
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight mb-6">
            Trouvez le meilleur candidat<br />
            <span className="text-blue-600">sans y passer des heures.</span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            L'IA trie, compare et score vos candidatures, automatise vos entretiens et vous aide à identifier rapidement les profils qui correspondent vraiment au poste.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/inscription">
              <Button size="lg" className="w-full sm:w-auto">
                Commencer gratuitement
                <ArrowRight size={18} />
              </Button>
            </Link>
            <a href="#comment-ca-marche">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                Voir comment ça fonctionne
              </Button>
            </a>
          </div>
          <p className="mt-4 text-xs text-slate-400">Aucune carte bancaire requise · Gratuit jusqu'à 10 candidats</p>
        </div>
      </section>

      {/* Demo card */}
      <section className="py-10 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
            <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-yellow-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
              <span className="ml-3 text-xs text-slate-400 font-mono">rekruit.net — Dashboard</span>
            </div>
            <div className="p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-semibold text-slate-800">Développeur Full-Stack</h3>
                <span className="text-xs bg-green-100 text-green-700 px-2.5 py-1 rounded-full font-medium">12 candidats</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: 'Jean Dupont', score: 87, progress: 80, stage: 'Entretien 3', color: 'green' },
                  { name: 'Marie Martin', score: 74, progress: 60, stage: 'Entretien 2', color: 'blue' },
                  { name: 'Lucas Bernard', score: 61, progress: 40, stage: 'Sélectionné', color: 'orange' },
                ].map((c) => (
                  <div key={c.name} className="flex items-center gap-4 p-4 rounded-xl border border-slate-100 hover:border-slate-200 transition-colors">
                    <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center shrink-0">
                      <span className="text-blue-700 text-sm font-bold">
                        {c.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium text-slate-800 truncate">{c.name}</p>
                        <span className={`text-sm font-bold ${c.color === 'green' ? 'text-green-600' : c.color === 'blue' ? 'text-blue-600' : 'text-orange-600'}`}>
                          {c.score}/100
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5">
                        <div
                          className={`h-1.5 rounded-full ${c.color === 'green' ? 'bg-green-500' : c.color === 'blue' ? 'bg-blue-500' : 'bg-orange-500'}`}
                          style={{ width: `${c.progress}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full shrink-0 ${
                      c.color === 'green' ? 'bg-green-100 text-green-700' :
                      c.color === 'blue' ? 'bg-blue-100 text-blue-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {c.stage}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problems */}
      <section className="py-20 px-4 sm:px-6 bg-slate-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Le recrutement prend trop de temps.</h2>
            <p className="text-lg text-slate-500">Vous reconnaissez ces situations ?</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { emoji: '📄', problem: 'Trop de CV à lire', desc: 'Des dizaines de candidatures à analyser manuellement chaque semaine.' },
              { emoji: '⏱️', problem: 'Temps perdu à comparer', desc: 'Comparer des profils similaires prend un temps précieux.' },
              { emoji: '🗂️', problem: 'Suivi complexe', desc: 'Perdre la trace des candidats entre les différentes étapes.' },
              { emoji: '📧', problem: 'Relances manuelles', desc: 'Envoyer chaque email de suivi ou refus un par un.' },
              { emoji: '📅', problem: 'Organisation des entretiens', desc: 'Coordonner les agendas pour chaque entretien.' },
              { emoji: '🧩', problem: 'Pas de vision globale', desc: 'Impossible de voir d\'un coup d\'œil où en est chaque candidat.' },
            ].map(({ emoji, problem, desc }) => (
              <div key={problem} className="bg-white rounded-2xl p-5 border border-slate-200">
                <div className="text-2xl mb-3">{emoji}</div>
                <h3 className="font-semibold text-slate-800 mb-1.5">{problem}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution */}
      <section id="comment-ca-marche" className="py-20 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Simple. Rapide. Efficace.</h2>
            <p className="text-lg text-slate-500">4 étapes pour recruter le meilleur profil.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { step: '01', title: 'Ajoutez l\'offre', desc: 'Décrivez le poste en quelques minutes.', icon: Briefcase },
              { step: '02', title: 'Importez les CV', desc: 'Déposez les CVs et lettres en lot.', icon: Users },
              { step: '03', title: 'L\'IA analyse', desc: 'Score automatique et recommandations.', icon: BarChart3 },
              { step: '04', title: 'Gérez les entretiens', desc: 'Planifiez et suivez chaque étape.', icon: Calendar },
            ].map(({ step, title, desc, icon: Icon }) => (
              <div key={step} className="flex flex-col gap-4 p-6 bg-white rounded-2xl border border-slate-200 relative">
                <div className="absolute -top-3 left-6 bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-lg">
                  {step}
                </div>
                <Icon size={28} className="text-blue-600 mt-2" />
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">{title}</h3>
                  <p className="text-sm text-slate-500">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 px-4 sm:px-6 bg-blue-600">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-4">Tout ce dont vous avez besoin.</h2>
            <p className="text-lg text-blue-200">Un assistant IA pour chaque étape du recrutement.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              'Gagnez du temps sur l\'analyse CV',
              'Identifiez rapidement les meilleurs profils',
              'Automatisez les invitations aux entretiens',
              'Centralisez le suivi des candidats',
              'Analysez les entretiens avec l\'IA',
              'L\'IA comme assistant recruteur',
            ].map((benefit) => (
              <div key={benefit} className="flex items-center gap-3 bg-blue-500/50 rounded-xl p-4">
                <CheckCircle size={20} className="text-blue-200 shrink-0" />
                <span className="text-white text-sm font-medium">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-20 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <Star size={36} className="text-yellow-500 mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Passez moins de temps à trier les candidatures.
          </h2>
          <p className="text-lg text-slate-500 mb-10">
            Passez plus de temps à recruter les bons profils.
          </p>
          <Link to="/inscription">
            <Button size="lg">
              Commencer gratuitement
              <ArrowRight size={18} />
            </Button>
          </Link>
          <p className="mt-4 text-sm text-slate-400">Sans engagement · Sans carte bancaire</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="font-bold text-slate-900">rekruit.net</span>
          </div>
          <p className="text-sm text-slate-400">© 2026 rekruit.net · Tous droits réservés</p>
          <div className="flex gap-6 text-sm text-slate-500">
            <a href="#" className="hover:text-slate-900">Mentions légales</a>
            <a href="#" className="hover:text-slate-900">Confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Needed for the Briefcase icon in this file
function Briefcase({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  )
}
