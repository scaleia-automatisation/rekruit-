import { PublicLayout } from '../../components/layout/PublicLayout'
import { Link } from 'react-router-dom'

export function RefundPolicyPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Politique de remboursement</h1>
          <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : janvier 2025</p>
          <div className="prose prose-slate max-w-none space-y-8 text-slate-600">
            <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100">
              <h2 className="text-xl font-bold text-blue-900 mb-2">Garantie 14 jours</h2>
              <p className="text-blue-800">Si vous n'êtes pas satisfait de votre premier paiement, nous vous remboursons intégralement dans les 14 jours. Sans questions.</p>
            </div>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Conditions de remboursement</h2>
              <ul className="list-disc pl-6 space-y-2">
                <li>La demande doit être faite dans les 14 jours suivant votre premier paiement</li>
                <li>S'applique uniquement au premier paiement d'un abonnement payant</li>
                <li>Le remboursement est effectué sur le moyen de paiement original sous 5-10 jours ouvrés</li>
                <li>Ne s'applique pas aux renouvellements d'abonnement</li>
              </ul>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Demander un remboursement</h2>
              <p>Pour demander un remboursement, contactez-nous à billing@rekruit.net avec votre adresse email et l'objet "Remboursement". Nous traiterons votre demande dans les 48h ouvrées.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Annulation d'abonnement</h2>
              <p>Vous pouvez annuler votre abonnement à tout moment depuis <Link to="/parametres" className="text-blue-600 hover:underline">vos paramètres</Link>. L'annulation prend effet à la fin de la période payée. Aucun remboursement prorata n'est effectué pour les périodes non utilisées au-delà de la garantie 14 jours.</p>
            </section>
            <section>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Contact</h2>
              <p>Pour toute question : billing@rekruit.net</p>
            </section>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
