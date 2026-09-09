import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, List, CalendarDays, CalendarRange } from 'lucide-react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Badge } from '../components/ui/Badge'

interface Event {
  id: string
  title: string
  date: Date
  candidate: string
  job: string
  status: string
  candidate_id: string
  interview_number: number
}

type ViewMode = 'month' | 'list'

const DAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre']

export function CalendarPage() {
  const { profile } = useAuth()
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('month')
  const [current, setCurrent] = useState(new Date())

  useEffect(() => {
    const load = async () => {
      if (!profile?.organization_id) return
      const { data } = await supabase
        .from('interviews')
        .select(`
          id, interview_number, status, scheduled_at,
          candidate:candidates(id, first_name, last_name),
          job_offer:job_offers(title),
          slots:interview_slots(slot_datetime, status)
        `)
        .eq('organization_id', profile.organization_id)
        .in('status', ['pending', 'scheduled', 'completed'])

      if (data) {
        const evts: Event[] = []
        for (const iv of data) {
          const cand = iv.candidate as unknown as { id: string; first_name: string; last_name: string }
          const job = iv.job_offer as unknown as { title: string }
          const slots = iv.slots as unknown as { slot_datetime: string; status: string }[]

          const confirmedSlot = slots?.find(s => s.status === 'confirmed')
          const firstSlot = slots?.[0]
          const slotDate = confirmedSlot?.slot_datetime || firstSlot?.slot_datetime || iv.scheduled_at

          if (slotDate) {
            evts.push({
              id: iv.id,
              title: `Entretien ${iv.interview_number}`,
              date: new Date(slotDate),
              candidate: `${cand?.first_name || ''} ${cand?.last_name || ''}`.trim(),
              job: job?.title || '',
              status: iv.status,
              candidate_id: cand?.id || '',
              interview_number: iv.interview_number,
            })
          }
        }
        setEvents(evts.sort((a, b) => a.date.getTime() - b.date.getTime()))
      }
      setLoading(false)
    }
    load()
  }, [profile?.organization_id])

  const statusVariant = (s: string): 'green' | 'orange' | 'blue' | 'gray' => {
    if (s === 'scheduled') return 'green'
    if (s === 'pending') return 'orange'
    if (s === 'completed') return 'blue'
    return 'gray'
  }
  const statusLabel = (s: string) => s === 'scheduled' ? 'Confirmé' : s === 'pending' ? 'En attente' : s === 'completed' ? 'Terminé' : s

  const firstDay = new Date(current.getFullYear(), current.getMonth(), 1)
  const lastDay = new Date(current.getFullYear(), current.getMonth() + 1, 0)
  const startOffset = (firstDay.getDay() + 6) % 7

  const cells: (Date | null)[] = []
  for (let i = 0; i < startOffset; i++) cells.push(null)
  for (let d = 1; d <= lastDay.getDate(); d++) cells.push(new Date(current.getFullYear(), current.getMonth(), d))

  const eventsOnDay = (d: Date | null) => {
    if (!d) return []
    return events.filter(e =>
      e.date.getFullYear() === d.getFullYear() &&
      e.date.getMonth() === d.getMonth() &&
      e.date.getDate() === d.getDate()
    )
  }

  const today = new Date()
  const isToday = (d: Date | null) => d && d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate()

  const upcoming = events.filter(e => e.date >= today)
  const past = events.filter(e => e.date < today)

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendrier</h1>
          <p className="text-slate-500 mt-1">{events.length} entretien{events.length !== 1 ? 's' : ''}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setView('month')} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${view === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <CalendarDays size={15} /> Mois
          </button>
          <button onClick={() => setView('list')} className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${view === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
            <List size={15} /> Liste
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-96 bg-white rounded-2xl border border-slate-200 animate-pulse" />
      ) : view === 'month' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
            <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() - 1, 1))} className="p-2 hover:bg-slate-100 rounded-lg">
              <ChevronLeft size={16} />
            </button>
            <h2 className="font-bold text-slate-900">{MONTHS[current.getMonth()]} {current.getFullYear()}</h2>
            <button onClick={() => setCurrent(d => new Date(d.getFullYear(), d.getMonth() + 1, 1))} className="p-2 hover:bg-slate-100 rounded-lg">
              <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid grid-cols-7">
            {DAYS.map(d => (
              <div key={d} className="px-2 py-2 text-center text-xs font-medium text-slate-400 border-b border-slate-100">{d}</div>
            ))}
            {cells.map((d, i) => {
              const dayEvents = eventsOnDay(d)
              return (
                <div key={i} className={`min-h-[80px] p-1.5 border-r border-b border-slate-100 last:border-r-0 ${!d ? 'bg-slate-50' : isToday(d) ? 'bg-blue-50' : ''}`}>
                  {d && (
                    <>
                      <p className={`text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full ${isToday(d) ? 'bg-blue-600 text-white' : 'text-slate-700'}`}>
                        {d.getDate()}
                      </p>
                      {dayEvents.slice(0, 2).map(e => (
                        <Link key={e.id} to={`/candidats/${e.candidate_id}`}>
                          <div className="text-xs bg-blue-100 text-blue-800 rounded px-1 py-0.5 mb-0.5 truncate hover:bg-blue-200">
                            {e.candidate}
                          </div>
                        </Link>
                      ))}
                      {dayEvents.length > 2 && <p className="text-xs text-slate-400">+{dayEvents.length - 2}</p>}
                    </>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-bold text-slate-900 mb-3">À venir</h2>
              <div className="space-y-2">
                {upcoming.map(e => (
                  <Link key={e.id} to={`/candidats/${e.candidate_id}`}>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 hover:border-blue-300 hover:shadow-sm transition-all flex items-center gap-4">
                      <div className="text-center min-w-[50px]">
                        <p className="text-xl font-bold text-slate-900">{e.date.getDate()}</p>
                        <p className="text-xs text-slate-400">{MONTHS[e.date.getMonth()].slice(0, 3)}</p>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-semibold text-slate-900">{e.candidate}</p>
                          <Badge variant={statusVariant(e.status)} size="sm">{statusLabel(e.status)}</Badge>
                        </div>
                        <p className="text-sm text-slate-500">{e.title} — {e.job}</p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {e.date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <h2 className="font-bold text-slate-500 mb-3 text-sm">Passés</h2>
              <div className="space-y-2 opacity-60">
                {past.slice(-5).reverse().map(e => (
                  <Link key={e.id} to={`/candidats/${e.candidate_id}`}>
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 flex items-center gap-4">
                      <div className="text-center min-w-[50px]">
                        <p className="text-xl font-bold text-slate-900">{e.date.getDate()}</p>
                        <p className="text-xs text-slate-400">{MONTHS[e.date.getMonth()].slice(0, 3)}</p>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-slate-900">{e.candidate}</p>
                        <p className="text-sm text-slate-500">{e.title} — {e.job}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {events.length === 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 p-16 text-center">
              <CalendarRange size={48} className="mx-auto text-slate-200 mb-4" />
              <h2 className="text-lg font-bold text-slate-900 mb-2">Aucun entretien planifié</h2>
              <p className="text-slate-500">Les entretiens apparaîtront ici une fois planifiés.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
