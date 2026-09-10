import { PublicLayout } from '../../components/layout/PublicLayout'
import { Link } from 'react-router-dom'

export function CookiesPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Politique de cookies</h1>
          <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : janvier 2025</p>
          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Qu'est-ce qu'un cookie ?</h2>
              <p>Un cookie est un petit fichier texte déposé sur votre appareil lorsque vous visitez un site web. Il permet de mémoriser des informations sur votre visite et d'améliorer votre expérience.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Cookies utilisés</h2>
              <div className="space-y-4">
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-slate-900 mb-1">Cookies essentiels</h3>
                  <p className="text-sm">Nécessaires au fonctionnement du site (session, authentification). Ne peuvent être désactivés.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-slate-900 mb-1">Cookies analytiques</h3>
                  <p className="text-sm">Nous aident à comprendre comment les visiteurs utilisent le site (pages vues, durée de visite). Requièrent votre consentement.</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-xl">
                  <h3 className="font-semibold text-slate-900 mb-1">Cookies de performance</h3>
                  <p className="text-sm">Permettent d'améliorer les performances du site. Requièrent votre consentement.</p>
                </div>
              </div>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Gestion des cookies</h2>
              <p>Vous pouvez gérer vos préférences de cookies à tout moment :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Via le bandeau de consentement lors de votre première visite</li>
                <li>Via la page <Link to="/cookie-settings" className="text-blue-600 hover:underline">Paramètres cookies</Link></li>
                <li>Via les paramètres de votre navigateur</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Contact</h2>
              <p>Pour toute question relative aux cookies : privacy@rekruit.net</p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
