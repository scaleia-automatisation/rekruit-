import { PublicLayout } from '../components/layout/PublicLayout'
import { Link } from 'react-router-dom'
import { ArrowRight, CheckCircle } from 'lucide-react'

const steps = [
  {
    num: '01',
    title: 'Créez votre compte',
    desc: 'Inscrivez-vous en 2 minutes, renseignez votre entreprise et configurez votre équipe de recrutement.',
    details: ['Inscription sans carte bancaire', 'Configuration de l\'entreprise', 'Invitation de l\'équipe', 'Personnalisation du pipeline'],
  },
  {
    num: '02',
    title: 'Publiez votre offre',
    desc: 'Décrivez le poste. Notre IA génère automatiquement les critères d\'évaluation et les questions d\'entretien.',
    details: ['Formulaire guidé simple', 'Suggestions IA des compétences requises', 'Lien candidat unique', 'Publication instantanée'],
  },
  {
    num: '03',
    title: 'Recevez les candidatures',
    desc: 'Les candidats postulent via votre lien personnalisé. Leur CV est traité instantanément par notre IA.',
    details: ['Formulaire candidat personnalisable', 'Upload CV automatique', 'Accusé de réception automatique', 'Alerte en temps réel'],
  },
  {
    num: '04',
    title: 'L\'IA analyse et score',
    desc: 'Chaque candidature est analysée, scorée et classée. Vous voyez immédiatement les meilleurs profils.',
    details: ['Score de compatibilité sur 100', 'Résumé IA du profil', 'Points forts et faiblesses', 'Classement automatique'],
  },
  {
    num: '05',
    title: 'Planifiez les entretiens',
    desc: 'Invitez les candidats retenus, planifiez les entretiens et notez vos observations directement dans rekruit.',
    details: ['Calendrier intégré', 'Templates d\'invitation', 'Guide d\'entretien IA', 'Notes et scores'],
  },
  {
    num: '06',
    title: 'Prenez votre décision',
    desc: 'Comparez les candidats côte à côte, partagez vos avis en équipe et recrutez le meilleur profil.',
    details: ['Comparaison multi-candidats', 'Avis de l\'équipe', 'Lettre d\'offre', 'Archivage des candidatures'],
  },
]

export function HowItWorksPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Comment ça marche</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">De la publication de l'offre à l'embauche, rekruit simplifie chaque étape de votre recrutement.</p>
          </div>

          <div className="space-y-12">
            {steps.map((s, i) => (
              <div key={s.num} className="flex gap-8 items-start">
                <div className="shrink-0 w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center text-lg font-bold">
                  {s.num}
                </div>
                <div className="flex-1 pt-2">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h2>
                  <p className="text-slate-600 mb-4 leading-relaxed">{s.desc}</p>
                  <ul className="grid grid-cols-2 gap-2">
                    {s.details.map(d => (
                      <li key={d} className="flex items-center gap-2 text-sm text-slate-700">
                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                        {d}
                      </li>
                    ))}
                  </ul>
                </div>
                {i < steps.length - 1 && (
                  <div className="hidden lg:block shrink-0 w-16 mt-8 text-slate-300">
                    <ArrowRight size={20} className="mx-auto" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link to="/inscription" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
              Commencer maintenant <ArrowRight size={18} />
            </Link>
            <p className="mt-3 text-sm text-slate-500">Gratuit · Sans carte bancaire</p>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
