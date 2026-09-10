import { PublicLayout } from '../../components/layout/PublicLayout'

export function PrivacyContactPage() {
  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Contact Données personnelles</h1>
          <p className="text-slate-500 text-sm mb-10">Exercez vos droits RGPD</p>
          <div className="space-y-8 text-slate-600">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <h2 className="text-xl font-bold text-slate-900 mb-4">Vos droits</h2>
              <ul className="space-y-2 text-sm">
                {['Droit d\'accès à vos données', 'Droit de rectification', 'Droit à l\'effacement (droit à l\'oubli)', 'Droit à la portabilité', 'Droit d\'opposition', 'Droit à la limitation du traitement'].map(r => (
                  <li key={r} className="flex items-center gap-2">
                    <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Comment exercer vos droits</h2>
              <p className="mb-4">Envoyez votre demande à notre responsable de la protection des données :</p>
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                <p className="font-semibold text-blue-900">privacy@rekruit.net</p>
                <p className="text-sm text-blue-700 mt-1">Réponse sous 30 jours maximum</p>
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Informations à fournir</h2>
              <p className="text-sm">Précisez dans votre demande : votre nom, prénom, adresse email associée à votre compte, et la nature de votre demande. Une pièce d'identité peut être demandée pour vérifier votre identité.</p>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 mb-3">Réclamation auprès de la CNIL</h2>
              <p className="text-sm">Si vous estimez que vos droits ne sont pas respectés, vous pouvez introduire une réclamation auprès de la CNIL (www.cnil.fr).</p>
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
