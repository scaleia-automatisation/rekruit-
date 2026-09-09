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
}

export function MessageEditor({
  subject, message, onSubjectChange, onMessageChange, onGenerate, generating
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
            Aperçu
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
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-5">
          <p className="text-xs text-slate-500 mb-2">Objet: <strong className="text-slate-900">{subject}</strong></p>
          <hr className="border-slate-200 mb-4" />
          <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">{message}</pre>
        </div>
      )}
    </div>
  )
}
