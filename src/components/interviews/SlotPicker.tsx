import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'

export interface Slot {
  label: string
  datetime: string
}

interface SlotPickerProps {
  slots: Slot[]
  onChange: (slots: Slot[]) => void
  maxSlots?: number
}

function formatLabel(dt: string) {
  if (!dt) return ''
  const d = new Date(dt)
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }) +
    ' à ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function isFuture(dt: string) {
  return new Date(dt) > new Date()
}

export function SlotPicker({ slots, onChange, maxSlots = 3 }: SlotPickerProps) {
  const [adding, setAdding] = useState(false)
  const [newDt, setNewDt] = useState('')

  const minDatetime = () => {
    const d = new Date()
    d.setMinutes(d.getMinutes() + 30)
    return d.toISOString().slice(0, 16)
  }

  const addSlot = () => {
    if (!newDt || !isFuture(newDt)) return
    const slot: Slot = { datetime: newDt, label: formatLabel(newDt) }
    onChange([...slots, slot])
    setNewDt('')
    setAdding(false)
  }

  const removeSlot = (i: number) => {
    onChange(slots.filter((_, idx) => idx !== i))
  }

  return (
    <div className="space-y-3">
      {slots.map((s, i) => (
        <div key={i} className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
          <div className="flex-1">
            <p className="text-sm font-medium text-blue-900 capitalize">{s.label}</p>
          </div>
          <button onClick={() => removeSlot(i)} className="text-blue-400 hover:text-red-500">
            <Trash2 size={15} />
          </button>
        </div>
      ))}

      {adding ? (
        <div className="flex gap-2">
          <input
            type="datetime-local"
            min={minDatetime()}
            value={newDt}
            onChange={e => setNewDt(e.target.value)}
            className="flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
          <button
            onClick={addSlot}
            disabled={!newDt || !isFuture(newDt)}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium disabled:opacity-40"
          >
            Ajouter
          </button>
          <button
            onClick={() => setAdding(false)}
            className="px-4 py-2.5 border border-slate-200 rounded-xl text-sm"
          >
            Annuler
          </button>
        </div>
      ) : slots.length < maxSlots ? (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          <Plus size={16} /> Ajouter un créneau
        </button>
      ) : null}

      {slots.length === 0 && !adding && (
        <p className="text-xs text-slate-400">Ajoutez jusqu'à {maxSlots} créneaux différents</p>
      )}
    </div>
  )
}
