import { useState } from 'react'
import { PublicLayout } from '../../components/layout/PublicLayout'
import { CheckCircle } from 'lucide-react'

export function CookieSettingsPage() {
  const stored = localStorage.getItem('cookie-consent')
  const [analytics, setAnalytics] = useState(stored === 'accepted')
  const [performance, setPerformance] = useState(stored === 'accepted')
  const [saved, setSaved] = useState(false)

  const save = () => {
    localStorage.setItem('cookie-consent', analytics || performance ? 'accepted' : 'declined')
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Paramètres des cookies</h1>
          <p className="text-slate-600 mb-10">Gérez vos préférences de cookies. Vous pouvez modifier ces paramètres à tout moment.</p>

          <div className="space-y-4 mb-8">
            <div className="p-5 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">Cookies essentiels</h3>
                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">Toujours actifs</span>
              </div>
              <p className="text-sm text-slate-600">Nécessaires au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">Cookies analytiques</h3>
                <button onClick={() => setAnalytics(v => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${analytics ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${analytics ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <p className="text-sm text-slate-600">Nous aident à comprendre comment vous utilisez le site pour l'améliorer.</p>
            </div>

            <div className="p-5 border border-slate-200 rounded-2xl">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-semibold text-slate-900">Cookies de performance</h3>
                <button onClick={() => setPerformance(v => !v)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${performance ? 'bg-blue-600' : 'bg-slate-200'}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${performance ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <p className="text-sm text-slate-600">Permettent d'optimiser les performances de la plateforme.</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button onClick={save} className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Enregistrer mes préférences
            </button>
            {saved && (
              <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                <CheckCircle size={16} />
                Préférences sauvegardées
              </div>
            )}
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
