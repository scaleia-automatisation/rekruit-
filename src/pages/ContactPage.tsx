import { useState } from 'react'
import { PublicLayout } from '../components/layout/PublicLayout'
import { Mail, MessageSquare, Clock, CheckCircle } from 'lucide-react'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <PublicLayout>
      <div className="pt-24 pb-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 mb-4">Contactez-nous</h1>
            <p className="text-xl text-slate-600">Notre équipe est là pour vous aider.</p>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Contact info */}
            <div className="space-y-6">
              <div className="p-6 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Mail size={18} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Email</h3>
                <p className="text-sm text-slate-600">support@rekruit.net</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <MessageSquare size={18} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Chat en direct</h3>
                <p className="text-sm text-slate-600">Disponible dans l'application pour les comptes Pro et Business.</p>
              </div>
              <div className="p-6 bg-slate-50 rounded-2xl">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mb-3">
                  <Clock size={18} className="text-blue-600" />
                </div>
                <h3 className="font-semibold text-slate-900 mb-1">Délai de réponse</h3>
                <p className="text-sm text-slate-600">Moins de 24h en jours ouvrés.</p>
              </div>
            </div>

            {/* Contact form */}
            <div className="lg:col-span-2">
              {sent ? (
                <div className="h-full flex items-center justify-center text-center p-12 bg-green-50 rounded-2xl border border-green-100">
                  <div>
                    <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
                    <h2 className="text-xl font-bold text-slate-900 mb-2">Message envoyé !</h2>
                    <p className="text-slate-600">Nous vous répondrons dans les 24h.</p>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Nom</label>
                      <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Votre nom" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                      <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="votre@email.com" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Sujet</label>
                    <input required value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm" placeholder="En quoi pouvons-nous vous aider ?" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Message</label>
                    <textarea required rows={6} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none" placeholder="Décrivez votre besoin..." />
                  </div>
                  <button type="submit" className="w-full py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
                    Envoyer le message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </PublicLayout>
  )
}
