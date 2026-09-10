import { PublicLayout } from '../components/layout/PublicLayout'
import { Link } from 'react-router-dom'
import { Zap, Users, BarChart2, Calendar, MessageSquare, Shield, ArrowRight, CheckCircle } from 'lucide-react'

const sections = [
  {
    icon: <Zap size={28} className="text-blue-600" />,
    title: 'Analyse IA de CVs',
    desc: 'Notre moteur d\'IA analyse chaque CV en quelques secondes, extrait les informations clés et calcule un score de compatibilité avec votre offre.',
    items: ['Score de compatibilité sur 100', 'Extraction automatique des compétences', 'Détection des expériences clés', 'Résumé IA du profil'],
  },
  {
    icon: <Users size={28} className="text-blue-600" />,
    title: 'Pipeline de recrutement',
    desc: 'Gérez tous vos candidats dans un pipeline Kanban visuel, de la réception à l\'embauche.',
    items: ['Pipeline personnalisable', 'Glisser-déposer intuitif', 'Filtres et recherche avancée', 'Suivi en temps réel'],
  },
  {
    icon: <BarChart2 size={28} className="text-blue-600" />,
    title: 'Analytics et reporting',
    desc: 'Pilotez votre recrutement avec des données précises et des tableaux de bord en temps réel.',
    items: ['Taux de conversion par étape', 'Délais de recrutement', 'Sources des candidatures', 'Rapports exportables'],
  },
  {
    icon: <Calendar size={28} className="text-blue-600" />,
    title: 'Planification d\'entretiens',
    desc: 'Calendrier intégré pour planifier, suivre et analyser tous vos entretiens.',
    items: ['Calendrier partagé', 'Rappels automatiques', 'Notes d\'entretien', 'Comptes-rendus IA'],
  },
  {
    icon: <MessageSquare size={28} className="text-blue-600" />,
    title: 'Communication centralisée',
    desc: 'Tous vos échanges avec les candidats centralisés dans rekruit.',
    items: ['Templates d\'emails', 'Envoi de masse', 'Historique des échanges', 'Notifications temps réel'],
  },
  {
    icon: <Shield size={28} className="text-blue-600" />,
    title: 'Conformité RGPD',
    desc: 'Recrutez en toute conformité avec les réglementations européennes sur la protection des données.',
    items: ['Hébergement en France', 'Consentement candidats', 'Droit à l\'oubli', 'Export des données'],
  },
]

export function FeaturesPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Toutes les fonctionnalités</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">Une plateforme complète pour gérer l'intégralité de votre processus de recrutement.</p>
          </div>

          <div className="space-y-16">
            {sections.map((s, i) => (
              <div key={s.title} className={`flex flex-col ${i % 2 === 0 ? 'lg:flex-row' : 'lg:flex-row-reverse'} gap-12 items-center`}>
                <div className="flex-1">
                  <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">{s.icon}</div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-3">{s.title}</h2>
                  <p className="text-slate-600 leading-relaxed mb-6">{s.desc}</p>
                  <ul className="space-y-2">
                    {s.items.map(item => (
                      <li key={item} className="flex items-center gap-2 text-slate-700 text-sm">
                        <CheckCircle size={16} className="text-green-500 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="flex-1 bg-gradient-to-br from-slate-100 to-blue-50 rounded-2xl h-64 flex items-center justify-center">
                  <div className="text-slate-400 text-sm">Aperçu {s.title}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-20 text-center bg-blue-600 rounded-3xl p-12 text-white">
            <h2 className="text-3xl font-bold mb-4">Essayez toutes ces fonctionnalités</h2>
            <p className="text-blue-100 mb-8">Démarrez gratuitement, sans carte bancaire.</p>
            <Link to="/inscription" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-blue-600 font-bold rounded-xl hover:bg-blue-50 transition-colors">
              Créer mon compte gratuit <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
