import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getAuthCookie, verifyToken } from '@/lib/auth'

export async function POST(request: Request, context: { params: { id: string } }) {
  try {
    const token = await getAuthCookie()
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const decoded = await verifyToken(token)
    if (!decoded) return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    const { id: habitId } = await context.params
    const { reflection } = await request.json()

    // Find today's log for this habit and user
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const log = await prisma.habitLog.findFirst({
      where: {
        habitId,
        date: { gte: today },
        habit: { userId: decoded.id }
      }
    })
    if (!log) return NextResponse.json({ error: 'No log found for today' }, { status: 404 })

    await prisma.habitLog.update({
      where: { id: log.id },
      data: { reflection }
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error saving reflection:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
} 