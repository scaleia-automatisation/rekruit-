import { PublicLayout } from '../../components/layout/PublicLayout'

export function TermsPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Conditions Générales d'Utilisation</h1>
          <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : janvier 2025</p>
          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Objet</h2>
              <p>Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation de la plateforme rekruit.net, éditée par rekruit. En vous inscrivant, vous acceptez ces CGU sans réserve.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Accès au service</h2>
              <p>rekruit est accessible via internet à tout professionnel disposant d'un compte. L'inscription est soumise à la création d'un compte avec une adresse email valide. Vous êtes responsable de la confidentialité de vos identifiants.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Utilisation du service</h2>
              <p>Vous vous engagez à utiliser rekruit conformément aux lois en vigueur et notamment à :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Ne pas utiliser le service à des fins illicites ou frauduleuses</li>
                <li>Ne pas porter atteinte aux droits des tiers</li>
                <li>Respecter la réglementation RGPD dans votre usage des données candidats</li>
                <li>Ne pas tenter de contourner les mesures de sécurité</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Données candidats</h2>
              <p>En tant qu'utilisateur de rekruit, vous êtes responsable de traitement des données des candidats que vous importez. Vous vous engagez à respecter leurs droits (information, accès, effacement) et à obtenir leur consentement si nécessaire.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Propriété intellectuelle</h2>
              <p>La plateforme rekruit, son code, son design et son contenu sont la propriété exclusive de rekruit. Toute reproduction non autorisée est interdite.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Disponibilité</h2>
              <p>rekruit s'efforce de maintenir le service disponible 24h/24, 7j/7, mais ne peut garantir une disponibilité sans interruption. Des maintenances planifiées peuvent être effectuées.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Résiliation</h2>
              <p>Vous pouvez résilier votre compte à tout moment depuis les paramètres. rekruit se réserve le droit de suspendre ou résilier un compte en cas de violation des présentes CGU.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">8. Droit applicable</h2>
              <p>Les présentes CGU sont soumises au droit français. En cas de litige, les tribunaux français sont seuls compétents.</p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
