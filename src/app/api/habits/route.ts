import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthCookie, verifyToken } from '@/lib/auth'
import type { Habit, HabitLog } from '@/generated/prisma'

// GET /api/habits - Get all habits for the current user
export async function GET() {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const habits = await prisma.habit.findMany({
      where: {
        userId: decoded.id
      },
      include: {
        habitLogs: {
          where: {
            date: {
              gte: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }
      }
    })

    // Transform the habits to include completion status
    const transformedHabits = habits.map((habit: Habit & { habitLogs: HabitLog[] }) => ({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      streak: habit.streak,
      completedToday: habit.habitLogs.length > 0
    }))

    return NextResponse.json(transformedHabits)
  } catch (error) {
    console.error('Error fetching habits:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/habits - Create a new habit
export async function POST(request: Request) {
  try {
    const token = await getAuthCookie()
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, frequency } = body

    if (!name) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 })
    }

    const habit = await prisma.habit.create({
      data: {
        name,
        description,
        frequency,
        userId: decoded.id,
        streak: 0
      }
    })

    return NextResponse.json({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      streak: habit.streak,
      completedToday: false
    })
  } catch (error) {
    console.error('Error creating habit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 