import { useState } from 'react'
import { PublicLayout } from '../components/layout/PublicLayout'
import { Link } from 'react-router-dom'
import { ChevronDown, ArrowRight } from 'lucide-react'

const faqs = [
  {
    cat: 'Général',
    items: [
      { q: 'Qu\'est-ce que rekruit ?', a: 'rekruit est une plateforme de recrutement alimentée par l\'IA, conçue pour les TPE, PME et agences de recrutement. Elle permet d\'analyser les CVs automatiquement, de scorer les candidats et de gérer tout le processus de recrutement en un seul endroit.' },
      { q: 'Pour qui est rekruit ?', a: 'rekruit est conçu pour toutes les structures qui recrutent : TPE, PME, startups, agences de recrutement. Que vous recrutiez 2 personnes par an ou 200, rekruit s\'adapte à vos besoins.' },
      { q: 'Combien de temps faut-il pour démarrer ?', a: 'Moins de 5 minutes. Créez votre compte, renseignez votre entreprise et publiez votre première offre. Aucune installation, aucune formation requise.' },
    ],
  },
  {
    cat: 'Tarifs',
    items: [
      { q: 'Y a-t-il un essai gratuit ?', a: 'Oui ! Le plan Gratuit vous donne accès aux fonctionnalités essentielles sans limite de durée. Vous pouvez créer des offres, gérer des candidats et utiliser l\'analyse IA de base, sans jamais entrer votre carte bancaire.' },
      { q: 'Quand suis-je facturé ?', a: 'Uniquement si vous choisissez un plan payant (Pro ou Business). La facturation est mensuelle ou annuelle selon votre choix. Vous pouvez annuler à tout moment.' },
      { q: 'Puis-je changer de plan ?', a: 'Oui, vous pouvez monter ou descendre de plan à tout moment depuis votre espace de facturation. Le changement prend effet immédiatement.' },
      { q: 'Proposez-vous des remboursements ?', a: 'Oui, nous offrons un remboursement intégral dans les 14 jours suivant votre premier paiement si vous n\'êtes pas satisfait. Consultez notre politique de remboursement pour plus de détails.' },
    ],
  },
  {
    cat: 'Données & Sécurité',
    items: [
      { q: 'Où sont hébergées mes données ?', a: 'Vos données sont hébergées en France, sur des serveurs certifiés ISO 27001. Nous n\'utilisons jamais vos données à des fins commerciales.' },
      { q: 'rekruit est-il conforme au RGPD ?', a: 'Oui, rekruit est entièrement conforme au RGPD. Nous proposons des outils pour gérer le consentement des candidats, leur droit à l\'oubli et l\'export de leurs données.' },
      { q: 'Mes candidats sont-ils informés ?', a: 'Chaque candidat est informé que ses données sont traitées par rekruit. Vous pouvez personnaliser les mentions légales et les demandes de consentement.' },
    ],
  },
  {
    cat: 'Fonctionnalités',
    items: [
      { q: 'Comment fonctionne l\'analyse IA ?', a: 'Notre IA lit chaque CV, extrait les informations clés (compétences, expériences, formation), les compare à vos critères et génère un score de compatibilité sur 100 avec un résumé détaillé.' },
      { q: 'Combien d\'offres puis-je créer ?', a: 'Cela dépend de votre plan. Le plan Gratuit permet quelques offres actives simultanément. Les plans Pro et Business offrent des offres illimitées.' },
      { q: 'Puis-je inviter mon équipe ?', a: 'Oui, les plans Pro et Business permettent d\'inviter plusieurs recruteurs. Vous pouvez définir des rôles et des permissions pour chaque membre de l\'équipe.' },
    ],
  },
]

function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-slate-200 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(v => !v)} className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 transition-colors">
        <span className="font-semibold text-slate-900 pr-4">{q}</span>
        <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="px-5 pb-5 text-slate-600 text-sm leading-relaxed border-t border-slate-100">
          <div className="pt-4">{a}</div>
        </div>
      )}
    </div>
  )
}

export function FaqPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Questions fréquentes</h1>
            <p className="text-xl text-slate-600">Tout ce que vous devez savoir sur rekruit.</p>
          </div>

          <div className="space-y-10">
            {faqs.map(cat => (
              <div key={cat.cat}>
                <h2 className="text-lg font-bold text-slate-900 mb-4 pb-2 border-b border-slate-200">{cat.cat}</h2>
                <div className="space-y-3">
                  {cat.items.map(item => <FaqItem key={item.q} {...item} />)}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-14 text-center bg-slate-50 rounded-2xl p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Vous n'avez pas trouvé votre réponse ?</h2>
            <p className="text-slate-600 mb-6">Notre équipe est disponible pour vous aider.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Nous contacter <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
