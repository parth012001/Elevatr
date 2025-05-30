import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthCookie, verifyToken } from '@/lib/auth'

function formatDate(date: Date) {
  return date.toISOString().slice(0, 10)
}

export async function GET() {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    const userId = decoded.id

    // 1. Completions over time (last 30 days)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const startDate = new Date(today)
    startDate.setDate(today.getDate() - 29)

    // Get all logs for the user in the last 30 days
    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId },
        date: { gte: startDate, lte: today }
      },
      select: { date: true, habitId: true }
    })

    // Count completions per day
    const dateMap: Record<string, number> = {}
    for (let i = 0; i < 30; i++) {
      const d = new Date(startDate)
      d.setDate(startDate.getDate() + i)
      dateMap[formatDate(d)] = 0
    }
    logs.forEach(log => {
      const d = formatDate(log.date)
      if (dateMap[d] !== undefined) dateMap[d]++
    })
    const completionData = Object.entries(dateMap).map(([date, count]) => ({ date, count }))

    // 2. Completion by habit (last 30 days)
    const habits = await prisma.habit.findMany({
      where: { userId },
      select: { id: true, name: true }
    })
    const pieData = habits.map(habit => ({
      name: habit.name,
      value: logs.filter(log => log.habitId === habit.id).length
    }))

    // 3. Streaks (current and best) for each habit
    const streaks = await Promise.all(habits.map(async habit => {
      // Get all logs for this habit, sorted by date desc
      const habitLogs = await prisma.habitLog.findMany({
        where: { habitId: habit.id },
        orderBy: { date: 'desc' }
      })
      // Current streak
      let current = 0
      let prev = new Date(today)
      for (const log of habitLogs) {
        const logDate = new Date(log.date)
        if (
          logDate.getFullYear() === prev.getFullYear() &&
          logDate.getMonth() === prev.getMonth() &&
          logDate.getDate() === prev.getDate()
        ) {
          current++
          prev.setDate(prev.getDate() - 1)
        } else if (logDate < prev) {
          break
        }
      }
      // Best streak
      let best = 0, streak = 0, lastDate: Date | null = null
      for (const log of habitLogs) {
        if (!lastDate) {
          streak = 1
        } else {
          const diff = Math.round((lastDate.getTime() - log.date.getTime()) / (1000 * 60 * 60 * 24))
          if (diff === 1) {
            streak++
          } else {
            streak = 1
          }
        }
        if (streak > best) best = streak
        lastDate = log.date
      }
      return { habit: habit.name, current, best }
    }))

    return NextResponse.json({ completionData, pieData, streaks })
  } catch (error) {
    console.error('Error fetching stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 