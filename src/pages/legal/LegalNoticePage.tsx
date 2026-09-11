import { PublicLayout } from '../../components/layout/PublicLayout'

export function LegalNoticePage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Mentions légales</h1>
          <p className="text-slate-500 text-sm mb-10">Conformément à la loi n°2004-575 du 21 juin 2004</p>
          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Éditeur du site</h2>
              <p>rekruit<br />
              Email : contact@rekruit.net<br />
              Site web : https://rekruit.net</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Hébergement</h2>
              <p>Le site rekruit.net est hébergé par :<br />
              Vercel Inc.<br />
              440 N Barranca Ave #4133, Covina, CA 91723, États-Unis<br /><br />
              Les données sont stockées par Supabase (AWS eu-west-3, Paris).</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Propriété intellectuelle</h2>
              <p>L'ensemble du contenu de ce site (textes, images, graphiques, logo, icônes, sons, logiciels) est la propriété exclusive de rekruit. Toute reproduction, distribution, modification ou utilisation de ces contenus sans autorisation préalable est strictement interdite.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Données personnelles</h2>
              <p>Conformément au RGPD, vous disposez d'un droit d'accès, de rectification et de suppression de vos données personnelles. Pour exercer ces droits : privacy@rekruit.net</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Cookies</h2>
              <p>Ce site utilise des cookies techniques nécessaires au bon fonctionnement du service et des cookies analytiques (avec votre consentement). Vous pouvez gérer vos préférences dans les paramètres cookies.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Droit applicable</h2>
              <p>Le présent site et son contenu sont soumis au droit français. Tout litige sera soumis aux tribunaux français compétents.</p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
