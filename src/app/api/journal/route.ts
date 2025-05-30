import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function GET(request: Request) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({}, { status: 401 })
    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({}, { status: 401 })

    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || '')
    const month = parseInt(searchParams.get('month') || '')
    if (!year || !month) return NextResponse.json({}, { status: 400 })

    // Get first and last day of the month
    const start = new Date(year, month - 1, 1)
    const end = new Date(year, month, 0, 23, 59, 59, 999)

    // Get all habit logs for the user in this month
    const logs = await prisma.habitLog.findMany({
      where: {
        habit: { userId: decoded.id },
        date: { gte: start, lte: end }
      },
      include: {
        habit: true
      },
      orderBy: { date: 'asc' }
    })

    // Group by date
    const result: Record<string, { date: string, habits: { id: string, habitName: string, completed: boolean, reflection?: string }[] }> = {}
    for (const log of logs) {
      const dateKey = log.date.toISOString().slice(0, 10)
      if (!result[dateKey]) result[dateKey] = { date: dateKey, habits: [] }
      result[dateKey].habits.push({
        id: log.habitId,
        habitName: log.habit.name,
        completed: true,
        reflection: log.reflection || ''
      })
    }
    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching journal data:', error)
    return NextResponse.json({}, { status: 500 })
  }
} 