import { useEffect, useRef, useState } from 'react'
import { Loader2, Wand2, Pencil, Check } from 'lucide-react'
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
  const subjectRef = useRef<HTMLInputElement>(null)
  const [editing, setEditing] = useState(false)

  // Auto-resize textarea to fit content
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }, [message])

  const startEditing = () => {
    setEditing(true)
    setTimeout(() => textareaRef.current?.focus(), 0)
  }

  return (
    <div className="space-y-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {editing ? (
            <Button size="sm" variant="primary" onClick={() => setEditing(false)}>
              <Check size={14} />
              Terminer
            </Button>
          ) : (
            <Button size="sm" variant="secondary" onClick={startEditing}>
              <Pencil size={14} />
              Modifier
            </Button>
          )}
        </div>
        {onGenerate && (
          <Button size="sm" variant="secondary" onClick={onGenerate} disabled={generating}>
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Wand2 size={14} />}
            {generating ? 'Génération...' : 'Régénérer'}
          </Button>
        )}
      </div>

      {/* Full email preview */}
      <div className={`rounded-2xl border overflow-hidden bg-slate-50 transition-colors ${editing ? 'border-blue-300' : 'border-slate-200'}`}>

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
              ref={subjectRef}
              value={subject}
              onChange={e => onSubjectChange(e.target.value)}
              readOnly={!editing}
              className={`text-xs font-semibold text-slate-700 bg-transparent border-none outline-none flex-1 min-w-0 px-1 py-0.5 transition-colors rounded ${
                editing ? 'bg-white focus:bg-white' : 'cursor-default select-none'
              }`}
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

                {/* Message text — render [CRÉNEAUX] placeholder inline as styled links */}
                <div className="relative">
                  {editing ? (
                    <textarea
                      ref={textareaRef}
                      value={message}
                      onChange={e => onMessageChange(e.target.value)}
                      placeholder="Votre message au candidat…"
                      className="w-full text-sm text-slate-700 leading-relaxed resize-none border border-blue-300 rounded-xl outline-none bg-blue-50/30 px-3 py-2 -mx-3
                        focus:border-blue-400 focus:bg-blue-50/40
                        placeholder:text-slate-300 transition-all overflow-hidden"
                      rows={1}
                      style={{ minHeight: '80px' }}
                    />
                  ) : slots && slots.length > 0 && message.includes('[CRÉNEAUX]') ? (
                    <div className="text-sm text-slate-700 leading-relaxed px-3 py-2 -mx-3 min-h-[80px]">
                      {message.split('[CRÉNEAUX]').map((part, i) => (
                        <span key={i}>
                          <span className="whitespace-pre-wrap">{part}</span>
                          {i === 0 && (
                            <span className="block my-5">
                              <span className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-3">Choisissez votre créneau :</span>
                              {slots.map((s, j) => (
                                <span key={j} className="block bg-blue-600 text-white font-semibold text-sm text-center py-3.5 px-5 rounded-xl mb-2">📅 {s.label}</span>
                              ))}
                              <span className="block text-xs text-slate-400 text-center my-3">Ou signalez votre situation :</span>
                              <span className="block bg-white text-amber-700 font-semibold text-sm text-center py-3.5 px-5 rounded-xl mb-2 border-2 border-amber-400">📅 Je ne suis pas disponible à ces dates</span>
                              <span className="block bg-slate-50 text-slate-500 font-medium text-sm text-center py-3.5 px-5 rounded-xl border border-slate-200">🔕 Je ne recherche plus d'emploi</span>
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm text-slate-700 leading-relaxed px-3 py-2 -mx-3 min-h-[80px] whitespace-pre-wrap">
                      {message || <span className="text-slate-300">Cliquez sur "Modifier" ou "Régénérer" pour créer un message</span>}
                    </div>
                  )}
                </div>

              </div>
            </div>

            <p className="text-center text-xs text-slate-400 mt-4">Envoyé via rekruit.net</p>
          </div>
        </div>
      </div>
    </div>
  )
}
