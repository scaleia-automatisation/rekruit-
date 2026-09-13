import { useState } from 'react'
import { Loader2, Wand2 } from 'lucide-react'
import { Button } from '../ui/Button'

interface MessageEditorProps {
  subject: string
  message: string
  onSubjectChange: (v: string) => void
  onMessageChange: (v: string) => void
  onGenerate?: () => Promise<void>
  generating?: boolean
  slots?: { label: string }[]
}

export function MessageEditor({
  subject, message, onSubjectChange, onMessageChange, onGenerate, generating, slots
}: MessageEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex gap-1 bg-slate-100 rounded-lg p-1">
          <button
            onClick={() => setTab('edit')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'edit' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            Modifier
          </button>
          <button
            onClick={() => setTab('preview')}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all ${tab === 'preview' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}
          >
            Aperçu email
          </button>
        </div>
        {onGenerate && (
          <Button size="sm" variant="secondary" onClick={onGenerate} disabled={generating}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            Régénérer
          </Button>
        )}
      </div>

      {tab === 'edit' ? (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Sujet</label>
            <input
              value={subject}
              onChange={e => onSubjectChange(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
            <textarea
              value={message}
              onChange={e => onMessageChange(e.target.value)}
              rows={8}
              className="w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
            />
          </div>
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
          {/* Simulated email header */}
          <div className="bg-white border-b border-slate-100 px-5 py-3 flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-xs">R</span>
            </div>
            <span className="font-semibold text-slate-900 text-sm">rekruit</span>
            <span className="ml-auto text-xs text-slate-400">Objet : {subject}</span>
          </div>

          {/* Message body */}
          <div className="px-5 pt-4 pb-2">
            <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{message}</pre>
          </div>

          {/* Buttons section preview */}
          {slots && slots.length > 0 && (
            <div className="px-5 pb-5">
              <div className="border-t border-slate-200 pt-4 mt-2">
                <p className="text-xs font-semibold text-slate-700 mb-3">Choisissez votre créneau :</p>
                <div className="space-y-2 mb-4">
                  {slots.map((s, i) => (
                    <div
                      key={i}
                      className="block bg-blue-600 text-white px-4 py-3 rounded-xl text-sm font-semibold text-center select-none"
                    >
                      📅 {s.label}
                    </div>
                  ))}
                </div>
                <div className="border-t border-dashed border-slate-200 pt-3">
                  <p className="text-xs text-slate-400 mb-2">Ou signalez votre situation :</p>
                  <div className="border border-amber-400 text-amber-800 bg-amber-50 px-4 py-2.5 rounded-xl text-sm font-semibold text-center mb-1 select-none">
                    🗓 Je ne suis pas disponible à ces dates
                  </div>
                  <p className="text-xs text-slate-400 text-center mb-3">Le recruteur sera informé et pourra vous proposer d'autres créneaux</p>
                  <div className="border border-slate-200 text-slate-600 bg-white px-4 py-2.5 rounded-xl text-sm font-semibold text-center mb-1 select-none">
                    🔕 Je ne recherche plus d'emploi
                  </div>
                  <p className="text-xs text-slate-400 text-center">Votre candidature sera archivée</p>
                </div>
              </div>
              <p className="text-center text-xs text-slate-300 mt-4">Envoyé via rekruit.net</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
