import { PublicLayout } from '../../components/layout/PublicLayout'

export function CgvPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Conditions Générales de Vente</h1>
          <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : janvier 2025</p>
          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">1. Objet</h2>
              <p>Les présentes Conditions Générales de Vente (CGV) régissent les ventes de services (abonnements) proposés par rekruit via la plateforme rekruit.net.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">2. Offres et tarifs</h2>
              <p>rekruit propose plusieurs plans d'abonnement (Gratuit, Pro, Business) dont les tarifs sont indiqués sur la page /pricing. Les prix sont en euros HT, TVA en sus. rekruit se réserve le droit de modifier ses tarifs avec un préavis de 30 jours.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">3. Commande et paiement</h2>
              <p>La souscription s'effectue en ligne. Le paiement est traité par Stripe. En validant votre abonnement, vous autorisez le prélèvement automatique mensuel ou annuel selon le plan choisi.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">4. Facturation</h2>
              <p>Les factures sont disponibles dans votre espace de facturation. Elles sont émises en début de chaque période d'abonnement.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">5. Droit de rétractation</h2>
              <p>Conformément à l'article L221-28 du Code de la consommation, le droit de rétractation ne s'applique pas aux services entièrement exécutés avant la fin du délai de rétractation. Toutefois, nous offrons un remboursement de 14 jours sur votre premier paiement (voir politique de remboursement).</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">6. Résiliation</h2>
              <p>Vous pouvez résilier votre abonnement à tout moment. La résiliation prend effet à la fin de la période en cours. Aucun remboursement prorata n'est effectué sauf dans le cadre de la garantie 14 jours.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">7. Droit applicable</h2>
              <p>Les présentes CGV sont régies par le droit français.</p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
