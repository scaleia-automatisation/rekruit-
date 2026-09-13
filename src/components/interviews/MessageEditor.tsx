import { useEffect, useState } from 'react'
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

function renderMessageHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Markdown links [text](url) → clickable
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" style="color:#2563eb;text-decoration:underline" target="_blank">$1</a>')
    // Plain URLs
    .replace(/(^|[^"(])(https?:\/\/[^\s<]+)/g, '$1<a href="$2" style="color:#2563eb;text-decoration:underline" target="_blank">$2</a>')
    // Replace [TOKEN] with a readable placeholder
    .replace(/\[TOKEN\]/g, '<span style="background:#dbeafe;color:#1d4ed8;padding:1px 6px;border-radius:4px;font-size:12px">lien-unique</span>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Newlines
    .replace(/\n/g, '<br>')
}

export function MessageEditor({
  subject, message, onSubjectChange, onMessageChange, onGenerate, generating, slots
}: MessageEditorProps) {
  const [tab, setTab] = useState<'edit' | 'preview'>('edit')

  // Auto-switch to preview when a new message is generated
  useEffect(() => {
    if (message) setTab('preview')
  }, [message])

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
        /* ── Full email preview ── */
        <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">
          {/* Email client header bar */}
          <div className="bg-slate-100 border-b border-slate-200 px-4 py-2 flex items-center gap-2">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400" />
              <div className="w-3 h-3 rounded-full bg-amber-400" />
              <div className="w-3 h-3 rounded-full bg-green-400" />
            </div>
            <span className="text-xs text-slate-500 ml-2">Objet : <strong className="text-slate-700">{subject}</strong></span>
          </div>

          {/* Email body — matches exactly what Resend sends */}
          <div className="bg-slate-50 p-6">
            <div className="max-w-lg mx-auto">
              <div className="bg-white rounded-2xl border border-slate-200 p-7 shadow-sm">
                {/* rekruit logo */}
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <span className="font-bold text-slate-900">rekruit</span>
                </div>

                {/* Message text */}
                <div
                  className="text-sm text-slate-700 leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: renderMessageHtml(message) }}
                />

                {/* Slot buttons + refusal */}
                {slots && slots.length > 0 && (
                  <div className="mt-6 pt-5 border-t border-slate-200">
                    <p className="text-xs font-bold text-slate-900 mb-3 uppercase tracking-wide">Choisissez votre créneau :</p>
                    <div className="space-y-2.5 mb-5">
                      {slots.map((s, i) => (
                        <div
                          key={i}
                          className="bg-blue-600 text-white text-sm font-semibold px-5 py-3.5 rounded-xl text-center select-none"
                        >
                          📅 {s.label}
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-dashed border-slate-200 pt-4">
                      <p className="text-xs text-slate-400 mb-3 text-center">Ou signalez votre situation :</p>
                      <div className="border-2 border-amber-400 text-amber-900 bg-amber-50 px-5 py-3 rounded-xl text-sm font-semibold text-center mb-1 select-none">
                        🗓 Je ne suis pas disponible à ces dates
                      </div>
                      <p className="text-xs text-slate-400 text-center mb-4">Le recruteur sera informé et pourra vous proposer d'autres créneaux</p>

                      <div className="border-2 border-slate-200 text-slate-600 bg-white px-5 py-3 rounded-xl text-sm font-semibold text-center mb-1 select-none">
                        🔕 Je ne recherche plus d'emploi
                      </div>
                      <p className="text-xs text-slate-400 text-center">Votre candidature sera archivée</p>
                    </div>
                  </div>
                )}
              </div>

              <p className="text-center text-xs text-slate-400 mt-4">
                Envoyé via rekruit.net
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
