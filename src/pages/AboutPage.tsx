import { PublicLayout } from '../components/layout/PublicLayout'
import { Link } from 'react-router-dom'
import { ArrowRight, Heart, Target, Zap } from 'lucide-react'

export function AboutPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          {/* Hero */}
          <div className="text-center mb-16">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">À propos de rekruit</h1>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Nous croyons que chaque entreprise mérite d'accéder aux meilleurs outils de recrutement, quelle que soit sa taille.
            </p>
          </div>

          {/* Mission */}
          <div className="bg-blue-50 rounded-3xl p-10 mb-14 text-center">
            <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Target size={24} className="text-white" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-3">Notre mission</h2>
            <p className="text-slate-700 leading-relaxed max-w-2xl mx-auto">
              Démocratiser le recrutement intelligent. Nous mettons la puissance de l'IA au service des équipes RH pour qu'elles puissent se concentrer sur ce qui compte vraiment : l'humain.
            </p>
          </div>

          {/* Values */}
          <div className="grid md:grid-cols-3 gap-6 mb-14">
            {[
              { icon: <Zap size={20} className="text-blue-600" />, title: 'Innovation', desc: 'Nous intégrons les dernières avancées de l\'IA pour vous offrir des outils toujours plus performants.' },
              { icon: <Heart size={20} className="text-blue-600" />, title: 'Humanité', desc: 'La technologie amplifie les capacités humaines, elle ne les remplace pas. Chaque décision reste la vôtre.' },
              { icon: <Target size={20} className="text-blue-600" />, title: 'Accessibilité', desc: 'Des outils professionnels accessibles à toutes les tailles d\'entreprise, à des prix justes.' },
            ].map(v => (
              <div key={v.title} className="p-6 rounded-2xl border border-slate-200 text-center">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center mx-auto mb-3">{v.icon}</div>
                <h3 className="font-semibold text-slate-900 mb-2">{v.title}</h3>
                <p className="text-slate-600 text-sm leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>

          {/* Story */}
          <div className="mb-14">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Notre histoire</h2>
            <div className="prose prose-slate max-w-none text-slate-600 leading-relaxed space-y-4">
              <p>
                rekruit est né d'un constat simple : les PME et TPE n'ont pas accès aux mêmes outils de recrutement que les grandes entreprises, pourtant elles font face aux mêmes défis.
              </p>
              <p>
                Nous avons créé rekruit pour changer ça. Une plateforme complète, alimentée par l'IA, qui permet à n'importe quelle équipe RH de recruter aussi efficacement que les plus grandes entreprises.
              </p>
              <p>
                Aujourd'hui, des centaines d'équipes font confiance à rekruit pour trouver les meilleurs talents.
              </p>
            </div>
          </div>

          <div className="text-center">
            <Link to="/inscription" className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg">
              Rejoindre rekruit <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
