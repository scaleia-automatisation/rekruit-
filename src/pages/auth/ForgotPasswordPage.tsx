import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'

export function ForgotPasswordPage() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } = await resetPassword(email)
    setLoading(false)
    if (error) {
      setError('Une erreur est survenue. Vérifiez votre adresse email.')
    } else {
      setSent(true)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <span className="text-white font-bold">R</span>
          </div>
          <span className="font-bold text-slate-900 text-xl">rekruit</span>
        </div>

        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-8">
          {sent ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                <span className="text-3xl">✉️</span>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Email envoyé</h2>
              <p className="text-slate-500 mb-6">
                Consultez votre boîte mail et cliquez sur le lien pour réinitialiser votre mot de passe.
              </p>
              <Link to="/connexion">
                <Button variant="secondary" className="w-full">Retour à la connexion</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-slate-900 mb-1">Mot de passe oublié</h1>
              <p className="text-slate-500 text-sm mb-7">
                Saisissez votre email et nous vous enverrons un lien de réinitialisation.
              </p>
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <Input
                  label="Email"
                  type="email"
                  placeholder="jean@masociete.fr"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoFocus
                />
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                    {error}
                  </div>
                )}
                <Button type="submit" size="lg" loading={loading} className="w-full mt-1">
                  Envoyer le lien
                </Button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-5">
                <Link to="/connexion" className="text-blue-600 font-medium hover:underline">
                  ← Retour à la connexion
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
