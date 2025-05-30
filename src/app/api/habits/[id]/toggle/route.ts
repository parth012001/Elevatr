import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const params = await context.params
    const habitId = params.id

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Find the habit and check if it's already completed today
    const habit = await prisma.habit.findFirst({
      where: {
        id: habitId,
        userId: decoded.id
      },
      include: {
        habitLogs: {
          where: {
            date: {
              gte: today
            }
          }
        }
      }
    })

    if (!habit) {
      return NextResponse.json({ error: 'Habit not found' }, { status: 404 })
    }

    // Helper to get yesterday's date
    const getYesterday = () => {
      const y = new Date(today)
      y.setDate(y.getDate() - 1)
      return y
    }

    let updatedStreak = habit.streak

    if (habit.habitLogs.length > 0) {
      // Toggle off: delete today's log
      try {
        await prisma.habitLog.delete({
          where: {
            id: habit.habitLogs[0].id
          }
        })
        // Recalculate streak: count consecutive days before today
        const logs = await prisma.habitLog.findMany({
          where: { habitId: habit.id, date: { lt: today } },
          orderBy: { date: 'desc' }
        })
        let streak = 0
        let prev = new Date(today)
        prev.setDate(prev.getDate() - 1)
        for (const log of logs) {
          const logDate = new Date(log.date)
          if (
            logDate.getFullYear() === prev.getFullYear() &&
            logDate.getMonth() === prev.getMonth() &&
            logDate.getDate() === prev.getDate()
          ) {
            streak++
            prev.setDate(prev.getDate() - 1)
          } else {
            break
          }
        }
        updatedStreak = streak
        await prisma.habit.update({ where: { id: habit.id }, data: { streak } })
        return NextResponse.json({ completed: false, streak })
      } catch (error) {
        return NextResponse.json({ completed: false, streak: habit.streak })
      }
    } else {
      // Toggle on: create today's log
      await prisma.habitLog.create({
        data: {
          habitId: habit.id,
          date: today
        }
      })
      // Check if yesterday was completed
      const yesterday = getYesterday()
      const yesterdayLog = await prisma.habitLog.findFirst({
        where: {
          habitId: habit.id,
          date: {
            gte: yesterday,
            lt: today
          }
        }
      })
      let streak = 1
      if (yesterdayLog) {
        streak = habit.streak + 1
      }
      updatedStreak = streak
      await prisma.habit.update({ where: { id: habit.id }, data: { streak } })
      return NextResponse.json({ completed: true, streak })
    }
  } catch (error) {
    console.error('Error toggling habit:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
} 