"use client"

import { useEffect, useState } from "react"
import { Card } from '@/components/ui/card'
import { CheckCircle, NotebookPen, ChevronLeft, ChevronRight } from "lucide-react"
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

  const dateRange = getDateRange(rangeStart, daysToShow)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-green-50 pb-10 px-2">
      <Headbar />
      <div className="w-full max-w-4xl flex flex-col gap-10 mt-8">
        <h1 className="text-3xl font-bold text-center text-green-700 mb-4">My Daily Journal</h1>
        <Card className="p-8 shadow-playful bg-gradient-to-br from-green-50 to-blue-50 animate-fade-in">
          <div className="flex justify-between items-center mb-6">
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
            <div className="text-xl font-semibold text-blue-700">
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
          <div className="grid grid-cols-7 gap-6">
            {weekDays.map((wd, i) => (
              <div key={wd} className="text-center text-gray-500 font-semibold text-lg mb-2">{wd}</div>
            ))}
            {dateRange.map((date, i) => {
              const key = date.toISOString().slice(0, 10)
              const day = monthData[key]
              return (
                <div
                  key={key}
                  className={clsx(
                    "flex flex-col items-center justify-between rounded-3xl p-6 min-h-[200px] bg-white shadow-lg border border-green-100 relative transition-all",
                    date.toDateString() === new Date().toDateString() ? "ring-2 ring-green-400" : ""
                  )}
                >
                  <div className="text-3xl font-bold text-blue-600 mb-3">{date.getDate()}</div>
                  <div className="flex flex-col gap-2 w-full items-center mb-4">
                    {day ? (
                      day.habits.map(habit => (
                        <span
                          key={habit.id}
                          className={clsx(
                            "text-base px-4 py-2 rounded-full w-full text-center flex items-center justify-center gap-2",
                            habit.completed ? "line-through bg-green-100 text-green-700" : "bg-gray-100 text-gray-400"
                          )}
                        >
                          {habit.habitName}
                          {habit.completed && <CheckCircle className="inline h-5 w-5 text-green-400" />}
                        </span>
                      ))
                    ) : (
                      <span className="text-gray-300 text-sm">No habits</span>
                    )}
                  </div>
                  <button
                    className="mt-auto px-4 py-2 rounded-full bg-gradient-to-r from-blue-400 to-green-400 text-white font-semibold shadow hover:scale-105 transition-transform flex items-center gap-2"
                    onClick={() => setJournalModal({ open: true, logs: day ? day.habits : [], date: key })}
                    disabled={!day || !day.habits.length}
                  >
                    <NotebookPen className="h-5 w-5" />
                    View Details
                  </button>
                </div>
              )
            })}
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