import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'

export function CookieBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) setVisible(true)
  }, [])

  const accept = () => {
    localStorage.setItem('cookie-consent', 'accepted')
    setVisible(false)
  }

  const decline = () => {
    localStorage.setItem('cookie-consent', 'declined')
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-200 p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex-1 text-sm text-slate-600">
          <p className="font-semibold text-slate-900 mb-1">Nous utilisons des cookies 🍪</p>
          <p>
            Pour améliorer votre expérience et analyser notre trafic. Consultez notre{' '}
            <Link to="/privacy" className="text-blue-600 underline hover:no-underline">politique de confidentialité</Link>{' '}
            et notre{' '}
            <Link to="/cookies" className="text-blue-600 underline hover:no-underline">politique de cookies</Link>.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button onClick={decline} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
            Refuser
          </button>
          <button onClick={accept} className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors">
            Accepter
          </button>
          <button onClick={decline} className="p-1.5 text-slate-400 hover:text-slate-700 transition-colors">
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  )
}
