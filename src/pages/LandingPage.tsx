import { Link } from 'react-router-dom'
import { PublicLayout } from '../components/layout/PublicLayout'
import {
  Zap, Users, BarChart2, CheckCircle, ArrowRight, Star,
  Clock, Shield, Award, MessageSquare, ChevronRight
} from 'lucide-react'

const features = [
  {
    icon: <Zap className="text-blue-600" size={24} />,
    title: 'Analyse IA instantanée',
    desc: 'Nos algorithmes analysent chaque CV en quelques secondes et vous donnent un score de compatibilité précis.',
  },
  {
    icon: <Users className="text-blue-600" size={24} />,
    title: 'Gestion des candidats',
    desc: 'Pipeline Kanban complet pour suivre chaque candidat de la réception à l\'embauche.',
  },
  {
    icon: <BarChart2 className="text-blue-600" size={24} />,
    title: 'Analytics avancés',
    desc: 'Tableaux de bord en temps réel pour piloter votre recrutement avec des données précises.',
  },
  {
    icon: <MessageSquare className="text-blue-600" size={24} />,
    title: 'Entretiens assistés',
    desc: 'Guides d\'entretien personnalisés et analyse des comptes-rendus par l\'IA.',
  },
  {
    icon: <Clock className="text-blue-600" size={24} />,
    title: 'Gain de temps x5',
    desc: 'Automatisez les tâches répétitives et concentrez-vous sur l\'humain.',
  },
  {
    icon: <Shield className="text-blue-600" size={24} />,
    title: 'RGPD & sécurité',
    desc: 'Données hébergées en France, conformité RGPD intégrée, chiffrement de bout en bout.',
  },
]

const steps = [
  { num: '01', title: 'Créez votre offre', desc: 'Décrivez le poste en quelques minutes. Notre IA génère automatiquement les critères d\'évaluation.' },
  { num: '02', title: 'Recevez les candidatures', desc: 'Partagez votre lien unique. Les candidats postulent directement depuis leur mobile ou ordinateur.' },
  { num: '03', title: 'L\'IA trie et score', desc: 'Chaque CV est analysé, scoré et classé automatiquement selon vos critères.' },
  { num: '04', title: 'Recrutez les meilleurs', desc: 'Entretiens, suivi, décision : tout est centralisé dans rekruit.' },
]

const testimonials = [
  {
    name: 'Sophie M.',
    role: 'DRH — PME 120 personnes',
    text: 'rekruit nous a fait gagner 3 semaines sur notre dernier recrutement. L\'IA nous a identifié le candidat idéal que nous aurions probablement raté.',
    stars: 5,
  },
  {
    name: 'Thomas L.',
    role: 'Fondateur — Agence de recrutement',
    text: 'On gère 40 missions simultanément avec 3 recruteurs grâce à rekruit. Impossible avant. ROI immédiat.',
    stars: 5,
  },
  {
    name: 'Amélie D.',
    role: 'RH — Startup tech',
    text: 'Interface intuitive, IA vraiment pertinente, support réactif. Exactement ce qu\'il nous fallait.',
    stars: 5,
  },
]

const faqs = [
  {
    q: 'Puis-je essayer rekruit gratuitement ?',
    a: 'Oui ! Le plan Gratuit vous donne accès aux fonctionnalités essentielles sans limite de durée. Aucune carte bancaire requise.',
  },
  {
    q: 'Combien de temps faut-il pour démarrer ?',
    a: 'Moins de 5 minutes. Créez votre compte, renseignez votre entreprise et publiez votre première offre.',
  },
  {
    q: 'Mes données sont-elles sécurisées ?',
    a: 'Absolument. Données hébergées en France, chiffrement SSL, conformité RGPD totale. Vos données vous appartiennent.',
  },
]

export function LandingPage() {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="pt-28 pb-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6 border border-blue-100">
            <Award size={14} />
            <span>Nouveau : Analyse IA de CVs en temps réel</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight mb-6">
            Recrutez plus vite,<br />
            <span className="text-blue-600">recrutez mieux</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            rekruit analyse vos CVs avec l'IA, score les candidats et pilote votre processus de recrutement de A à Z — pour les TPE, PME et agences.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/inscription"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 hover:-translate-y-0.5 flex items-center justify-center gap-2">
              Commencer gratuitement
              <ArrowRight size={18} />
            </Link>
            <Link to="/how-it-works"
              className="w-full sm:w-auto px-8 py-4 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors flex items-center justify-center gap-2">
              Voir comment ça marche
              <ChevronRight size={18} />
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-500">Gratuit pour commencer · Sans carte bancaire · RGPD ✓</p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-blue-600">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { value: '5x', label: 'Plus rapide' },
              { value: '98%', label: 'Précision IA' },
              { value: '500+', label: 'Entreprises' },
              { value: '< 5min', label: 'Pour démarrer' },
            ].map(s => (
              <div key={s.label}>
                <div className="text-3xl font-bold mb-1">{s.value}</div>
                <div className="text-blue-200 text-sm">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Tout ce dont vous avez besoin</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Une plateforme complète pour couvrir l'intégralité de votre processus de recrutement.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(f => (
              <div key={f.title} className="p-6 rounded-2xl border border-slate-100 hover:border-blue-100 hover:shadow-md transition-all bg-white">
                <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">{f.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/features" className="inline-flex items-center gap-2 text-blue-600 font-semibold hover:underline">
              Voir toutes les fonctionnalités <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">En 4 étapes simples</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Démarrez en moins de 5 minutes, recrutez en quelques jours.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map(s => (
              <div key={s.num} className="text-center">
                <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold mx-auto mb-4">{s.num}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{s.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Ils nous font confiance</h2>
            <p className="text-lg text-slate-600">Des centaines d'équipes RH utilisent rekruit chaque jour.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map(t => (
              <div key={t.name} className="p-6 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.stars }).map((_, i) => (
                    <Star key={i} size={16} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                <div>
                  <div className="font-semibold text-slate-900 text-sm">{t.name}</div>
                  <div className="text-slate-500 text-xs">{t.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing CTA */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">Commencez gratuitement</h2>
          <p className="text-lg text-slate-600 mb-8">
            Aucune carte bancaire requise. Passez à un plan payant quand vous êtes prêt.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/inscription"
              className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-lg flex items-center justify-center gap-2">
              Créer mon compte gratuit <ArrowRight size={18} />
            </Link>
            <Link to="/pricing" className="w-full sm:w-auto px-8 py-4 text-slate-700 font-semibold rounded-xl hover:bg-slate-100 transition-colors">
              Voir les tarifs
            </Link>
          </div>
          <div className="mt-8 flex items-center justify-center gap-6 text-sm text-slate-500">
            {['Sans carte bancaire', 'RGPD ✓', 'Support inclus'].map(item => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-green-500" /> {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Questions fréquentes</h2>
          </div>
          <div className="space-y-4">
            {faqs.map(f => (
              <div key={f.q} className="p-6 rounded-2xl border border-slate-200">
                <h3 className="font-semibold text-slate-900 mb-2">{f.q}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link to="/faq" className="text-blue-600 font-semibold hover:underline">
              Voir toutes les questions →
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Prêt à transformer votre recrutement ?</h2>
          <p className="text-blue-100 text-lg mb-8">Rejoignez 500+ équipes RH qui recrutent plus vite avec rekruit.</p>
          <Link to="/inscription"
            className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors shadow-lg">
            Démarrer gratuitement <ArrowRight size={18} />
          </Link>
        </div>
      </section>
    </PublicLayout>
  )
}
