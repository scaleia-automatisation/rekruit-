import { useEffect, useRef } from 'react'
import { Loader2, Wand2, PenLine } from 'lucide-react'
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
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [message])

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <PenLine size={12} />
          <span>Cliquez sur le texte pour le modifier</span>
        </div>
        {onGenerate && (
          <Button size="sm" variant="secondary" onClick={onGenerate} disabled={generating}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {generating ? 'Génération...' : 'Régénérer'}
          </Button>
        )}
      </div>

      {/* Full email preview — editable inline */}
      <div className="rounded-2xl border border-slate-200 overflow-hidden bg-slate-50">

        {/* Mock email client chrome */}
        <div className="bg-slate-100 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5 flex-shrink-0">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-amber-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <div className="flex items-center gap-1.5 flex-1 min-w-0">
            <span className="text-xs text-slate-500 flex-shrink-0">Objet :</span>
            <input
              value={subject}
              onChange={e => onSubjectChange(e.target.value)}
              className="text-xs font-semibold text-slate-700 bg-transparent border-none outline-none flex-1 min-w-0 hover:bg-white focus:bg-white focus:rounded px-1 py-0.5 transition-colors"
              placeholder="Sujet de l'email…"
            />
          </div>
        </div>

        {/* Email body */}
        <div className="bg-slate-50 px-6 py-6">
          <div className="max-w-lg mx-auto">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-7 pt-7 pb-5">

                {/* rekruit logo */}
                <div className="flex items-center gap-2.5 mb-6">
                  <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-bold text-sm">R</span>
                  </div>
                  <span className="font-bold text-slate-900">rekruit</span>
                </div>

                {/* Editable message text — looks like email body */}
                <div className="relative group">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    onChange={e => onMessageChange(e.target.value)}
                    placeholder="Votre message au candidat…"
                    className="w-full text-sm text-slate-700 leading-relaxed resize-none border border-transparent rounded-xl outline-none bg-transparent px-3 py-2 -mx-3
                      hover:border-blue-200 hover:bg-blue-50/30
                      focus:border-blue-400 focus:bg-blue-50/40
                      placeholder:text-slate-300 transition-all overflow-hidden"
                    rows={1}
                    style={{ minHeight: '80px' }}
                  />
                  {!message && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <span className="text-sm text-slate-300">Cliquez sur "Régénérer" pour créer un message</span>
                    </div>
                  )}
                </div>

              </div>

              {/* Slot buttons + refusal — non-editable, matches exact email output */}
              {slots && slots.length > 0 && (
                <div className="px-7 pb-7 border-t border-slate-100 pt-5">
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

            <p className="text-center text-xs text-slate-400 mt-4">Envoyé via rekruit.net</p>
          </div>
        </div>
      </div>
    </div>
  )
}
