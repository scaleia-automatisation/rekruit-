import { useState } from 'react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { CheckCircle, AlertTriangle } from 'lucide-react'

export function DataDeletionPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Suppression de vos données</h1>
          <p className="text-slate-600 mb-10">Exercez votre droit à l'effacement (RGPD Art. 17).</p>

          {sent ? (
            <div className="p-8 bg-green-50 rounded-2xl text-center">
              <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-slate-900 mb-2">Demande reçue</h2>
              <p className="text-slate-600">Nous avons bien reçu votre demande de suppression. Nous y donnerons suite dans un délai de 30 jours.</p>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
                <AlertTriangle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                <div className="text-sm text-amber-800">
                  <strong>Attention :</strong> La suppression de vos données est irréversible. Votre compte et toutes les données associées seront définitivement supprimés.
                </div>
              </div>

              <div className="space-y-3 text-sm text-slate-600">
                <p><strong>Ce qui sera supprimé :</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Votre compte et vos informations personnelles</li>
                  <li>Les offres d'emploi créées</li>
                  <li>Les données candidats liées à votre organisation</li>
                  <li>Vos historiques d'entretiens</li>
                </ul>
                <p><strong>Ce qui sera conservé :</strong></p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Les données de facturation (obligation légale 10 ans)</li>
                </ul>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Adresse email du compte à supprimer</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="votre@email.com"
                  />
                </div>
                <button type="submit" className="w-full py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors">
                  Demander la suppression de mes données
                </button>
              </form>

              <p className="text-xs text-slate-500 text-center">Vous pouvez aussi nous contacter à privacy@rekruit.net</p>
            </div>
          )}
        </div>
      </div>
    </PublicLayout>
  )
}
