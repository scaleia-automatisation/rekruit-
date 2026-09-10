import { PublicLayout } from '../../components/layout/PublicLayout'

export function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Politique de confidentialité</h1>
          <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : janvier 2025</p>
          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Responsable du traitement</h2>
              <p>rekruit, éditeur de la plateforme rekruit.net, est responsable du traitement de vos données personnelles. Pour toute question relative à vos données, contactez-nous à : privacy@rekruit.net</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Données collectées</h2>
              <p>Nous collectons les données suivantes :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Données d'identification : nom, prénom, adresse email</li>
                <li>Données professionnelles : entreprise, poste</li>
                <li>Données de navigation : logs d'accès, adresses IP</li>
                <li>Données de paiement : via Stripe (nous ne stockons pas les données de carte)</li>
                <li>Données des candidats que vous traitez via notre plateforme</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Finalités du traitement</h2>
              <p>Vos données sont utilisées pour :</p>
              <ul className="list-disc pl-6 space-y-1 mt-2">
                <li>Fournir et améliorer nos services</li>
                <li>Gérer votre compte et votre abonnement</li>
                <li>Vous envoyer des communications relatives au service</li>
                <li>Respecter nos obligations légales</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Base légale</h2>
              <p>Le traitement est fondé sur : l'exécution du contrat (services souscrits), le respect d'obligations légales, et nos intérêts légitimes (amélioration du service, sécurité).</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Conservation des données</h2>
              <p>Vos données sont conservées pendant la durée de votre abonnement, puis 3 ans après la résiliation pour les données contractuelles, conformément aux obligations légales.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Vos droits</h2>
              <p>Vous disposez des droits suivants : accès, rectification, effacement, portabilité, opposition, limitation. Pour exercer ces droits, contactez : privacy@rekruit.net</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Hébergement</h2>
              <p>Vos données sont hébergées en France/Europe par Supabase (AWS eu-west-3). Aucun transfert hors UE n'est effectué sans garanties appropriées.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">8. Contact DPO</h2>
              <p>Pour toute question relative à la protection de vos données : privacy@rekruit.net</p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
