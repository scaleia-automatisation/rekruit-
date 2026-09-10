import { PublicLayout } from '../components/layout/PublicLayout'
import { Link } from 'react-router-dom'
import { BookOpen, MessageSquare, Video, ArrowRight, Search } from 'lucide-react'

const articles = [
  { cat: 'Démarrage', items: ['Créer votre premier compte', 'Configurer votre entreprise', 'Inviter votre équipe', 'Publier votre première offre'] },
  { cat: 'Candidats & IA', items: ['Comment fonctionne le score IA', 'Ajouter des candidats manuellement', 'Comprendre l\'analyse du CV', 'Filtrer et rechercher des candidats'] },
  { cat: 'Entretiens', items: ['Planifier un entretien', 'Utiliser le guide d\'entretien IA', 'Prendre des notes pendant l\'entretien', 'Analyser les résultats'] },
  { cat: 'Facturation', items: ['Changer de plan', 'Télécharger une facture', 'Gérer le paiement', 'Annuler un abonnement'] },
]

export function HelpPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Centre d'aide</h1>
            <p className="text-xl text-slate-600 mb-8">Trouvez rapidement les réponses à vos questions.</p>
            <div className="max-w-lg mx-auto relative">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Rechercher un article..."
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Quick links */}
          <div className="grid md:grid-cols-3 gap-4 mb-12">
            {[
              { icon: <BookOpen size={20} className="text-blue-600" />, title: 'Documentation', desc: 'Guides complets et tutoriels détaillés' },
              { icon: <Video size={20} className="text-blue-600" />, title: 'Vidéos', desc: 'Tutoriels vidéo pour démarrer rapidement' },
              { icon: <MessageSquare size={20} className="text-blue-600" />, title: 'Support', desc: 'Contactez notre équipe directement' },
            ].map(item => (
              <div key={item.title} className="p-5 bg-white rounded-2xl border border-slate-200 hover:border-blue-200 hover:shadow-sm transition-all cursor-pointer">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mb-3">{item.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-1">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.desc}</p>
              </div>
            ))}
          </div>

          {/* Articles */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {articles.map(cat => (
              <div key={cat.cat} className="p-6 bg-slate-50 rounded-2xl">
                <h2 className="font-bold text-slate-900 mb-4">{cat.cat}</h2>
                <ul className="space-y-2">
                  {cat.items.map(item => (
                    <li key={item} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                      <ArrowRight size={14} className="shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="text-center bg-slate-900 rounded-2xl p-8 text-white">
            <h2 className="text-xl font-bold mb-2">Besoin d'aide supplémentaire ?</h2>
            <p className="text-slate-400 mb-6">Notre équipe répond en moins de 24h.</p>
            <Link to="/contact" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Contacter le support <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
