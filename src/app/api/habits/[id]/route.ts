import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function PATCH(request: Request, context: { params: { id: string } }) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { id } = await context.params
    const body = await request.json()
    const { name, description, frequency } = body

    const habit = await prisma.habit.update({
      where: { id, userId: decoded.id },
      data: { name, description, frequency }
    })

    return NextResponse.json({
      id: habit.id,
      name: habit.name,
      description: habit.description,
      frequency: habit.frequency,
      streak: habit.streak
    })
  } catch (error) {
    console.error('Error updating habit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: Request, context: { params: { id: string } }) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const { id } = await context.params
    // Delete all logs for this habit first (if using referential integrity)
    await prisma.habitLog.deleteMany({ where: { habitId: id } })
    await prisma.habit.delete({ where: { id, userId: decoded.id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting habit:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 