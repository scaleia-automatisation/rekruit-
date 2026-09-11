import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Search, LayoutDashboard, Briefcase, Users, CalendarDays,
  BarChart3, Settings, Plus, CreditCard, X, ArrowRight,
} from 'lucide-react'

interface Command {
  id: string
  label: string
  description?: string
  icon: React.ReactNode
  action: () => void
  shortcut?: string
}

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
}

export function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const go = (path: string) => { navigate(path); onClose() }

  const commands: Command[] = [
    { id: 'dashboard',    label: 'Dashboard',           icon: <LayoutDashboard size={15} />, action: () => go('/dashboard') },
    { id: 'offres',       label: 'Offres d\'emploi',    icon: <Briefcase size={15} />,       action: () => go('/offres') },
    { id: 'new-offre',    label: 'Créer une offre',     icon: <Plus size={15} />,            action: () => go('/offres/nouvelle'),   description: 'Nouvelle offre d\'emploi' },
    { id: 'candidats',    label: 'Candidats',           icon: <Users size={15} />,           action: () => go('/candidats') },
    { id: 'new-cand',     label: 'Ajouter un candidat', icon: <Plus size={15} />,            action: () => go('/candidats/nouveau'), description: 'Nouveau candidat' },
    { id: 'calendrier',   label: 'Calendrier',          icon: <CalendarDays size={15} />,    action: () => go('/calendrier') },
    { id: 'analytics',    label: 'Analytics',           icon: <BarChart3 size={15} />,       action: () => go('/analytics') },
    { id: 'parametres',   label: 'Paramètres',          icon: <Settings size={15} />,        action: () => go('/parametres') },
    { id: 'billing',      label: 'Facturation',         icon: <CreditCard size={15} />,      action: () => go('/billing') },
  ]

  const filtered = query.trim()
    ? commands.filter(c =>
        c.label.toLowerCase().includes(query.toLowerCase()) ||
        c.description?.toLowerCase().includes(query.toLowerCase())
      )
    : commands

  useEffect(() => {
    setSelected(0)
  }, [query, open])

  useEffect(() => {
    if (open) {
      setQuery('')
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!open) return
      if (e.key === 'Escape') { onClose(); return }
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)) }
      if (e.key === 'Enter' && filtered[selected]) { filtered[selected].action() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, filtered, selected, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[16vh] px-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="animate-fade-scale relative w-full max-w-[560px] bg-[var(--surface)] rounded-[var(--radius-xl)] shadow-[var(--shadow-xl)] border border-[var(--border)] overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
          <Search size={16} className="text-[var(--text-muted)] shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Rechercher ou naviguer..."
            className="flex-1 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] bg-transparent outline-none"
          />
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors p-1 rounded-md hover:bg-[var(--bg)]">
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[380px] overflow-y-auto py-1.5">
          {filtered.length === 0 ? (
            <div className="py-10 text-center text-sm text-[var(--text-muted)]">
              Aucun résultat pour « {query} »
            </div>
          ) : (
            <>
              {!query && (
                <p className="px-4 pt-2 pb-1 text-[11px] font-semibold text-[var(--text-muted)] uppercase tracking-wider">
                  Navigation rapide
                </p>
              )}
              {filtered.map((cmd, i) => (
                <button
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors ${
                    selected === i
                      ? 'bg-[var(--cyan-05)] text-[var(--text-primary)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg)]'
                  }`}
                >
                  <div className={`w-7 h-7 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0 transition-colors ${
                    selected === i ? 'bg-[var(--cyan-10)] text-[var(--cyan-700)]' : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'
                  }`}>
                    {cmd.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-[var(--text-primary)]">{cmd.label}</span>
                    {cmd.description && (
                      <span className="ml-2 text-xs text-[var(--text-muted)]">{cmd.description}</span>
                    )}
                  </div>
                  {selected === i && <ArrowRight size={13} className="text-[var(--text-muted)] shrink-0" />}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-4 px-4 py-2.5 border-t border-[var(--border)] bg-[var(--bg)] text-[11px] text-[var(--text-muted)]">
          <span className="flex items-center gap-1"><kbd className="bg-[var(--surface)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono">↑↓</kbd> naviguer</span>
          <span className="flex items-center gap-1"><kbd className="bg-[var(--surface)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono">↵</kbd> ouvrir</span>
          <span className="flex items-center gap-1"><kbd className="bg-[var(--surface)] border border-[var(--border)] rounded px-1.5 py-0.5 font-mono">Esc</kbd> fermer</span>
        </div>
      </div>
    </div>
  )
}
