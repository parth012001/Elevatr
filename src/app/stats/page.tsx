"use client"

import { useEffect, useState } from "react"
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Flower2 } from 'lucide-react'

const COLORS = ["#6FCF97", "#56CCF2", "#F2C94C", "#F299C9", "#BB6BD9"]

interface CompletionDatum { date: string; count: number }
interface PieDatum { name: string; value: number }
interface StreakDatum { habit: string; current: number; best: number }

export default function StatsPage() {
  const [completionData, setCompletionData] = useState<CompletionDatum[]>([])
  const [pieData, setPieData] = useState<PieDatum[]>([])
  const [streaks, setStreaks] = useState<StreakDatum[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true)
      setError('')
      try {
        const res = await fetch('/api/stats')
        const data = await res.json()
        if (res.ok) {
          setCompletionData(data.completionData)
          setPieData(data.pieData)
          setStreaks(data.streaks)
        } else {
          setError(data.error || 'Failed to load stats.')
        }
      } catch (err) {
        setError('Failed to load stats.')
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [])

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-green-50 py-10 px-2">
      <div className="w-full max-w-2xl mb-8">
        <div className="flex items-center gap-3 mb-6">
          <Flower2 className="h-7 w-7 text-green-400" />
          <h1 className="text-2xl font-bold text-blue-700">Your Habit Stats</h1>
        </div>
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-green-400"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 py-10">{error}</div>
        ) : (
          <>
            {/* Line/Bar Chart Section */}
            <Card className="mb-8 p-6 card shadow-playful">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Completions Over Time</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={completionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6FCF97" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            {/* Pie Chart Section */}
            <Card className="mb-8 p-6 card shadow-playful">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Completion by Habit</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card>
            {/* Streaks & Milestones Section */}
            <Card className="p-6 card shadow-playful">
              <h2 className="text-lg font-semibold mb-4 text-gray-800">Streaks & Milestones</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {streaks.map((s, i) => (
                  <div key={i} className="flex flex-col items-center bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-4 shadow-playful">
                    <span className="text-2xl mb-2">🌱</span>
                    <span className="font-semibold text-gray-700">{s.habit}</span>
                    <span className="text-green-600 font-bold">Current Streak: {s.current}d</span>
                    <span className="text-blue-600">Best Streak: {s.best}d</span>
                    {s.best >= 7 && <span className="badge-yellow mt-2 px-2 py-1 rounded text-xs">7 Day Streak!</span>}
                    {s.best >= 30 && <span className="badge-pink mt-2 px-2 py-1 rounded text-xs">30 Day Streak!</span>}
                    {s.best >= 100 && <span className="badge-lavender mt-2 px-2 py-1 rounded text-xs">100 Day Streak!</span>}
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
    </div>
  )
} 