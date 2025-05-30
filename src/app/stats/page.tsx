"use client"

import { useEffect, useState } from "react"
import { Card } from '@/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import { Flower2, TrendingUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

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

  // Growth visual: SVG plant/tree that grows with best streak
  const bestStreak = Math.max(0, ...streaks.map(s => s.best))
  const growthLevel = bestStreak >= 30 ? 3 : bestStreak >= 14 ? 2 : bestStreak >= 7 ? 1 : 0

  return (
    <div className="min-h-screen flex flex-col items-center bg-gradient-to-br from-blue-50 to-green-50 pb-10 px-2">
      {/* Sticky Header */}
      <header className="sticky top-0 z-20 w-full bg-gradient-to-r from-green-100 via-blue-100 to-green-50 shadow-md py-6 mb-8 flex flex-col items-center">
        <div className="w-full max-w-3xl flex items-center mb-4">
          <Link href="/dashboard" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/80 hover:bg-blue-100 text-blue-700 font-semibold shadow transition-colors">
            <ArrowLeft className="h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Flower2 className="h-8 w-8 text-green-400" />
          <h1 className="text-3xl font-extrabold text-blue-700 tracking-tight">Your Habit Stats</h1>
        </div>
        <div className="text-blue-500 text-lg flex items-center gap-2 font-medium">
          <TrendingUp className="h-5 w-5 text-yellow-400" />
          <span>See your growth and celebrate your progress!</span>
        </div>
      </header>
      <div className="w-full max-w-3xl flex flex-col gap-10">
        {/* Growth Visual */}
        <div className="flex flex-col items-center mb-2 animate-fade-in">
          <div className="mb-2">
            {/* SVG Plant/Tree visual that grows with best streak */}
            {growthLevel === 0 && <span className="text-5xl">🌱</span>}
            {growthLevel === 1 && <span className="text-5xl">🌿</span>}
            {growthLevel === 2 && <span className="text-5xl">🌳</span>}
            {growthLevel === 3 && <span className="text-5xl">🌸</span>}
          </div>
          <div className="text-green-700 font-semibold text-lg">Best Streak: <span className="text-blue-700 font-bold">{bestStreak} days</span></div>
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
            <Card className="mb-8 p-8 card shadow-playful bg-gradient-to-br from-green-50 to-blue-50 animate-fade-in">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-400" />
                Completions Over Time
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={completionData} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                  <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#6FCF97" radius={[8, 8, 0, 0]} isAnimationActive={true} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            {/* Pie Chart Section */}
            <Card className="mb-8 p-8 card shadow-playful bg-gradient-to-br from-blue-50 to-green-50 animate-fade-in">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <Flower2 className="h-5 w-5 text-pink-400" />
                Completion by Habit
              </h2>
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label isAnimationActive={true}>
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
            <Card className="p-8 card shadow-playful bg-gradient-to-br from-green-50 to-blue-50 animate-fade-in">
              <h2 className="text-xl font-bold mb-4 text-gray-800 flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-yellow-400" />
                Streaks & Milestones
              </h2>
              <div className="flex flex-row gap-4 overflow-x-auto pb-2">
                {streaks.map((s, i) => (
                  <div key={i} className="flex flex-col items-center min-w-[180px] bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-5 shadow-playful mx-1">
                    <span className="text-3xl mb-2">{s.best >= 30 ? '🌸' : s.best >= 14 ? '🌳' : s.best >= 7 ? '🌿' : '🌱'}</span>
                    <span className="font-semibold text-gray-700 text-lg mb-1">{s.habit}</span>
                    <span className="text-green-600 font-bold">Current: {s.current}d</span>
                    <span className="text-blue-600">Best: {s.best}d</span>
                    <div className="flex flex-row gap-1 mt-2">
                      {s.best >= 7 && <span className="badge-yellow px-2 py-1 rounded text-xs">7 Day</span>}
                      {s.best >= 14 && <span className="badge-pink px-2 py-1 rounded text-xs">14 Day</span>}
                      {s.best >= 30 && <span className="badge-lavender px-2 py-1 rounded text-xs">30 Day</span>}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </>
        )}
      </div>
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