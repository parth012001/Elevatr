"use client"

import { useEffect, useState, useRef } from "react"
import { Card } from '@/components/ui/card'
import { CheckCircle, NotebookPen, ChevronLeft, ChevronRight, PlusCircle, CalendarDays } from "lucide-react"
import clsx from "clsx"
import { Headbar } from '@/components/ui/Headbar'

interface HabitLog {
  id: string
  habitName: string
  completed: boolean
  reflection?: string
}

interface DayData {
  date: string // YYYY-MM-DD
  habits: HabitLog[]
}

// Simple Modal implementation
function Modal({ open, onClose, children }: { open: boolean; onClose: () => void; children: React.ReactNode }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white rounded-xl shadow-xl p-6 max-w-lg w-full relative animate-fade-in">
        <button
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 text-xl font-bold"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        {children}
      </div>
    </div>
  );
}

function getDateRange(start: Date, days: number) {
  const arr = []
  for (let i = 0; i < days; i++) {
    const d = new Date(start)
    d.setDate(start.getDate() + i)
    arr.push(new Date(d))
  }
  return arr
}

export default function JournalPage() {
  const [journalModal, setJournalModal] = useState<{ open: boolean; logs: HabitLog[]; date: string }>({ open: false, logs: [], date: "" })
  const [monthData, setMonthData] = useState<Record<string, DayData>>({})
  const [loading, setLoading] = useState(true)
  const [rangeStart, setRangeStart] = useState(() => {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    d.setDate(d.getDate() - d.getDay()) // Start from Sunday
    return d
  })
  const daysToShow = 7
  const [completedModal, setCompletedModal] = useState<{ open: boolean; habits: string[]; date: string }>({ open: false, habits: [], date: "" })

  // Calculate week progress (number of days with at least one completed habit)
  const weekDates = getDateRange(rangeStart, daysToShow)
  const weekProgress = weekDates.filter(date => {
    const key = date.toISOString().slice(0, 10)
    const day = monthData[key]
    return day && day.habits.some(h => h.completed)
  }).length

  useEffect(() => {
    // Fetch all habit logs and reflections for the current month
    const fetchData = async () => {
      setLoading(true)
      const now = new Date()
      const year = now.getFullYear()
      const month = now.getMonth() + 1
      const res = await fetch(`/api/journal?year=${year}&month=${month}`)
      const data = await res.json()
      if (res.ok) {
        setMonthData(data)
      }
      setLoading(false)
    }
    fetchData()
  }, [])

  const dateRange = weekDates
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-green-50 pb-10 px-2">
      <Headbar />
      <div className="w-full max-w-5xl flex flex-col gap-10 mt-12">
        <h1 className="text-4xl font-extrabold text-center text-green-700 mb-6 tracking-tight">My Daily Journal</h1>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4 px-2">
          <div className="flex items-center gap-2 text-lg font-semibold text-blue-700">
            <CalendarDays className="h-6 w-6 text-green-400" />
            {dateRange[0].toLocaleString(undefined, { month: 'long', year: 'numeric' })}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">Weekly Progress:</span>
            <div className="flex items-center gap-1">
              {[...Array(daysToShow)].map((_, i) => {
                const date = dateRange[i]
                const key = date.toISOString().slice(0, 10)
                const day = monthData[key]
                const completed = day && day.habits.some(h => h.completed)
                return (
                  <span key={i} className={clsx("inline-block w-3 h-3 rounded-full", completed ? "bg-green-400" : "bg-gray-200 border border-gray-300")}></span>
                )
              })}
            </div>
            <span className="ml-2 text-green-700 font-bold">{weekProgress}/{daysToShow}</span>
          </div>
        </div>
        <Card className="p-8 shadow-playful bg-gradient-to-br from-green-50 to-blue-50 animate-fade-in">
          <div className="flex justify-between items-center mb-8">
            <button
              className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
              onClick={() => {
                const prev = new Date(rangeStart)
                prev.setDate(rangeStart.getDate() - daysToShow)
                setRangeStart(prev)
              }}
              aria-label="Previous week"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="text-2xl font-bold text-blue-700 tracking-tight">
              {dateRange[0].toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
              {" - "}
              {dateRange[daysToShow - 1].toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <button
              className="p-2 rounded-full bg-green-100 hover:bg-green-200 text-green-700"
              onClick={() => {
                const next = new Date(rangeStart)
                next.setDate(rangeStart.getDate() + daysToShow)
                setRangeStart(next)
              }}
              aria-label="Next week"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </div>
          <div className="overflow-x-auto">
            <div className="grid grid-cols-7 gap-8 min-w-[900px]">
              {weekDays.map((wd, i) => (
                <div key={wd} className="text-center text-gray-500 font-semibold text-lg mb-2">{wd}</div>
              ))}
              {dateRange.map((date, i) => {
                const key = date.toISOString().slice(0, 10)
                const day = monthData[key]
                const isToday = date.toDateString() === new Date().toDateString()
                const hasData = day && day.habits.length > 0
                return (
                  <div
                    key={key}
                    className={clsx(
                      "flex flex-col items-center justify-between rounded-3xl p-7 min-h-[230px] bg-white shadow-lg border border-green-100 relative transition-all group",
                      isToday ? "bg-green-50 ring-2 ring-green-400" : "",
                      hasData ? "hover:shadow-2xl hover:-translate-y-1 transition-all duration-200" : ""
                    )}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx("text-4xl font-extrabold tracking-tight", isToday ? "text-green-700" : "text-blue-600")}>{date.getDate()}</span>
                      {isToday && <span className="ml-1 px-2 py-0.5 rounded-full bg-green-200 text-green-800 text-xs font-bold animate-fade-in">Today</span>}
                    </div>
                    <div className="flex flex-col gap-2 w-full items-center mb-4">
                      {/* No content for days with no data */}
                    </div>
                    {hasData ? (
                      <>
                        <button
                          className="mt-auto mb-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400 text-white font-semibold shadow hover:scale-105 transition-transform flex items-center gap-2"
                          onClick={() => setJournalModal({ open: true, logs: day ? day.habits : [], date: key })}
                        >
                          <NotebookPen className="h-5 w-5" />
                          View Details
                        </button>
                        <button
                          className="px-4 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold shadow hover:scale-105 transition-transform flex items-center gap-2"
                          onClick={() => setCompletedModal({ open: true, habits: day.habits.filter(h => h.completed).map(h => h.habitName), date: key })}
                          disabled={day.habits.filter(h => h.completed).length === 0}
                        >
                          <CheckCircle className="h-5 w-5" />
                          Completed Habits
                        </button>
                      </>
                    ) : null}
                  </div>
                )
              })}
            </div>
          </div>
        </Card>
      </div>
      <Modal open={journalModal.open} onClose={() => setJournalModal(j => ({ ...j, open: false }))}>
        <h2 className="text-2xl font-bold mb-4 text-green-700 text-center">Details for {journalModal.date}</h2>
        {journalModal.logs.length === 0 ? (
          <div className="text-gray-400 text-center mb-4">No habits completed on this day.</div>
        ) : (
          journalModal.logs.map((log, i) => (
            <div key={log.id} className="mb-6 p-4 rounded-xl bg-blue-50 shadow-inner">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="h-5 w-5 text-green-400" />
                <span className="font-semibold text-blue-700 text-lg">{log.habitName}</span>
              </div>
              {log.reflection ? (
                <div className="text-gray-700 whitespace-pre-line bg-white rounded p-3 border border-blue-100">
                  <span className="font-semibold text-green-600">Journal:</span> {log.reflection}
                </div>
              ) : (
                <div className="text-gray-400 italic">No journal entry for this habit.</div>
              )}
            </div>
          ))
        )}
        <button
          className="mt-2 px-6 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold hover:scale-105 transition-transform"
          onClick={() => setJournalModal(j => ({ ...j, open: false }))}
        >
          Close
        </button>
      </Modal>
      {/* Completed Habits Modal */}
      <Modal open={completedModal.open} onClose={() => setCompletedModal({ open: false, habits: [], date: "" })}>
        <h2 className="text-2xl font-bold mb-4 text-green-700 text-center">Completed Habits for {completedModal.date}</h2>
        {completedModal.habits.length === 0 ? (
          <div className="text-gray-400 text-center mb-4">No habits completed on this day.</div>
        ) : (
          <div className="max-h-[400px] overflow-y-auto pr-2">
            <ul className="flex flex-col gap-3">
              {completedModal.habits.map((habit, i) => (
                <li key={habit} className="flex items-center gap-3 bg-green-50 rounded-lg px-4 py-3 shadow">
                  <CheckCircle className="h-5 w-5 text-green-400" />
                  <span className="font-semibold text-blue-700 text-lg">{habit}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <button
          className="mt-4 px-6 py-2 rounded-full bg-gradient-to-r from-green-400 to-blue-400 text-white font-semibold hover:scale-105 transition-transform"
          onClick={() => setCompletedModal({ open: false, habits: [], date: "" })}
        >
          Close
        </button>
      </Modal>
      <style jsx global>{`
        .animate-fade-in {
          animation: fadeIn 1.2s cubic-bezier(0.4,0,0.2,1);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
} 